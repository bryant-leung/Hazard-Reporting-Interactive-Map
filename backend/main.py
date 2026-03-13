from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI
from services.heatmap_gen import get_heatmap_data
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