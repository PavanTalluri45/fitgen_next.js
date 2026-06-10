# 🏋️ FitGen AI Workout Plan Generator

An AI-powered fitness planning platform that generates personalized workout plans based on user goals, body measurements, workout preferences, and health considerations.

---

# 📌 Project Overview

FitGen leverages **Google Gemini AI** to create intelligent and customized workout programs while providing secure user authentication, workout history tracking, and plan management.

The platform is designed to simplify fitness planning and help users stay consistent with their fitness journey.

---

# 🎯 Business Objective

Provide users with a personalized fitness experience by generating workout plans tailored to:

* Fitness Goals
* Physical Measurements
* Training Experience
* Equipment Availability
* Health Conditions
* Lifestyle Preferences

The platform aims to reduce the complexity of workout planning and improve adherence to structured fitness programs.

---

# ✨ Key Features

## 🔐 User Authentication

* Secure Account Registration
* Email Verification
* Login & Logout
* Session Management
* Protected Routes

---

## 🤖 AI-Powered Workout Plan Generation

Users complete a structured fitness questionnaire containing:

### Body Measurements

* Height
* Weight
* Age
* Gender

### Fitness Profile

* Fitness Goal
* Fitness Level
* Focus Areas
* Target Weight

### Workout Preferences

* Workout Days Per Week
* Session Duration
* Workout Location
* Equipment Availability
* Activity Level

### Health Information

* Injuries
* Medical Conditions
* Exercise Preferences

---

## 🧠 AI Workout Generation

User fitness data is sent to **Google Gemini AI**, which generates:

* Personalized Workout Routines
* Weekly Training Schedules
* Exercise Recommendations
* Recovery Guidance
* Safety Considerations

---

## 📚 Workout Plan History

Users can:

* View Previously Generated Plans
* Access Detailed Plan Information
* Review Workout Recommendations
* Maintain Historical Workout Records

---

## ⏳ Plan Availability Control

To optimize AI usage and control operational costs:

* One workout plan generation every **72 hours**
* Cooldown timer visible to users
* Backend validation prevents abuse

---

## 💾 Form Progress Persistence

Questionnaire progress is automatically saved.

Users can:

* Refresh the page
* Leave the application
* Return later

and continue exactly where they left off.

---

# 🏗️ System Architecture

## Frontend

### Technologies

* Next.js
* React
* Tailwind CSS
* Shadcn UI
* React Hook Form
* Zod Validation

### Responsibilities

* User Interface
* Form Validation
* Authentication Screens
* Plan Visualization
* Responsive User Experience

---

## Backend

### Technologies

* Next.js API Routes

### Responsibilities

* Authentication Validation
* Workout Generation Requests
* AI Integration
* Database Operations
* Business Rule Enforcement

---

## Database & Authentication

### Technologies

* Supabase PostgreSQL
* Supabase Authentication

### Responsibilities

* User Management
* Secure Authentication
* Workout Form Storage
* Workout Plan Storage
* Row-Level Security (RLS)

---

## Artificial Intelligence

### Technology

* Google Gemini AI

### Responsibilities

* Analyze User Profiles
* Generate Personalized Workout Plans
* Produce Structured Workout Recommendations

---

# 🔒 Security

The platform incorporates multiple security layers:

* Secure Authentication
* Email Verification
* Protected Routes
* Row-Level Security (RLS)
* Server-Side Validation
* AI Usage Restrictions
* Session Management

---

# ⚡ Non-Functional Requirements

* Responsive Design
* Mobile Friendly
* Secure Authentication
* Fast Plan Retrieval
* Scalable Cloud Infrastructure
* Serverless Deployment

---

# 🚀 Deployment Architecture

## Frontend & Backend

* Vercel

## Database & Authentication

* Supabase

## AI Service

* Google Gemini AI

## Deployment Model

Cloud-Native Serverless Architecture

---

# 📊 Development Effort Estimation

| Module                         | Estimated Effort |
| ------------------------------ | ---------------- |
| Authentication & Authorization | 2 Days           |
| Questionnaire & Validation     | 2 Days           |
| AI Integration                 | 2 Days           |
| Database Design & Integration  | 1 Day            |
| Workout History Management     | 1 Day            |
| Cooldown & Usage Controls      | 1 Day            |
| UI/UX Implementation           | 2 Days           |
| Testing & Bug Fixes            | 2 Days           |

### Total Estimated Effort

**12–14 Working Days**

*(One Full-Stack Developer)*

---

# 🔮 Future Enhancements

* Nutrition Plan Generation
* Progress Tracking
* Exercise Video Library
* Subscription Plans
* Fitness Analytics Dashboard
* Wearable Device Integration
* Mobile Application

---

# 🛠️ Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | Next.js, React          |
| Styling        | Tailwind CSS, Shadcn UI |
| Forms          | React Hook Form, Zod    |
| Backend        | Next.js API Routes      |
| Database       | Supabase PostgreSQL     |
| Authentication | Supabase Auth           |
| AI Engine      | Google Gemini AI        |
| Deployment     | Vercel                  |

---




**FitGen AI — Personalized Fitness Planning Powered by Artificial Intelligence**
