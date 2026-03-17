from sqlalchemy.orm import Session
from models import Hazard

def add_report(db: Session, user_id: int, hazard_category: str, description: str, latitude: float, longitude: float, location_name: str = "Map Pin"): 
    # Added location_name and status to match the Supabase table schema
    new_hazard = Hazard(
        reporter_user_id=user_id,
        category=hazard_category,
        description=description,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        status="Reported"
    )
    
    db.add(new_hazard)
    db.commit()
    
    db.refresh(new_hazard) 

    return new_hazard