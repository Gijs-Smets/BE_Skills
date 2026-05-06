-- All students
SELECT * FROM project.student ORDER BY lastname, firstname;

-- Students per class
SELECT class, COUNT(*) AS student_count
FROM project.student
GROUP BY class
ORDER BY class;

-- Students who have never received an award
SELECT s.*
FROM project.student s
LEFT JOIN project.award a ON s.student_id = a.student_id
WHERE a.award_id IS NULL;

-- All awards with full details (student, achievement, category, teacher)
SELECT concat(s.firstname, ' ' , s.lastname) AS student, s.class, c.name AS category, ac.title AS achievement, ac.requirement,
	concat(t.firstname, ' ' , t.lastname) AS awarded_by, a.date_awarded
FROM project.award a
JOIN project.student s ON s.student_id = a.student_id
JOIN project.achievement ac ON ac.achievement_id = a.achievement_id
JOIN project.category c ON c.category_id = ac.category_id
LEFT JOIN project.teacher t ON t.teacher_id = a.awarded_by
ORDER BY a.date_awarded DESC;

-- Number of awards per student (ranking)
SELECT concat(s.firstname, ' ' , s.lastname) AS student, s.class, COUNT(a.award_id) AS total_awards
FROM project.student s
LEFT JOIN project.award a ON s.student_id = a.student_id
GROUP BY s.student_id, s.firstname, s.lastname, s.class
ORDER BY total_awards DESC;

-- Number of awards given per teacher
SELECT concat(t.firstname, ' ' , t.lastname) AS teacher, COUNT(a.award_id) AS awards_given
FROM project.teacher t
LEFT JOIN project.award a ON a.awarded_by = t.teacher_id
GROUP BY t.teacher_id, t.firstname, t.lastname
ORDER BY awards_given DESC;

-- Awards per class
SELECT s.class, COUNT(a.award_id) AS total_awards
FROM project.student s
LEFT JOIN project.award a ON a.student_id = s.student_id
GROUP BY s.class
ORDER BY total_awards DESC;

-- ACHIEVEMENTS NOT YET AWARDED TO ANYONE
SELECT ac.title, ac.requirement, c.name AS category
FROM project.achievement ac
JOIN project.category c ON c.category_id = ac.category_id
LEFT JOIN project.award a ON a.achievement_id = ac.achievement_id
WHERE a.award_id IS NULL
ORDER BY c.name, ac.title;

-- Number of achievements held by a specific student
SELECT COUNT(*) AS achievement_count
FROM project.award
WHERE student_id = 1;

-- Total number of achievements
SELECT COUNT(*) AS total_achievements
FROM project.achievement;

-- Basic information of all achievements
SELECT a.achievement_id, a.title, a.requirement, c.name AS category
FROM project.achievement a
JOIN project.category c ON a.category_id = c.category_id
ORDER BY a.achievement_id;

-- Number of students that hold a specific achievement
SELECT a.title AS achievement, COUNT(aw.student_id) AS students_with_achievement
FROM project.achievement a
LEFT JOIN project.award aw ON a.achievement_id = aw.achievement_id
WHERE a.achievement_id = 1
GROUP BY a.achievement_id;

-- All information about achievements held by a specific student
SELECT
    a.title AS achievement_title,
    c.name AS category,
    concat(t.firstname, ' ' , t.lastname) AS awarded_by,
    aw.date_awarded
FROM project.award aw
JOIN project.student s ON aw.student_id = s.student_id
JOIN project.achievement a ON aw.achievement_id = a.achievement_id
JOIN project.category c ON a.category_id = c.category_id
LEFT JOIN project.teacher t ON aw.awarded_by = t.teacher_id
WHERE s.student_id = 1
ORDER BY aw.date_awarded DESC;