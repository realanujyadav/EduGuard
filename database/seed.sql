-- EduGuard synthetic demo data
-- No real student information is used.

TRUNCATE TABLE interventions, academic_records, students
RESTART IDENTITY CASCADE;

-- -----------------------------------------------------
-- STUDENTS
-- -----------------------------------------------------

INSERT INTO students (name, roll_number, branch, semester)
SELECT
    'Demo Student ' || LPAD(g::text, 3, '0'),
    'EG' || LPAD(g::text, 3, '0'),
    CASE
        WHEN g % 3 = 1 THEN 'MCA'
        WHEN g % 3 = 2 THEN 'MCA'
        ELSE 'MCA'
    END,
    3
FROM generate_series(1, 30) AS g;

-- -----------------------------------------------------
-- ACADEMIC RECORDS
-- Different patterns create Low / Medium / High risk.
-- -----------------------------------------------------

INSERT INTO academic_records
    (student_id, attendance, assessment_score, previous_score,
     missing_assignments, engagement)
SELECT
    s.id,

    CASE
        WHEN s.roll_number IN ('EG001','EG002','EG003','EG004','EG005')
            THEN 85
        WHEN s.roll_number IN ('EG006','EG007','EG008','EG009','EG010')
            THEN 68
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 55
        ELSE 78
    END,

    CASE
        WHEN s.roll_number IN ('EG001','EG002','EG003','EG004','EG005')
            THEN 82
        WHEN s.roll_number IN ('EG006','EG007','EG008','EG009','EG010')
            THEN 58
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 42
        ELSE 72
    END,

    CASE
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 68
        WHEN s.roll_number IN ('EG006','EG007','EG008','EG009','EG010')
            THEN 65
        ELSE 78
    END,

    CASE
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 4
        WHEN s.roll_number IN ('EG006','EG007','EG008','EG009','EG010')
            THEN 2
        ELSE 0
    END,

    CASE
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 'Low'
        WHEN s.roll_number IN ('EG006','EG007','EG008','EG009','EG010')
            THEN 'Medium'
        ELSE 'High'
    END

FROM students s;

-- -----------------------------------------------------
-- INTERVENTIONS
-- -----------------------------------------------------

INSERT INTO interventions
    (student_id, status, notes)
SELECT
    s.id,
    CASE
        WHEN s.roll_number IN ('EG011','EG012','EG013')
            THEN 'Pending'
        WHEN s.roll_number IN ('EG014','EG015')
            THEN 'In Progress'
        WHEN s.roll_number IN ('EG006','EG007','EG008')
            THEN 'Completed'
        ELSE 'Pending'
    END,
    CASE
        WHEN s.roll_number IN ('EG011','EG012','EG013','EG014','EG015')
            THEN 'Academic counseling recommended due to attendance and assessment concerns.'
        WHEN s.roll_number IN ('EG006','EG007','EG008')
            THEN 'Follow-up completed with student regarding academic performance.'
        ELSE
            'Routine academic monitoring.'
    END
FROM students s
WHERE s.roll_number IN (
    'EG006','EG007','EG008',
    'EG011','EG012','EG013','EG014','EG015'
);

