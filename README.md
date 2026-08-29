# 🏥 MediKiosik — AI-Assisted Pre-Consultation System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status: Hackathon_MVP](https://img.shields.io/badge/Status-Production_Ready_MVP-0CA854.svg)
![Standards: ABDM_FHIR](https://img.shields.io/badge/Healthcare_Standard-ABDM_%2F_FHIR_R4-blue.svg)
![Languages: English_Hindi](https://img.shields.io/badge/Languages-English_%7C_हिन्दी-orange.svg)

> **MediKiosik** is an intelligent, high-throughput pre-consultation kiosk system designed for high-volume hospital Outpatient Departments (OPDs).
>
> Patients describe their symptoms via **Voice or Touch in Hindi or English** and scan previous prescriptions/reports with **OCR**. The system converts this intake into a **structured medical summary in under 30 seconds**, saving doctors valuable consultation time.

---

## ⚡ The Clinical Problem & Target

In high-volume OPDs, doctors typically spend **2 to 5 minutes** taking basic history, decoding handwritten past prescriptions, and asking routine questions before clinical examination even begins.

```
Traditional OPD Workflow:
Patient enters -> Doctor spends 3-5 min taking routine history & reviewing old papers -> 1-2 min examination -> Rushed diagnosis

With MediKiosik:
Patient pre-captures history at Kiosk (5 min) -> Doctor reviews AI summary (30-60 sec) -> Full consultation focused on clinical examination & care
```

---

## 🌟 Key Features

### 1. 🖥️ Patient Smart Kiosk (Voice + Touch Guided)
- **Bilingual Audio & Touch UI**: Seamless toggle between **English** and **Hindi (हिन्दी)** with browser-native text-to-speech audio guidance.
- **Voice Recognition (Speech-to-Text)**: Speak symptoms directly using the browser's Web Speech API with real-time waveform visualizer.
- **Guided Adaptive Intake**:
  - Chief complaint & associated symptoms
  - Onset duration categorization
  - 1–10 pain severity scale with qualitative indicators
  - Past medical conditions (Diabetes, Hypertension, CAD, Asthma, etc.)
  - Ongoing medications and drug/food allergies
- **Prescription & Lab OCR Scanner**:
  - Live animated laser scanner that extracts medications, abnormal lab values, and past diagnoses from physical documents.
- **Instant OPD Token Slip**:
  - Issues a clean token slip with Token ID (e.g. `OPD-MED-4082`), assigned OPD room, doctor name, and print option.

### 2. 🚨 Rule-Based Red-Flag Emergency Safety Engine
- **Non-LLM Explicit Clinical Safety**:
  - Automatically intercepts life-threatening symptoms (e.g., acute retrosternal crushing chest pain radiating to left arm, acute dyspnea, sudden paralysis/stroke signs).
  - Triggers an instant **Emergency Safety Modal** and routes the patient directly to the emergency triage nurse desk.

### 3. 🩺 Doctor Clinical Workstation
- **Priority OPD Queue**:
  - Visual triage badges: `🚨 EMERGENCY_RED_FLAG`, `⚠️ URGENT`, `🟢 ROUTINE`.
- **AI Structured Clinical Dossier**:
  - 30-second synthesized briefing
  - Chief complaints & chronological timeline
  - Drug allergies highlighted in red
  - Ongoing medications list with dosage & frequency
- **Side-by-Side OCR Document Viewer**:
  - View original prescription/report scans alongside extracted clinical parameters.
- **Doctor Actions & Export**:
  - Editable clinical impression notes & ICD-10 diagnosis picker
  - One-click export to **FHIR R4 DiagnosticReport Bundle** and printable consultation summary.

### 4. 🏥 OPD Check-in Portal
- Clean, modern hospital web portal for patients to preview departments, doctor timings, and start pre-checkin before arrival.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   PATIENT MEDIKIOSK    │
                                  │  (Voice & Touch Screen)│
                                  └───────────┬────────────┘
                                              │
                                              ▼
                        ┌─────────────────────────────────────────────┐
                        │              MEDIKIOSIK ENGINE              │
                        │                                             │
                        │  • Speech-to-Text (Hindi / English)         │
                        │  • Rule-Based Emergency Safety Filter       │
                        │  • Document & Prescription OCR Scanner      │
                        │  • Clinical History Structuring Engine      │
                        └─────────────┬─────────────────┬─────────────┘
                                      │                 │
                 ┌────────────────────┘                 └────────────────────┐
                 ▼                                                           ▼
    ┌─────────────────────────┐                                 ┌─────────────────────────┐
    │     PATIENT OUTPUT      │                                 │   DOCTOR WORKSTATION    │
    │  • Printed OPD Token    │                                 │  • Priority Triage Queue│
    │  • Assigned Room #      │                                 │  • 30s AI Dossier       │
    │  • Emergency SOS Alert  │                                 │  • FHIR R4 Bundle       │
    └─────────────────────────┘                                 └─────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | HTML5, Tailwind CSS, Lucide Icons |
| **Voice Processing** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **OCR & Entity Extraction** | Client-Side Vision OCR Simulation Engine |
| **Healthcare Standard** | FHIR R4 Bundle / ABDM Ready |
| **Deployment** | Vercel Static Hosting (100% Free with HTTPS/SSL) |

---

## 🚀 Quick Start (Run Locally)

### Option 1: Direct in Browser
Double-click `index.html` to open directly in Google Chrome, Microsoft Edge, or Firefox.

### Option 2: One-Click Windows Launcher
Double-click `start_app.bat` in the project root.

### Option 3: PowerShell Built-in Server
Run the included zero-dependency server:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8080
```
Open **`http://localhost:8080`** in your browser.

---

## 🌐 Deploy to Vercel (100% Free)

This project is pre-configured with `vercel.json` for zero-configuration static deployment:

1. Create a repository on [GitHub](https://github.com/new) and upload these project files.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `medikiosik` repository and click **Deploy**.
4. Your app is live with free HTTPS (enabling microphone permissions everywhere).

---

## ⚖️ Clinical & Legal Notice

> **«MediKiosik does not diagnose or prescribe. The consulting doctor remains solely responsible for all clinical decisions and patient care.»**
>
> MediKiosik serves as an administrative and historical pre-intake assistant to optimize clinician time and organize patient records before the physical examination.

---

## 📄 License
This project is licensed under the **MIT License**.
