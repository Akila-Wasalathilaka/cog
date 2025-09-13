#!/usr/bin/env python3
"""
Script to check current data in the database
"""

from database import SessionLocal
from models import User, JobRole, Game, Assessment
import sys

def check_data():
    """Check current data in the database"""
    try:
        db = SessionLocal()
        
        print("=== DATABASE STATUS ===")
        
        # Check users
        users = db.query(User).all()
        print(f"Users: {len(users)}")
        for user in users:
            print(f"  - {user.username} ({user.role})")
        
        # Check games
        games = db.query(Game).all()
        print(f"\nGames: {len(games)}")
        for game in games:
            print(f"  - {game.code}: {game.title}")
        
        # Check job roles
        job_roles = db.query(JobRole).all()
        print(f"\nJob Roles: {len(job_roles)}")
        for role in job_roles:
            print(f"  - {role.title}")
            print(f"    Required games: {role.required_games}")
            print(f"    Traits: {role.traits_json}")
        
        # Check assessments
        assessments = db.query(Assessment).all()
        print(f"\nAssessments: {len(assessments)}")
        for assessment in assessments:
            candidate = db.query(User).filter(User.id == assessment.candidate_id).first()
            candidate_name = candidate.username if candidate else "Unknown"
            print(f"  - {assessment.id} ({assessment.status}) - {candidate_name}")
        
        db.close()
        
    except Exception as e:
        print(f"Error checking data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_data()