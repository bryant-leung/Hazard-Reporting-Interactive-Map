from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# What a resident sends when submitting a new hazard report
class HazardCreate(BaseModel):
    category: str
    description: str
    latitude: float
    longitude: float

# What gets returned when viewing a hazard
class HazardResponse(BaseModel):
    id: int
    reporter_user_id: int
    category: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True