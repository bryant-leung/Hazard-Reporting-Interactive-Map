from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class StatusUpdate(Base):
    __tablename__ = "status_updates"

    id = Column(Integer, primary_key=True, index=True)
    hazard_id = Column(Integer, ForeignKey("hazards.id"), nullable=False)
    staff_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())