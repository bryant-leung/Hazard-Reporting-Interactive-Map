from datetime import datetime
from typing import Optional
from fastapi import FastAPI
from database import Base, engine
from models import  Hazard
from sqlalchemy.orm import Session, DateTime

def add_report(db: Session,  user_id: int, hazard_category: str, description: str, latitude: float, longitude: float): #Don't need an explicit report id or created at time, database should automatically create these
    new_hazard = Hazard(reporter_user_id=user_id,category=hazard_category,description=description,latitude=latitude,longitude=longitude)
    db.add(new_hazard)
    db.commit()
    db.refresh() #need to refresh to pull the generated id/timestamp back to the object

    return new_hazard
