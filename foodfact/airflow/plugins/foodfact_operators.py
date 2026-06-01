"""
Custom operators and hooks for FoodFact Airflow integration
"""

import logging
from airflow.models import BaseOperator
from airflow.utils.decorators import apply_defaults
from airflow.exceptions import AirflowException
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class BackendHealthCheckOperator(BaseOperator):
    """
    Custom operator to perform health checks on FoodFact backend
    
    :param backend_url: URL of the FoodFact backend
    :param timeout: Request timeout in seconds
    """
    
    template_fields = ['backend_url']
    
    @apply_defaults
    def __init__(
        self,
        backend_url: str = 'http://backend:8080',
        timeout: int = 10,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.backend_url = backend_url
        self.timeout = timeout
    
    def execute(self, context):
        logger.info(f"Checking health of backend at {self.backend_url}")
        
        try:
            response = requests.get(
                f"{self.backend_url}/health",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✓ Backend is healthy: {data}")
                return {'status': 'healthy', 'response': data}
            else:
                raise AirflowException(
                    f"Backend health check failed with status {response.status_code}"
                )
        except requests.exceptions.Timeout:
            raise AirflowException(f"Backend health check timed out ({self.timeout}s)")
        except Exception as e:
            raise AirflowException(f"Backend health check failed: {str(e)}")


class CacheWarmupOperator(BaseOperator):
    """
    Custom operator to warm up backend cache with popular searches
    
    :param backend_url: URL of the FoodFact backend
    :param searches: List of search terms to warm up
    :param batch_size: Number of concurrent requests
    """
    
    template_fields = ['backend_url', 'searches']
    
    @apply_defaults
    def __init__(
        self,
        backend_url: str = 'http://backend:8080',
        searches: Optional[list] = None,
        batch_size: int = 5,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.backend_url = backend_url
        self.searches = searches or [
            'apple', 'bread', 'milk', 'cheese', 'yogurt',
            'pasta', 'rice', 'chicken', 'tomato', 'banana'
        ]
        self.batch_size = batch_size
    
    def execute(self, context):
        logger.info(f"Starting cache warmup with {len(self.searches)} searches")
        
        successful = 0
        failed = 0
        
        for search_term in self.searches:
            try:
                response = requests.get(
                    f"{self.backend_url}/api/search",
                    params={'q': search_term, 'pageSize': 50},
                    timeout=10
                )
                
                if response.status_code == 200:
                    successful += 1
                    logger.info(f"✓ Warmed cache for '{search_term}'")
                else:
                    failed += 1
                    logger.warning(
                        f"⚠ Cache warmup failed for '{search_term}': {response.status_code}"
                    )
            except Exception as e:
                failed += 1
                logger.error(f"Error warming cache for '{search_term}': {str(e)}")
        
        success_rate = (successful / len(self.searches)) * 100 if self.searches else 0
        logger.info(f"Cache warmup completed: {successful}/{len(self.searches)} successful ({success_rate:.1f}%)")
        
        if success_rate < 50:
            raise AirflowException(f"Cache warmup failed: too many failures ({failed}/{len(self.searches)})")
        
        return {
            'successful': successful,
            'failed': failed,
            'success_rate': success_rate
        }


class DataQualityCheckOperator(BaseOperator):
    """
    Custom operator to validate data quality from backend
    
    :param backend_url: URL of the FoodFact backend
    :param min_success_rate: Minimum success rate threshold (%)
    """
    
    template_fields = ['backend_url']
    
    @apply_defaults
    def __init__(
        self,
        backend_url: str = 'http://backend:8080',
        min_success_rate: float = 80.0,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.backend_url = backend_url
        self.min_success_rate = min_success_rate
    
    def execute(self, context):
        logger.info("Starting data quality checks")
        
        ti = context['task_instance']
        warmup_result = ti.xcom_pull(task_ids='warm_up_backend_cache')
        
        if not warmup_result:
            raise AirflowException("No warmup result available for quality check")
        
        success_rate = warmup_result.get('success_rate', 0)
        
        quality_check = {
            'timestamp': context['execution_date'].isoformat(),
            'success_rate': success_rate,
            'threshold': self.min_success_rate,
            'status': 'PASSED' if success_rate >= self.min_success_rate else 'FAILED'
        }
        
        logger.info(f"Quality check result: {quality_check['status']}")
        logger.info(f"Success rate: {success_rate:.1f}% (threshold: {self.min_success_rate}%)")
        
        if success_rate < self.min_success_rate:
            raise AirflowException(
                f"Data quality check failed: success rate {success_rate:.1f}% < {self.min_success_rate}%"
            )
        
        return quality_check
