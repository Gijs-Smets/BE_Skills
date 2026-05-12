# how many achievements a specific student has
student_award_count = """
SELECT COUNT(*) AS achievement_count
FROM project.award
WHERE student_id = %s;
"""

# total number of achievements
total_achievement_count = """
SELECT COUNT(*) AS total_achievements
FROM project.achievement;
"""

# which achievements a student has
student_achievements = """
SELECT a.achievement_id,
       a.title,
       a.requirement,
       c.name AS category
FROM project.award aw
JOIN project.achievement a
    ON aw.achievement_id = a.achievement_id
JOIN project.category c
    ON a.category_id = c.category_id
WHERE aw.student_id = %s;
"""

# how many students there are
student_count = """
SELECT COUNT(*) AS total_students
FROM project.student;
"""

# total number of awarded achievements
total_awarded_achievements = """
SELECT COUNT(*) AS total_awarded
FROM project.award;
"""

# basic information about each achievement
achievement_info = """
SELECT a.achievement_id,
       a.title,
       a.requirement,
       c.name AS category
FROM project.achievement a
JOIN project.category c
    ON a.category_id = c.category_id
ORDER BY a.achievement_id;
"""

# award an achievement to a student
award_achievement = """
INSERT INTO project.award
(award_id, student_id, achievement_id, awarded_by, date_awarded)
VALUES (%s, %s, %s, %s, %s);
"""

# add new achievement
add_achievement = """
INSERT INTO project.achievement
(achievement_id, title, requirement, category_id)
VALUES (%s, %s, %s, %s);
"""