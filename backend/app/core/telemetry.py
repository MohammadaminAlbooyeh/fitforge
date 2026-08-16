"""Distributed tracing (OpenTelemetry -> OTLP, e.g. Jaeger) and Prometheus metrics.

Opt-in via OTEL_ENABLED so local `pytest`/dev-without-docker runs don't need a
collector reachable. When enabled, traces are exported over OTLP/gRPC.
"""
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.database import engine


def setup_telemetry(app: FastAPI) -> None:
    settings = get_settings()

    # /metrics is cheap and safe to always expose; Prometheus scrapes it at will.
    Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

    if not settings.OTEL_ENABLED:
        return

    resource = Resource.create({SERVICE_NAME: settings.OTEL_SERVICE_NAME})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT, insecure=True))
    )
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument(engine=engine)
