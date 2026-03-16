import pytest
from fastapi import HTTPException
from services.status_workflow import validate_transition, ALLOWED_TRANSITIONS


def test_allowed_transitions_structure():
    assert "Reported" in ALLOWED_TRANSITIONS
    assert "In Progress" in ALLOWED_TRANSITIONS
    assert "Fixed" in ALLOWED_TRANSITIONS

def test_reported_can_transition_to_in_progress():
    assert "In Progress" in ALLOWED_TRANSITIONS["Reported"]

def test_reported_can_transition_to_fixed():
    assert "Fixed" in ALLOWED_TRANSITIONS["Reported"]

def test_in_progress_can_transition_to_fixed():
    assert "Fixed" in ALLOWED_TRANSITIONS["In Progress"]

def test_fixed_has_no_transitions():
    assert ALLOWED_TRANSITIONS["Fixed"] == []

def test_in_progress_cannot_go_back_to_reported():
    assert "Reported" not in ALLOWED_TRANSITIONS["In Progress"]


def test_validate_reported_to_in_progress():
    validate_transition("Reported", "In Progress")

def test_validate_reported_to_fixed():
    validate_transition("Reported", "Fixed")

def test_validate_in_progress_to_fixed():
    validate_transition("In Progress", "Fixed")


def test_validate_fixed_to_reported_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("Fixed", "Reported")
    assert exc_info.value.status_code == 400

def test_validate_fixed_to_in_progress_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("Fixed", "In Progress")
    assert exc_info.value.status_code == 400

def test_validate_in_progress_to_reported_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("In Progress", "Reported")
    assert exc_info.value.status_code == 400

def test_validate_unknown_current_status_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("pending", "Fixed")
    assert exc_info.value.status_code == 400

def test_validate_unknown_new_status_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("Reported", "archived")
    assert exc_info.value.status_code == 400

def test_validate_lowercase_status_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("reported", "in progress")
    assert exc_info.value.status_code == 400

def test_validate_same_status_raises_error():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("Reported", "Reported")
    assert exc_info.value.status_code == 400


def test_error_message_contains_current_status():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("Fixed", "Reported")
    assert "Fixed" in exc_info.value.detail

def test_error_message_contains_new_status():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("In Progress", "Reported")
    assert "Reported" in exc_info.value.detail

def test_unrecognised_status_error_message():
    with pytest.raises(HTTPException) as exc_info:
        validate_transition("unknown_status", "Fixed")
    assert "not a recognised status" in exc_info.value.detail