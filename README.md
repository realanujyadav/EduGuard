# EduGuard

> Academic Risk Monitoring and Early Warning System

EduGuard is a web-based academic risk monitoring system designed to help faculty identify students who may be at academic risk at an early stage and take timely intervention.

The system analyzes multiple academic indicators such as attendance, assessment performance, missing assignments, engagement, and previous academic performance to calculate an academic risk score and categorize students into different risk levels.

---

## Live Demo

[Open EduGuard](https://eduguard-8f810.web.app)

---

## Overview

In an academic environment, students who are struggling may not always be identified early enough.

EduGuard provides faculty with a centralized dashboard where they can:

- Monitor overall student academic performance
- Identify students at higher academic risk
- Analyze the factors contributing to risk
- View individual student academic information
- Track academic interventions
- Monitor intervention progress

The goal is to support early identification and timely academic intervention.

---

## Key Features

### Dashboard

The dashboard provides an overview of the academic situation, including:

- Total number of students
- High-risk students
- Medium-risk students
- Low-risk students
- Intervention status summary

### Student Management

Faculty can:

- View student records
- Add students
- Edit student information
- Delete student records
- View academic indicators
- View individual student risk information

### Academic Risk Analysis

EduGuard evaluates multiple academic indicators to calculate a risk score.

The current risk engine considers:

- Attendance
- Assessment score
- Missing assignments
- Student engagement
- Previous academic performance

Students are categorized into:

- Low Risk
- Medium Risk
- High Risk

### Intervention Management

Faculty can track academic interventions for students using statuses such as:

- Pending
- In Progress
- Completed

This allows faculty to monitor whether appropriate academic support has been initiated and completed.

---

## Risk Calculation

EduGuard currently uses a rule-based risk engine.

The risk score is calculated using multiple academic indicators.

### Attendance

| Condition | Risk Added |
|---|---:|
| Attendance < 60% | +30 |
| Attendance < 75% | +15 |

### Assessment Performance

| Condition | Risk Added |
|---|---:|
| Assessment < 50 | +30 |
| Assessment < 65 | +15 |

### Missing Assignments

| Condition | Risk Added |
|---|---:|
| 3 or more missing assignments | +20 |
| 1 or more missing assignments | +10 |

### Engagement

| Engagement | Risk Added |
|---|---:|
| Low | +15 |
| Medium | +5 |

### Previous Academic Performance

The system also compares previous academic performance with the current assessment score.

| Score Difference | Risk Added |
|---|---:|
| Difference >= 10 | +20 |
| Difference >= 5 | +10 |

The accumulated risk score is then used to determine the student's risk category.

---

## System Architecture

                         +-------------------+
                         |      GitHub       |
                         |   Source Code     |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         | Firebase Hosting  |
                         |   React + Vite    |
                         +---------+---------+
                                   |
                              HTTPS API
                                   |
                                   v
                         +-------------------+
                         |      Render       |
                         | Node + Express.js |
                         +---------+---------+
                                   |
                              PostgreSQL
                                   |
                                   v
                         +-------------------+
                         |       Neon        |
                         |    PostgreSQL     |
                         +-------------------+

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- PostgreSQL
- node-postgres (pg)
- CORS
- dotenv

### Database

- PostgreSQL
- Neon

### Deployment

- Firebase Hosting - Frontend
- Render - Backend API
- Neon - PostgreSQL Database
- GitHub - Source Code and Version Control

---

## Project Structure

EduGuard/
|
+-- backend/
|   +-- services/
|   |   +-- riskEngine.js
|   |
|   +-- server.js
|   +-- package.json
|   +-- package-lock.json
|   +-- .env.example
|
+-- database/
|   +-- schema.sql
|   +-- seed.sql
|
+-- frontend/
|   +-- public/
|   |   +-- favicon.svg
|   |   +-- icons.svg
|   |
|   +-- src/
|   |   +-- assets/
|   |   +-- App.jsx
|   |   +-- App.css
|   |   +-- index.css
|   |   +-- main.jsx
|   |
|   +-- .env.example
|   +-- .firebaserc
|   +-- firebase.json
|   +-- index.html
|   +-- package.json
|   +-- package-lock.json
|   +-- vite.config.js
|
+-- .gitignore
+-- README.md

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Backend health check |
| GET | /api/dashboard | Dashboard statistics |
| GET | /api/students | Retrieve all students |
| GET | /api/students/:id | Retrieve a specific student |
| POST | /api/students | Add a new student |
| PUT | /api/students/:id | Update student information |
| DELETE | /api/students/:id | Delete a student |
| GET | /api/interventions | Retrieve interventions |
| PATCH | /api/interventions/:studentId | Update intervention status |

---

## Database Structure

EduGuard uses PostgreSQL with three main tables.

### students

Stores basic student information, including:

- Student name
- Roll number
- Branch
- Semester

### academic_records

Stores academic indicators associated with students, including:

- Attendance
- Assessment scores
- Missing assignments
- Engagement
- Previous academic performance

### interventions

Stores intervention information and tracks intervention status for students.

The tables are connected using student IDs and foreign-key relationships.

---

## Application Workflow

Student Academic Data
        |
        v
+---------------------+
|   Risk Calculation  |
|       Engine        |
+----------+----------+
           |
           v
      Risk Score
           |
           v
+---------------------+
| Risk Categorization |
|                     |
| Low / Medium / High |
+----------+----------+
           |
           v
+---------------------+
| Faculty Dashboard   |
+----------+----------+
           |
           v
+---------------------+
|    Intervention     |
|      Tracking       |
+---------------------+

---

## Local Development

### 1. Clone the Repository

git clone https://github.com/realanujyadav/EduGuard.git
cd EduGuard

### 2. Backend Setup

Navigate to the backend:

cd backend

Install dependencies:

npm install

Create a .env file using .env.example.

Example configuration:

PORT=5001
DATABASE_URL=your_postgresql_connection_string
DB_SSL=true
FRONTEND_URL=http://localhost:5173

Start the backend:

npm run dev

The backend will run on:

http://localhost:5001

### 3. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create a .env.local file using .env.example.

Example configuration:

VITE_API_URL=http://localhost:5001

Start the frontend:

npm run dev

The frontend will be available through the Vite development server.

---

## Database Setup

The repository contains:

database/
    schema.sql
    seed.sql

### schema.sql

Contains the PostgreSQL database structure used by EduGuard.

### seed.sql

Contains synthetic demo data intended for local development and testing.

Production student data is stored separately in the hosted PostgreSQL database and is not included in this repository.

---

## Security and Data Handling

EduGuard keeps application secrets and production database credentials outside the Git repository.

Environment files are excluded using .gitignore.

The following types of files should not be committed:

.env
.env.*

Example configuration files are provided instead:

backend/.env.example
frontend/.env.example

Production student data is stored separately in PostgreSQL and is not included in the source repository.

---

## Deployment

The current production architecture is:

GitHub
   |
   +-- Frontend Source
   |       |
   |       v
   |  Firebase Hosting
   |       |
   |       v
   |    React App
   |       |
   |       | HTTPS API Requests
   |       v
   |     Render
   |       |
   |       v
   | Express Backend
   |       |
   |       v
   |      Neon
   |       |
   |       v
   | PostgreSQL Database

### Frontend

Hosted using Firebase Hosting.

### Backend

Hosted using Render as a Node.js/Express web service.

### Database

Hosted using Neon PostgreSQL.

---

## Future Enhancements

Potential future improvements include:

- Machine-learning based academic risk prediction
- Automated faculty notifications
- Student performance trend analysis
- More detailed intervention analytics
- Role-based authentication and authorization
- Attendance system integration
- Assignment management integration
- Academic report generation
- Exportable reports
- Improved risk-score explainability
- Historical risk tracking
- Cohort-level analytics

---

## Project Goal

EduGuard aims to move academic support from a reactive approach to a more proactive approach by helping faculty identify potential academic difficulties earlier and organize appropriate interventions.

---

## Project

EduGuard - Academic Risk Monitoring and Early Warning System

Built using:

React
Node.js
Express
PostgreSQL
Neon
Firebase Hosting
Render

---

## License

This project was developed for educational and academic purposes.