from datetime import datetime
from typing import Optional
from fastapi import FastAPI
from database import Base, engine
from models import  Hazard
from sqlalchemy.orm import Session
from sqlalchemy import DateTime

#Purpose of this function is to grab and send the required data from the database to the frontend, where the heatmap will be generated with heatmap.js

def get_heatmap_data(db: Session, start_time: Optional[datetime], end_time: Optional[datetime]): #UNFINISHED

    query = db.query(Hazard)

    if start_time:
        query = query.filter(Hazard.created_at >= start_time)
    if end_time:
        query = query.filter(Hazard.created_at <= end_time) #if there is a provided start and end time, filer the query, doing it in this

    hazards = query.all()

    return [{
            "lat": hazard.latitude,
            "lng": hazard.longitude,
            "value": 1 # to be updated when we add a severity score to the database schema
        } for hazard in hazards ]