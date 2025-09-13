#!/usr/bin/env python3
"""
Script to create a test candidate with assignments in the backend database.
"""
from database import SessionLocal
from models import User, JobRole, Assessment
from passlib.context import CryptContext
from datetime import datetime
import uuid

def create_test_candidate():
    db = SessionLocal()
    try:
        # Create a job role if not exists
        job_role = db.query(JobRole).filter_by(title="Test Role").first()
        if not job_role:
            job_role = JobRole(
                id=str(uuid.uuid4()),
                tenant_id=None,
                title="Test Role",
                description="Test job role for candidate",
                required_games=[],
                created_at=datetime.utcnow()
            )
            db.add(job_role)
            db.commit()
            db.refresh(job_role)

        # Create candidate
        username = f"testuser{str(uuid.uuid4())[:8]}"
        password = "TestPass123!"
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password_hash = pwd_context.hash(password)
        candidate = User(
            id=str(uuid.uuid4()),
            username=username,
            email=f"{username}@example.com",
            password_hash=password_hash,
            role="CANDIDATE",
            is_active=True,
            full_name="Test Candidate",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        # Create an assessment for the candidate
        assessment = Assessment(
            id=str(uuid.uuid4()),
            tenant_id=None,
            candidate_id=candidate.id,
            job_role_id=job_role.id,
            status="CREATED",
            started_at=None,
            completed_at=None,
            total_score=None,
            integrity_flags={}
        )
        db.add(assessment)
        db.commit()

        print(f"Test candidate created:")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"  Job Role: {job_role.title}")
        print(f"  Assessment ID: {assessment.id}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_candidate()
