from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.hazard import Hazard
from models.status_update import StatusUpdate
from schemas.status_update import StatusUpdateRequest, StatusUpdateResponse

ALLOWED_TRANSITIONS = {
    "Reported": ["In Progress", "Fixed"],
    "In Progress": ["Fixed"],
    "Fixed": []
}

# checks if transition is allowed
def validate_transition(current_status: str, new_status: str):

    # Check current status is a valid known status
    if current_status not in ALLOWED_TRANSITIONS:  
        # error if current status is not known 
        raise HTTPException(status_code=400, detail=f"'{current_status}' is not a recognised status.")
    
    # Check the transition is allowed
    if new_status not in ALLOWED_TRANSITIONS[current_status]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'. "
                   f"Allowed transitions from '{current_status}': "
                   f"{ALLOWED_TRANSITIONS[current_status] or 'none (final state)'}"
        )
    
"""
Main function that:
    1. Finds the hazard
    2. Validates the transition
    3. Updates the hazard status
    4. Records the change in status_updates table
    5. Returns the status update record
"""
def update_hazard_status(hazard_id: int, request: StatusUpdateRequest, staff_user_id: int, db: Session) -> StatusUpdateResponse:

    # find the hazard from the db
    hazard = db.query(Hazard).filter(Hazard.id == hazard_id).first()
    
    if not hazard:
        raise HTTPException(
            status_code=404,
            detail=f"Hazard with id {hazard_id} not found."
        )
    
    # using the validate_transition func that I defined earlier
    validate_transition(hazard.status, request.new_status)

    # record old status before changing it
    old_status = hazard.status

    # update the hazard status
    hazard.status = request.new_status

    # create a record in status_updates table
    status_update = StatusUpdate(
        hazard_id=hazard_id,
        staff_user_id=staff_user_id,
        old_status=old_status,
        new_status=request.new_status,
        note=request.note
    )

    # save changes to the database
    db.add(status_update)
    db.commit()
    db.refresh(status_update)

    return status_update


