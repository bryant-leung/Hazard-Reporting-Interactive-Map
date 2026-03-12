from sqlalchemy import Column, Float, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(Integer, primary_key=True, index=True)
    reporter_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="reported")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float, nullable = False)
    longitude = Column (Float, nullable = False)