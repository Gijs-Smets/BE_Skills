from fastapi import FastAPI

import config
import database
import queries as qr
import award_queries as aq


app = FastAPI(docs_url=config.docs_url)

@app.get("/hello")
def hello_world(message: str = "Hello World!"):
    return {"message": message}

@app.get("/createDatabase")
def insert_SQL_file():
    with open('sql_files/school_schema.sql', "r", encoding="utf-8") as sql_file:
        sql_queries = sql_file.read()

    success = database.execute_sql_query(sql_queries)
    return {"success": success}

@app.get("/students")
def students():
    query = qr.student_name_query
    names = database.execute_sql_query(query)
    return {"Students": names}

@app.get("/teachers")
def teachers():
    query = qr.teacher_name_query
    names = database.execute_sql_query(query)
    return {"Teachers": names}

@app.get("/class")
def awards():
    query = qr.award_class
    classes = database.execute_sql_query(query)
    return {"Klassen": classes}

@app.get("/students/awards")
def awards():
    query = qr.award_student
    awards = database.execute_sql_query(query)
    award = []
    for i in awards:
        award.append({i[0]:[i[1],i[2]]})
    return {"Awards": award}

@app.get("/teachers/awards")
def awards():
    query = qr.award_teacher
    awards = database.execute_sql_query(query)
    award = []
    for i in awards:
        award.append({i[0]:i[1]})
    return {"Awards": award}

# --- Award endpoints ---

@app.get("/achievements")
def get_all_achievements():
    achievements = database.execute_sql_query(aq.basic_achievement_info)
    result = []
    for row in achievements:
        result.append({
            "achievement_id": row[0],
            "title": row[1],
            "requirement": row[2],
            "category": row[3]
        })
    return {"Achievements": result}


@app.get("/achievements/count")
def get_total_achievement_count():
    result = database.execute_sql_query(aq.total_achievement_count)
    return {"total_achievements": result[0][0]}


@app.get("/achievements/stats")
def get_achievement_stats(achievement_id: int):
    result = database.execute_sql_query(aq.basic_achievement_stats, (achievement_id,))
    return {
        "achievement": result[0][0],
        "students_with_achievement": result[0][1]
    }


@app.get("/students/achievements/count")
def get_student_achievement_count(student_id: int):
    result = database.execute_sql_query(aq.student_award_count, (student_id,))
    return {
        "student_id": student_id,
        "achievement_count": result[0][0]
    }


@app.get("/students/achievements")
def get_student_achievements(student_id: int):
    results = database.execute_sql_query(aq.student_award_info, (student_id,))
    achievements = []
    for row in results:
        achievements.append({
            "title": row[0],
            "category": row[1],
            "awarded_by": row[2],
            "date_awarded": str(row[3]) if row[3] else None
        })
    return {
        "student_id": student_id,
        "achievements": achievements
    }