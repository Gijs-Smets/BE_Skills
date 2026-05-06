student_award_count = "SELECT COUNT(*) AS achievement_count FROM project.award WHERE student_id = %s;"

total_achievement_count = "SELECT COUNT(*) AS total_achievements FROM project.achievement;"

basic_achievement_info = "SELECT a.achievement_id, a.title, a.requirement, c.name AS category FROM project.achievement a JOIN project.category c ON a.category_id = c.category_id ORDER BY a.achievement_id"

basic_achievement_stats = "SELECT a.title AS achievement, COUNT(aw.student_id) AS students_with_achievement FROM project.achievement a LEFT JOIN project.award aw ON a.achievement_id = aw.achievement_id WHERE a.achievement_id = %s GROUP BY a.achievement_id;"

student_award_info = "SELECT a.title AS achievement_title, c.name AS category, concat(t.firstname, ' ' , t.lastname) AS awarded_by, aw.date_awarded FROM project.award aw JOIN project.student s ON aw.student_id = s.student_id JOIN project.achievement a ON aw.achievement_id = a.achievement_id JOIN project.category c ON a.category_id = c.category_id LEFT JOIN project.teacher t ON aw.awarded_by = t.teacher_id WHERE s.student_id = %s ORDER BY aw.date_awarded DESC;"
