# 📌 To-Do List Backend API 🚀

AWS Serverless Backend for a **To-Do List App** using **Lambda, API Gateway, RDS (MySQL/PostgreSQL), Cognito, and EC2**.

---

## 📝 Table of Contents

- [📌 Introduction](#📌-introduction)
- [🛠 Tech Stack](#🛠-tech-stack)
- [🌐 Architecture Overview](#🌐-architecture-overview)
- [⚙️ Setup & Deployment](#⚙️-setup--deployment)
- [🛠 API Endpoints](#🛠-api-endpoints)
  - [1️⃣ User Registration](#1️⃣-user-registration)
  - [2️⃣ User Login](#2️⃣-user-login)
  - [3️⃣ Delete Account](#3️⃣-delete-account)
  - [4️⃣ Create Task](#4️⃣-create-task)
  - [5️⃣ Delete Task](#5️⃣-delete-task)
  - [6️⃣ Update Task](#6️⃣-update-task)
  - [7️⃣ Complete Task](#7️⃣-complete-task)
  - [8️⃣ Get All Tasks](#8️⃣-get-all-tasks)
- [🔒 Security & Authentication](#🔒-security--authentication)
- [🛠 Testing with Postman](#🛠-testing-with-postman)
- [📌 Future Improvements](#📌-future-improvements)

---

## 📌 Introduction

This backend API provides **user authentication** and **task management** features using **AWS Cognito, Lambda, API Gateway, and RDS (MySQL/PostgreSQL)**.

✅ Secure authentication with Cognito  
✅ Serverless API with AWS Lambda  
✅ Data storage in Amazon RDS (interacted via EC2)  
✅ Public-private Lambda architecture for security  

---

## 🛠 Tech Stack

✅ **AWS Lambda** – Serverless backend logic (Node.js)  
✅ **Amazon API Gateway** – Routes HTTP requests  
✅ **Amazon Cognito** – User authentication and token management  
✅ **Amazon RDS (MySQL/PostgreSQL)** – Relational database storage  
✅ **Amazon EC2** – For direct database interaction and administration  
✅ **AWS IAM Roles** – Secure role-based access  
✅ **AWS CloudWatch** – Logs and monitoring  

---

## 🌐 Architecture Overview
```ssh
[Frontend] → API Gateway → 
Public Lambda (Auth) →
Cognito (User Management) →
Public Lambda (Tasks) →
Private Lambda → RDS (via VPC) →
EC2 (For DB Administration) →
 CloudWatch (Logging & Monitoring)
```

✅ **Public Lambdas: Handles user authentication (login, registration) and task requests
✅ **Private Lambda: Handles secure interactions with Amazon RDS
✅**Amazon Cognito: Manages user authentication and authorization
✅ **Amazon RDS (MySQL/PostgreSQL): Stores tasks with user_id and task_id
✅ **EC2 Instance: Allows manual database interaction for debugging
✅ **API Gateway: Routes HTTP requests to the appropriate Lambda functions
