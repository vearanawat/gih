# Welcome to MediFlow

## Project Overview

**MediFlow** is an AI-powered healthcare assistant designed to automate **prescription processing, medical image analysis, and patient diagnosis**. It streamlines operations for **doctors, pharmacists, and patients**, ensuring accuracy, efficiency, and security in medical workflows.

## Features

### **1️⃣ Patient Panel:**

- 🌡️ **AI Doctor Assistant**: Patients can input symptoms, and the system provides a preliminary diagnosis using the `facebook/bart-large-mnli` model.
- 📅 **Appointment Booking**: Patients can schedule appointments with doctors based on their conditions.
- 📦 **Order Tracking**: Patients can check the status of their prescriptions and orders.

### **2️⃣ Pharmacist Panel:**

- 📄 **Prescription Processing**: Pharmacists can upload handwritten or printed prescriptions.
- 🔍 **Text Extraction (OCR Models)**:
  - **PaddleOCR** (Higher accuracy for structured medical prescriptions).
  - **EasyOCR** (Supports multilingual prescriptions).
- 🏥 **Medical Term Recognition**: Extracted text is processed using a **BERT model** to prioritize medicines, dosages, and instructions.
- 🤖 **Order Generation (LLM)**: A **large language model (LLM)** generates structured orders based on the prescription and patient needs.
- 🎙 **Voice Prescription Support**: Converts **audio prescriptions to text**, processes it using **BERT → LLM pipeline**, and generates structured orders.

### **3️⃣ Doctor Panel:**

- 📷 **Medical Image Diagnosis**: Doctors can upload **X-ray and CT scan images**, and the system predicts diseases using:
  - 🩻 **X-ray Model**: `lambdalabs/Chest-X-ray-Classification`
  - 🧠 **CT Scan Model**: `UCSD-AI4H/chexnet`
- 📝 **Symptom-Based Disease Prediction**: Doctors can input patient symptoms, and the system predicts potential diseases using the **BART model**.

## Security & Authentication

- 🔐 **Two-Factor Authentication (2FA)** for added security.
- 🔄 **OAuth Integration** for secure and seamless logins.
- 👥 **Role-Based Access Control (RBAC)** ensuring:
  - ✅ Patients can only view orders and book appointments.
  - ✅ Pharmacists can process prescriptions and generate orders.
  - ✅ Doctors can diagnose diseases and upload medical data.

---

## **Technologies Used**

This project is built with:

- ⚡ **FastAPI** (Backend)
- 🔥 **React + TypeScript + Vite** (Frontend)
- 🎨 **shadcn-ui + Tailwind CSS** (UI Design)
- 🏥 **Hugging Face Transformers** (AI Models for Diagnosis & Order Generation)
- 📄 **PaddleOCR & EasyOCR** (Text Extraction from Prescriptions)
- 🔍 **Vision Transformer (ViT)** (Fake Prescription Detection)
- 🔐 **OAuth + 2FA + RBAC** (Security & Authentication)
- 🚀 **Groq** (LLM acceleration and inference optimization)
- 📩 **Nodemailer** (Email notifications and alerts)

🔗 **Live Streamlit Dashboard:** [Medical Dashboard](https://medicaldashboard-eb8zhegowicdqpjccam7gc.streamlit.app/)

---

## **Setup & Environment Configuration**

To run this project, you need to configure environment variables.

### **1️⃣ Backend Setup**

#### **.env file (backend folder)**

Create a `.env` file inside the **backend** directory and add the following keys:

```sh
GROQ_API_KEY=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
HUGGINGFACE_API_KEY=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
```

#### **Install dependencies and run the backend**

```sh
cd backend  # Navigate to backend folder
pip install -r requirements.txt  # Install dependencies
uvicorn main:app --reload --host 0.0.0.0 --port 8000  # Run the FastAPI backend
```

### **2️⃣ Mail Backend Setup**

```sh
cd mailBackend
npm install
node index.js  # Start the mail backend
```

### **3️⃣ Frontend Setup**

#### **.env file (frontend folder)**

Create a `.env` file inside the **root (main)** directory and add the following keys:

```sh
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dGVuZGVyLXJhdHRsZXItNzUuY2xlcmsuYWNjb3VudHMuZGV2JA
GEMINI_API_KEY=AIzaSyCHzoZHWJdqFeD7fCyTTeMNknq9AUZwpUM
SENDER_EMAIL=mediflow25@gmail.com
SENDER_EMAIL_PASSWORD=rdsb umev ynct gwms
```

#### **Install dependencies and run the frontend**

```sh
npm install  # Install dependencies
npm run dev  # Start the frontend server
```

---

## **How to Edit This Code**

### **4️⃣ Use Your Preferred IDE**

If you want to edit locally, follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/vearanawat/Girl-Hackathon_2025.git

# Step 2: Install the necessary dependencies.
npm i

# Step 3: Start the development server with live reloading.
npm run dev
```

### **5️⃣ Use GitHub Codespaces**

- Open your repository and click the **Code** button.
- Select the **Codespaces** tab.
- Click **New Codespace** to launch an online development environment.
- Edit, commit, and push changes directly from the browser.

---

🚀 **MediFlow: Transforming Healthcare with AI & Automation!**

**⚠️ Important: Revoke and regenerate all API keys and passwords you shared in your request to ensure security.**
