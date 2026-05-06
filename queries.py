student_name_query = "SELECT * FROM project.student;"

teacher_name_query = "SELECT * FROM project.teacher;"

no_award_student = "SELECT s.* FROM project.student s LEFT JOIN project.award a ON s.student_id = a.student_id WHERE a.award_id IS NULL;"

award_student = "SELECT concat(s.firstname, ' ' , s.lastname) AS student, s.class, COUNT(a.award_id) AS total_awards FROM project.student s LEFT JOIN project.award a ON s.student_id = a.student_id GROUP BY s.student_id, s.firstname, s.lastname, s.class ORDER BY total_awards DESC;"

award_teacher = "SELECT concat(t.firstname, ' ' , t.lastname) AS teacher, COUNT(a.award_id) AS awards_given FROM project.teacher t LEFT JOIN project.award a ON a.awarded_by = t.teacher_id GROUP BY t.teacher_id, t.firstname, t.lastname ORDER BY awards_given DESC;"

award_class = "SELECT s.class, COUNT(a.award_id) AS total_awards FROM project.student s LEFT JOIN project.award a ON a.student_id = s.student_id GROUP BY s.class ORDER BY total_awards DESC;"

not_award_achievement = "SELECT ac.title, ac.requirement, c.name AS category FROM project.achievement ac JOIN project.category c ON c.category_id = ac.category_id LEFT JOIN project.award a ON a.achievement_id = ac.achievement_id WHERE a.award_id IS NULL ORDER BY c.name, ac.title;"