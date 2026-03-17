from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI
from services.heatmap_gen import get_heatmap_data
from services.add_report import add_report
from database import Base, engine, get_db
from models import User, Hazard, StatusUpdate
import schemas

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/heatmap") #crete api endpoint
def heatmap_params(
    start_time: Optional[datetime] = None, #default is none
    end_time: Optional[datetime] = None, #default is none
    db: Session = Depends(get_db)  #fastapi function to automatically open and close the database
):
    return get_heatmap_data(db, start_time, end_time) #call the function to get the heatmap data from the database

@app.post("/report")
def create_report(
    report: schemas.HazardCreate, # Use a schema to handle the JSON body
    db: Session = Depends(get_db)
):
    return add_report(
        db, 
        user_id=report.user_id, 
        hazard_category=report.hazard_category, 
        description=report.description, 
        latitude=report.latitude, 
        longitude=report.longitude, 
        location_name=report.location_name
    )