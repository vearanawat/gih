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

## User Interface
- 📱 **Consistent Navigation**: All user panels (Patient, Doctor, Pharmacist) use a sidebar navigation layout for consistent user experience.
- 🎨 **Modern Design**: Clean, intuitive interface with cards, icons, and responsive layouts.
- 📊 **Dashboard Overview**: Each user type has a personalized dashboard showing relevant information and quick actions.

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

## **Setup & Environment Configuration**
To run this project, you need to configure environment variables.

### **1️⃣ Backend Setup**
#### **.env file (backend folder)**
Create a `.env` file inside the **backend** directory and add the following:
```sh
GROQ_API_KEY=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
HUGGINGFACE_API_KEY=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
```
#### **Install dependencies and run the backend**
```sh
cd backend  # Navigate to backend folder
pip install -r requirements.txt  # Install dependencies
```

#### **Start the backend server**
- Windows:
```sh
start_server.bat
```
- macOS/Linux:
```sh
chmod +x start_server.sh
./start_server.sh
```
- Manual start:
```sh
python main.py
```

The server will run at http://localhost:8000.

### **2️⃣ Frontend Setup**
#### **.env file (frontend folder)**
Create a `.env` file inside the **frontend** directory and add the following:
```sh
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dGVuZGVyLXJhdHRsZXItNzUuY2xlcmsuYWNjb3VudHMuZGV2JA
```
#### **Install dependencies and run the frontend**
```sh
npm install  # Install dependencies
npm run dev  # Start the frontend server
```

---

## **How to Edit This Code**

### **3️⃣ Use Your Preferred IDE**
If you want to edit locally, follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/vearanawat/Girl-Hackathon_2025.git

# Step 2: Install the necessary dependencies.
npm i

# Step 3: Start the development server with live reloading.
npm run dev
```

### **4️⃣ Use GitHub Codespaces**
- Open your repository and click the **Code** button.
- Select the **Codespaces** tab.
- Click **New Codespace** to launch an online development environment.
- Edit, commit, and push changes directly from the browser.

## Troubleshooting

### 404 Errors When Processing Prescriptions or Images
If you encounter 404 errors when uploading prescriptions or medical images:

1. **Check Backend Server**: Make sure the backend server is running at http://localhost:8000
   ```sh
   cd backend
   python main.py
   ```

2. **API Fallback**: The application includes fallback mock data if the backend is not available, so basic functionality will still work.

3. **CORS Issues**: If you're running the frontend on a different port, make sure CORS is properly configured in the backend.

4. **Missing Routes**: If you're still getting 404 errors, make sure the backend server has properly registered all routes. Check the console output when starting the server to confirm that both Medical Imaging and OCR routes are registered.

5. **Server Restart**: If you've made changes to the backend code, restart the server to apply those changes.

---
profile - drvea@gmail.com <br>
password - vea2004

🚀 **MediFlow: Transforming Healthcare with AI & Automation!**
