from enum import Enum

class TruthState(str, Enum):
    LIVE = "LIVE"
    SANDBOX = "SANDBOX"
    ADAPTER_READY = "ADAPTER_READY"
    DEMO_DATA = "DEMO_DATA"

class VerificationStatus(str, Enum):
    SELF_REPORTED = "self_reported"
    AI_INFERRED_PENDING_CONFIRMATION = "ai_inferred_pending_confirmation"
    BENEFICIARY_CONFIRMED = "beneficiary_confirmed"
    FIELD_WORKER_VERIFIED = "field_worker_verified"
    DOCUMENT_VERIFIED = "document_verified"
    EXTERNAL_SOURCE_VERIFIED = "external_source_verified"

class QualificationValidity(str, Enum):
    CURRENT = "current"
    FUTURE_NOT_YET_EFFECTIVE = "future_not_yet_effective"
    EXPIRED = "expired"
    SUPERSEDED = "superseded"
    UNCONFIRMED_STALE = "unconfirmed_stale"
