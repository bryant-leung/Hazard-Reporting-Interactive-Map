from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Enum, ForeignKey
from sqlalchemy.sql import func
from database import Base
import enum

class HazardCategory(enum.Enum):
    Infrastructure = "Infrastructure"
    Blocked_Access = "Blocked Access"
    Safety_Hazard = "Safety Hazard"
    Vandalism = "Vandalism"
    Other = "Other"

class HazardStatus(enum.Enum):
    Reported = "Reported"
    In_Progress = "In Progress"
    Fixed = "Fixed"

class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(Integer, primary_key=True, index=True)
    reporter_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(HazardCategory, name="hazard_category"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(
        Enum(HazardStatus, name="hazard_status"), 
        nullable=False, 
        default="Reported"
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)