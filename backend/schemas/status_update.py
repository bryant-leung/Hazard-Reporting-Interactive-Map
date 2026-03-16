from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# What the staff member sends when updating a status
class StatusUpdateRequest(BaseModel):
    new_status: str
    note: Optional[str] = None

# What gets returned to the client after a status update
class StatusUpdateResponse(BaseModel):
    id: int
    hazard_id: int
    staff_user_id: int
    old_status: str
    new_status: str
    note: Optional[str]
    updated_at: datetime

    class Config: from_attributes = True