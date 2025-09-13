#!/usr/bin/env python3
"""
Migration script to add traits_json column to job_roles table
"""

from database import engine, SessionLocal
from sqlalchemy import text
import sys

def migrate_job_roles():
    """Add traits_json column to job_roles table if it doesn't exist"""
    try:
        db = SessionLocal()
        
        # Check if traits_json column exists
        result = db.execute(text("""
            SELECT COUNT(*) as count 
            FROM pragma_table_info('job_roles') 
            WHERE name = 'traits_json'
        """))
        
        column_exists = result.fetchone()[0] > 0
        
        if not column_exists:
            print("Adding traits_json column to job_roles table...")
            
            # Add the column
            db.execute(text("""
                ALTER TABLE job_roles 
                ADD COLUMN traits_json TEXT DEFAULT '{}'
            """))
            
            db.commit()
            print("traits_json column added successfully!")
        else:
            print("traits_json column already exists")
            
        db.close()
        
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Running job_roles migration...")
    migrate_job_roles()
    print("Migration complete!")