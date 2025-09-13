from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import JobRole, User
from routers.auth import get_current_admin_user
from typing import List, Optional
from pydantic import BaseModel
import uuid

router = APIRouter()

# Pydantic models
class JobRoleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_games: Optional[List[str]] = []

class JobRoleResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    required_games: List[str]
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[JobRoleResponse])
async def get_job_roles(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all job roles"""
    job_roles = db.query(JobRole).all()
    return job_roles

@router.post("/", response_model=JobRoleResponse)
async def create_job_role(
    job_role: JobRoleCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Create a new job role"""
    # For now, we'll use a default tenant_id. In a multi-tenant system, this would come from the admin's tenant
    tenant_id = "default-tenant"  # This should be dynamic in a real multi-tenant setup

    db_job_role = JobRole(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        title=job_role.title,
        description=job_role.description,
        required_games=job_role.required_games or []
    )

    db.add(db_job_role)
    db.commit()
    db.refresh(db_job_role)
    return db_job_role

@router.delete("/{job_role_id}")
async def delete_job_role(
    job_role_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a job role"""
    job_role = db.query(JobRole).filter(JobRole.id == job_role_id).first()
    if not job_role:
        raise HTTPException(status_code=404, detail="Job role not found")

    db.delete(job_role)
    db.commit()
    return {"message": "Job role deleted successfully"}

@router.get("/{job_role_id}/analyze")
async def analyze_job_role(
    job_role_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Analyze job role requirements and provide insights"""
    job_role = db.query(JobRole).filter(JobRole.id == job_role_id).first()
    if not job_role:
        raise HTTPException(status_code=404, detail="Job role not found")

    # This would contain logic to analyze the job role requirements
    # For now, return basic info
    return {
        "job_role": job_role.title,
        "required_games": job_role.required_games,
        "analysis": "Analysis functionality to be implemented"
    }