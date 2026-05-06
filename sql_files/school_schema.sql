DROP TABLE IF EXISTS project.award;
DROP TABLE IF EXISTS project.achievement;
DROP TABLE IF EXISTS project.category;
DROP TABLE IF EXISTS project.student;
DROP TABLE IF EXISTS project.teacher;


DROP SCHEMA IF EXISTS project;
CREATE SCHEMA project;

CREATE TABLE project.student (
    student_id INT PRIMARY KEY,
    firstname varchar(50) not null,
    lastname varchar(50) not null,
    class varchar(50),
    constraint UQ_student unique(firstname, lastname)
);

CREATE TABLE project.teacher (
    teacher_id INT PRIMARY KEY,
    firstname varchar(50) not null,
    lastname varchar(50) not null,
    constraint UQ_teacher unique(firstname, lastname)
);

CREATE TABLE project.category (
    category_id INT PRIMARY KEY,
    name varchar(100) not null unique
);

CREATE TABLE project.achievement (
    achievement_id INT PRIMARY KEY,
    title varchar(100) not null unique,
    requirement varchar(500),
    category_id INT not null,
	constraint FK_achievement_category FOREIGN KEY (category_id) REFERENCES project.category(category_id)
);

CREATE TABLE project.award (
    award_id INT PRIMARY KEY,
    student_id INT not null,
    achievement_id INT not null,
    awarded_by INT,
    date_awarded DATE,
    constraint UQ_award unique(student_id, achievement_id),
    constraint FK_award_student FOREIGN KEY (student_id) REFERENCES project.student(student_id),
    constraint FK_award_achievement FOREIGN KEY (achievement_id) REFERENCES project.achievement(achievement_id),
    constraint FK_award_teacher FOREIGN KEY (awarded_by) REFERENCES project.teacher(teacher_id)
);
