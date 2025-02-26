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
- 🔐 **OAuth + 2FA + RBAC** (Security & Authentication)

---

## **How to Edit This Code**

### **1️⃣ Use Lovable**

Visit the [MediFlow Project](https://lovable.dev/projects/45694a0a-d2c2-49b7-8f1f-8f10b831ea02) and start making changes. Any updates made will be **automatically committed**.

### **2️⃣ Use Your Preferred IDE**

If you want to edit locally, follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with live reloading.
npm run dev
```

### **3️⃣ Edit Directly on GitHub**

- Navigate to the desired file.
- Click the **Edit** button (pencil icon).
- Make changes and commit them.

### **4️⃣ Use GitHub Codespaces**

- Open your repository and click the **Code** button.
- Select the **Codespaces** tab.
- Click **New Codespace** to launch an online development environment.
- Edit, commit, and push changes directly from the browser.

---

### **Can I Use a Custom Domain?**

Custom domains are **not supported yet**. If you need one, we recommend deploying your project using **Netlify**.

---

🚀 **MediFlow: Transforming Healthcare with AI & Automation!**
