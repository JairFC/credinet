# backend/Dockerfile

FROM python:3.11-slim

# Instalar curl para el healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /code
ENV PYTHONPATH=/code

COPY ./requirements.txt /code/
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code/

# No se puede ejecutar el smoke test aquí porque la BD no está disponible durante el build.
# Se mantiene el servicio smoke-tester en docker-compose.yml como la mejor práctica.

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
