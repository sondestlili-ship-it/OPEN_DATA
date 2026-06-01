"""
Airflow initialization file for plugins
"""

from airflow.plugins_manager import AirflowPlugin
from foodfact_operators import (
    BackendHealthCheckOperator,
    CacheWarmupOperator,
    DataQualityCheckOperator,
)


class FoodFactPlugin(AirflowPlugin):
    name = "foodfact"
    operators = [
        BackendHealthCheckOperator,
        CacheWarmupOperator,
        DataQualityCheckOperator,
    ]
