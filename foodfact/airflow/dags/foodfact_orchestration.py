"""
FoodFact Data Orchestration DAG

Orchestrates the collection, processing, and caching of food product data
from OpenFoodFacts API for the FoodFact application.

Architecture:
- Data Ingestion: Fetch data from OpenFoodFacts API
- Data Processing: Clean, transform, and validate data
- Cache Update: Update backend cache with fresh data
- Quality Checks: Validate data quality and consistency
- Notifications: Alert on failures or anomalies
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.http.operators.http import SimpleHttpOperator
from airflow.providers.http.sensors.http import HttpSensor
from airflow.exceptions import AirflowException
import json
import requests
from typing import Any, Dict
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# Default Arguments
# ============================================================================

default_args = {
    'owner': 'foodfact-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': False,
    'email_on_retry': False,
    'start_date': datetime(2024, 1, 1),
    'tags': ['foodfact', 'data-pipeline'],
}

# ============================================================================
# DAG Definition
# ============================================================================

dag = DAG(
    'foodfact_data_orchestration',
    default_args=default_args,
    description='FoodFact data collection and cache orchestration pipeline',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    max_active_runs=1,
    tags=['foodfact', 'orchestration'],
)

# ============================================================================
# Task Functions
# ============================================================================

def health_check(**context):
    """Verify backend and OpenFoodFacts API availability"""
    logger.info("Starting health check...")
    
    # Check backend health
    try:
        response = requests.get(
            'http://backend:8080/health',
            timeout=5
        )
        if response.status_code != 200:
            raise AirflowException(
                f"Backend health check failed with status {response.status_code}"
            )
        logger.info("✓ Backend health check passed")
    except Exception as e:
        raise AirflowException(f"Backend health check failed: {str(e)}")
    
    # Check OpenFoodFacts API availability
    try:
        response = requests.get(
            'https://world.openfoodfacts.org/cgi/search.pl?search_terms=apple&json=1&page_size=1',
            timeout=10
        )
        if response.status_code != 200:
            raise AirflowException(
                f"OpenFoodFacts API check failed with status {response.status_code}"
            )
        logger.info("✓ OpenFoodFacts API health check passed")
    except Exception as e:
        raise AirflowException(f"OpenFoodFacts API check failed: {str(e)}")
    
    context['task_instance'].xcom_push(key='health_check_passed', value=True)
    logger.info("Health checks completed successfully")


def fetch_popular_products(**context):
    """Fetch popular products from OpenFoodFacts to warm up cache"""
    logger.info("Fetching popular products from OpenFoodFacts...")
    
    popular_searches = [
        'apple', 'bread', 'milk', 'cheese', 'yogurt', 'pasta', 'rice',
        'chicken', 'tomato', 'banana', 'coffee', 'chocolate', 'salt', 'oil'
    ]
    
    fetched_data = {
        'timestamp': datetime.now().isoformat(),
        'total_products': 0,
        'searches_count': len(popular_searches),
        'search_results': []
    }
    
    for search_term in popular_searches:
        try:
            response = requests.get(
                'https://world.openfoodfacts.org/cgi/search.pl',
                params={
                    'search_terms': search_term,
                    'search_simple': '1',
                    'action': 'process',
                    'json': '1',
                    'page_size': 50,
                    'fields': 'code,product_name,brands,nutriscore_grade,nova_group'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                fetched_data['total_products'] += count
                fetched_data['search_results'].append({
                    'search': search_term,
                    'count': count
                })
                logger.info(f"✓ Fetched {count} products for '{search_term}'")
            else:
                logger.warning(f"⚠ Failed to fetch '{search_term}': {response.status_code}")
                
        except Exception as e:
            logger.warning(f"⚠ Error fetching '{search_term}': {str(e)}")
    
    logger.info(f"Total products fetched: {fetched_data['total_products']}")
    context['task_instance'].xcom_push(key='fetched_data', value=fetched_data)


def warm_up_backend_cache(**context):
    """Warm up backend cache with popular searches"""
    logger.info("Warming up backend cache...")
    
    ti = context['task_instance']
    fetched_data = ti.xcom_pull(task_ids='fetch_popular_products', key='fetched_data')
    
    if not fetched_data:
        raise AirflowException("No fetched data available")
    
    popular_searches = [
        'apple', 'bread', 'milk', 'cheese', 'yogurt', 'pasta', 'rice',
        'chicken', 'tomato', 'banana'
    ]
    
    cache_stats = {
        'timestamp': datetime.now().isoformat(),
        'warmed_up_searches': 0,
        'total_attempts': len(popular_searches),
        'failures': []
    }
    
    for search_term in popular_searches:
        try:
            response = requests.get(
                'http://backend:8080/api/search',
                params={
                    'q': search_term,
                    'pageSize': 50
                },
                timeout=10
            )
            
            if response.status_code == 200:
                cache_stats['warmed_up_searches'] += 1
                logger.info(f"✓ Warmed cache for '{search_term}'")
            else:
                cache_stats['failures'].append(search_term)
                logger.warning(f"⚠ Failed to warm cache for '{search_term}': {response.status_code}")
                
        except Exception as e:
            cache_stats['failures'].append(search_term)
            logger.warning(f"⚠ Error warming cache for '{search_term}': {str(e)}")
    
    logger.info(f"Cache warmup completed: {cache_stats['warmed_up_searches']}/{cache_stats['total_attempts']} successful")
    ti.xcom_push(key='cache_stats', value=cache_stats)


def data_quality_check(**context):
    """Validate data quality from backend"""
    logger.info("Starting data quality checks...")
    
    ti = context['task_instance']
    cache_stats = ti.xcom_pull(task_ids='warm_up_backend_cache', key='cache_stats')
    
    if not cache_stats:
        raise AirflowException("No cache stats available")
    
    # Check cache warmup success rate
    success_rate = cache_stats['warmed_up_searches'] / cache_stats['total_attempts'] * 100
    
    quality_report = {
        'timestamp': datetime.now().isoformat(),
        'success_rate': success_rate,
        'warmed_searches': cache_stats['warmed_up_searches'],
        'total_attempts': cache_stats['total_attempts'],
        'status': 'PASSED' if success_rate >= 80 else 'WARNING'
    }
    
    logger.info(f"Quality check result: {quality_report['status']} (Success rate: {success_rate:.1f}%)")
    
    if success_rate < 50:
        raise AirflowException(f"Data quality check failed: success rate too low ({success_rate:.1f}%)")
    
    ti.xcom_push(key='quality_report', value=quality_report)


def generate_pipeline_report(**context):
    """Generate and log pipeline execution report"""
    logger.info("Generating pipeline execution report...")
    
    ti = context['task_instance']
    
    # Collect data from all tasks
    report = {
        'execution_date': datetime.now().isoformat(),
        'dag_id': context['dag'].dag_id,
        'run_id': context['run_id'],
        'status': 'SUCCESS',
    }
    
    # Add task-specific data
    try:
        health_check = ti.xcom_pull(task_ids='health_check', key='health_check_passed')
        fetched_data = ti.xcom_pull(task_ids='fetch_popular_products', key='fetched_data')
        cache_stats = ti.xcom_pull(task_ids='warm_up_backend_cache', key='cache_stats')
        quality_report = ti.xcom_pull(task_ids='data_quality_check', key='quality_report')
        
        report.update({
            'health_check': health_check,
            'products_fetched': fetched_data.get('total_products', 0) if fetched_data else 0,
            'cache_warmed': cache_stats.get('warmed_up_searches', 0) if cache_stats else 0,
            'quality_status': quality_report.get('status', 'UNKNOWN') if quality_report else 'UNKNOWN'
        })
    except Exception as e:
        logger.warning(f"Some report data unavailable: {str(e)}")
    
    logger.info("=" * 70)
    logger.info("PIPELINE EXECUTION REPORT")
    logger.info("=" * 70)
    logger.info(json.dumps(report, indent=2))
    logger.info("=" * 70)
    
    ti.xcom_push(key='pipeline_report', value=report)


# ============================================================================
# Task Definitions
# ============================================================================

task_health_check = PythonOperator(
    task_id='health_check',
    python_callable=health_check,
    dag=dag,
    pool='default_pool',
)

task_fetch_data = PythonOperator(
    task_id='fetch_popular_products',
    python_callable=fetch_popular_products,
    dag=dag,
    pool='default_pool',
)

task_warm_cache = PythonOperator(
    task_id='warm_up_backend_cache',
    python_callable=warm_up_backend_cache,
    dag=dag,
    pool='default_pool',
)

task_quality_check = PythonOperator(
    task_id='data_quality_check',
    python_callable=data_quality_check,
    dag=dag,
    pool='default_pool',
)

task_generate_report = PythonOperator(
    task_id='generate_pipeline_report',
    python_callable=generate_pipeline_report,
    dag=dag,
    pool='default_pool',
)

# ============================================================================
# DAG Dependencies
# ============================================================================

task_health_check >> task_fetch_data >> task_warm_cache >> task_quality_check >> task_generate_report
