# ✅ To-Do List Application – Full-Stack DevOps Project on AWS

A secure, full-stack to-do list application deployed on AWS. Built using containerized frontend, serverless backend, CI/CD pipelines, and cloud-native infrastructure with security best practices.

## 🚀 Features

### 📝 User-Facing
- Create, update, and delete personal to-do tasks
- Upload and download attachments per task (stored securely)

### 🔧 Backend & Infrastructure
- API-driven backend built with Lambda, protected by Cognito
- Private RDS instance (MySQL) in VPC for task storage
- Attachments stored in S3 with pre-signed URL access
- Dockerized frontend deployed to ECS Fargate behind an ALB
- CI/CD using CodePipeline, CodeBuild, and ECR
- Logs and monitoring via CloudWatch
- Infrastructure managed with CloudFormation

## 🛠️ Tech Stack

### Frontend
- Vanilla JavaScript, HTML, Bootstrap
- Dockerized for deployment via ECS Fargate

### AWS Services
- API Gateway – secure API layer
- Lambda – backend task logic
- RDS (MySQL) – persistent data storage in private subnet
- S3 – stores file attachments (pre-signed access)
- Cognito – user authentication
- IAM – least privilege permissions
- ECS Fargate – containerized frontend hosting
- CodePipeline + CodeBuild + ECR – automated deployments
- CloudWatch – monitoring and logging
- CloudFormation – infrastructure provisioning

## 📁 Folder Structure

todo-app/ ├── frontend/ # Vanilla JS frontend ├── lambdas/ # Backend functions ├── database/ # SQL schema and scripts ├── cicd/ # CI/CD workflow configs ├── infra/ # CloudFormation templates └── README.md


## 📚 Learning Outcomes
- Built and deployed a full-stack cloud-native app on AWS
- Designed secure backend with authentication and file handling
- Created automated deployment pipelines and containerized delivery
- Applied logging, VPC networking, and IAM permissions best practices

## 🧑‍💻 Author

**Harrison Holt**  
AWS Certified Developer & Solutions Architect  
[Portfolio](https://harrisonholt.dev) | [Email](mailto:hholt2901@gmail.com)
