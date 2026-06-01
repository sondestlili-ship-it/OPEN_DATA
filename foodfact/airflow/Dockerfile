FROM apache/airflow:2.7.3-python3.11

# Install additional dependencies
USER root
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Switch back to airflow user
USER airflow

# Copy requirements
COPY requirements.txt /requirements.txt
RUN pip install --user --no-cache-dir -r /requirements.txt

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    AIRFLOW__CORE__LOAD_EXAMPLES=False \
    AIRFLOW__CORE__LOAD_DEFAULT_CONNECTIONS=False

# Expose ports
EXPOSE 8080 8793

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD airflow jobs check-code || exit 1

# Default command
CMD ["airflow", "webserver"]
