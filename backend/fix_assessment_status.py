#!/usr/bin/env python3
"""
Script to fix assessment statuses from CREATED to NOT_STARTED
"""

from database import SessionLocal
from models import Assessment
import sys

def fix_assessment_status():
    """Fix assessment statuses from CREATED to NOT_STARTED"""
    try:
        db = SessionLocal()
        
        # Find assessments with CREATED status
        assessments = db.query(Assessment).filter(Assessment.status == "CREATED").all()
        
        print(f"Found {len(assessments)} assessments with CREATED status")
        
        for assessment in assessments:
            assessment.status = "NOT_STARTED"
            print(f"Updated assessment {assessment.id} to NOT_STARTED")
        
        db.commit()
        print("All assessments updated successfully!")
        
        db.close()
        
    except Exception as e:
        print(f"Error fixing assessment status: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_assessment_status()