import logging
from typing import List, Optional
from app.models.schemas import TelemetryRecord

logger = logging.getLogger('forgeiq.telemetry')

class TelemetryService:
    def __init__(self):
        self._records: List[TelemetryRecord] = []
        self._max_in_memory = 1000

    def record(self, record: TelemetryRecord):
        # Enforce sanitization
        if record.error_message:
            for secret_word in ['key', 'token', 'secret', 'password', 'bearer']:
                if secret_word in record.error_message.lower():
                    record.error_message = '[SANITIZED_ERROR_CONTAINING_KEYWORD]'
                    
        self._records.append(record)
        if len(self._records) > self._max_in_memory:
            self._records.pop(0)

        logger.info(
            f"[AI Telemetry] req={record.request_id} org={record.org_id} "
            f"agent={record.agent_used} provider={record.provider} "
            f"latency={record.latency_ms:.1f}ms conf={record.confidence:.2f}"
        )

    def get_recent(self, org_id: Optional[str] = None, limit: int = 50) -> List[TelemetryRecord]:
        if org_id:
            filtered = [r for r in self._records if r.org_id == org_id]
            return filtered[-limit:]
        return self._records[-limit:]

telemetry_service = TelemetryService()
