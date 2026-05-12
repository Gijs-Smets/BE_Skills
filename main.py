from fastapi import FastAPI

import config
import database
import queries as qr
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(docs_url=config.docs_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
def hello_world(message: str = "Hello World!"):
    return {"message": message}

# how many achievements a specific student has
@app.get("/students/achievements/count")
def get_student_achievement_count(student_id: int):
    result = database.execute_sql_query(
        qr.student_award_count,
        (student_id,)
    )

    return {
        "student_id": student_id,
        "achievement_count": result[0][0]
    }


# total number of achievements
@app.get("/achievements/count")
def get_total_achievement_count():
    result = database.execute_sql_query(
        qr.total_achievement_count
    )

    return {
        "total_achievements": result[0][0]
    }


# which achievements a student has
@app.get("/students/achievements")
def get_student_achievements(student_id: int):
    result = database.execute_sql_query(
        qr.student_achievements,
        (student_id,)
    )

    achievements = []

    for row in result:
        achievements.append({
            "achievement_id": row[0],
            "title": row[1],
            "requirement": row[2],
            "category": row[3]
        })

    return {
        "student_id": student_id,
        "achievements": achievements
    }


# how many students there are
@app.get("/students/count")
def get_student_count():
    result = database.execute_sql_query(
        qr.student_count
    )

    return {
        "total_students": result[0][0]
    }


# total number of awarded achievements
@app.get("/awards/count")
def get_total_awarded_achievements():
    result = database.execute_sql_query(
        qr.total_awarded_achievements
    )

    return {
        "total_awarded_achievements": result[0][0]
    }


# basic information about each achievement
@app.get("/achievements")
def get_achievement_info():
    result = database.execute_sql_query(
        qr.achievement_info
    )

    achievements = []

    for row in result:
        achievements.append({
            "achievement_id": row[0],
            "title": row[1],
            "requirement": row[2],
            "category": row[3]
        })

    return achievements


# post endpoint for awarding an achievement to a student
@app.post("/awards")
def award_achievement_to_student(
    award_id: int,
    student_id: int,
    achievement_id: int,
    awarded_by: int,
    date_awarded: str
):
    database.execute_sql_query(
        qr.award_achievement,
        (
            award_id,
            student_id,
            achievement_id,
            awarded_by,
            date_awarded
        )
    )

    return {
        "message": "Achievement awarded successfully"
    }


# post endpoint for adding new achievement
@app.post("/achievements")
def create_achievement(
    achievement_id: int,
    title: str,
    requirement: str,
    category_id: int
):
    database.execute_sql_query(
        qr.add_achievement,
        (
            achievement_id,
            title,
            requirement,
            category_id
        )
    )

    return {
        "message": "Achievement added successfully"
    }

# all students: student_id and full name
@app.get("/students")
def get_all_students():
    result = database.execute_sql_query(
        qr.all_students
    )

    students = []

    for row in result:
        students.append({
            "student_id": row[0],
            "full_name": row[1]
        })

    return students