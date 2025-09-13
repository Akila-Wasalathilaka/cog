#!/usr/bin/env python3
"""
Script to update the test job role with required games and traits
"""

from database import SessionLocal
from models import JobRole, Game
import json
import sys

def update_job_role():
    """Update the test job role with required games and traits"""
    try:
        db = SessionLocal()
        
        # Get the test job role
        job_role = db.query(JobRole).filter(JobRole.title == "Test Role").first()
        if not job_role:
            print("Test Role not found")
            return
        
        # Get some games
        games = db.query(Game).limit(3).all()
        game_ids = [game.id for game in games]
        
        # Update the job role
        job_role.required_games = game_ids
        job_role.traits_json = {
            "memory": {"required": True, "weight": 0.3},
            "attention": {"required": True, "weight": 0.3},
            "processing_speed": {"required": True, "weight": 0.4}
        }
        
        db.commit()
        
        print(f"Updated job role '{job_role.title}':")
        print(f"  Required games: {job_role.required_games}")
        print(f"  Traits: {job_role.traits_json}")
        
        db.close()
        
    except Exception as e:
        print(f"Error updating job role: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_job_role()