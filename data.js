// MediKiosik Master Dataset & Bilingual Configuration

const MEDIKIOSIK_DATA = {
  // Hospital OPD Departments & Specialties
  departments: [
    {
      id: "gen-med",
      name: "General Medicine & Triage",
      hindiName: "सामान्य चिकित्सा एवं जांच",
      icon: "stethoscope",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      shortDesc: "Comprehensive diagnosis and management of acute fevers, infections, diabetes, hypertension, and general health concerns.",
      keyDoctors: "Dr. Ananya Sharma, Dr. Rajesh Verma",
      avgWaitTime: "10-15 Mins (with MediKiosik)",
      room: "OPD Rooms 01 - 04"
    },
    {
      id: "cardiology",
      name: "Cardiology & Heart Care",
      hindiName: "हृदय रोग विज्ञान",
      icon: "heart-pulse",
      color: "bg-red-50 text-red-600 border-red-200",
      shortDesc: "Expert evaluation of chest pain, hypertension, arrhythmias, heart failure, ECG, and echocardiography review.",
      keyDoctors: "Dr. Ashok Seth, Dr. Subhash Chandra",
      avgWaitTime: "15 Mins",
      room: "OPD Rooms 10 - 12"
    },
    {
      id: "pulmonology",
      name: "Pulmonology & Respiratory Care",
      hindiName: "श्वसन एवं फेफड़े रोग",
      icon: "wind",
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      shortDesc: "Specialized care for persistent cough, asthma, bronchitis, COPD, shortness of breath, and post-viral lung recovery.",
      keyDoctors: "Dr. Vikas Maurya, Dr. Rajesh Chawla",
      avgWaitTime: "12 Mins",
      room: "OPD Rooms 05 - 07"
    },
    {
      id: "orthopaedics",
      name: "Orthopaedics & Joint Care",
      hindiName: "हड्डी एवं जोड़ रोग",
      icon: "bone",
      color: "bg-amber-50 text-amber-600 border-amber-200",
      shortDesc: "Treatment for knee, spine, and shoulder pain, arthritis, fractures, sports injuries, and mobility disorders.",
      keyDoctors: "Dr. Ashok Rajgopal, Dr. Subhash Jangid",
      avgWaitTime: "15 Mins",
      room: "OPD Rooms 14 - 16"
    },
    {
      id: "gastroenterology",
      name: "Gastroenterology & Liver",
      hindiName: "पेट एवं लिवर रोग",
      icon: "activity",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      shortDesc: "Management of severe acidity, GERD, abdominal pain, liver health, jaundice, indigestion, and bowel disorders.",
      keyDoctors: "Dr. Vivek Vij, Dr. Ajay Kumar",
      avgWaitTime: "10 Mins",
      room: "OPD Rooms 08 - 09"
    },
    {
      id: "paediatrics",
      name: "Paediatrics & Child Health",
      hindiName: "बाल रोग विशेषज्ञ",
      icon: "baby",
      color: "bg-pink-50 text-pink-600 border-pink-200",
      shortDesc: "Specialized care for infants, children, vaccinations, childhood fevers, growth monitoring, and pediatric nutrition.",
      keyDoctors: "Dr. Meenakshi Sundaram, Dr. Pooja Gupta",
      avgWaitTime: "10 Mins",
      room: "OPD Rooms 17 - 19"
    }
  ],

  // OPD Doctors
  // OPD & Telemedicine Doctors
  doctors: [
    {
      id: "dr-ananya-sharma",
      name: "Dr. Ananya Sharma",
      degrees: "MBBS, MD (Internal Medicine), DNB",
      specialty: "Senior Consultant - General Medicine & OPD Triage",
      dept: "General Medicine & Triage",
      experience: "16+ Years Experience",
      languages: "English, Hindi, Punjabi",
      rating: "4.9 (2,100+ reviews)",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Mon to Sat (08:30 AM - 02:00 PM)",
      room: "OPD Room 04",
      inPersonFee: 500,
      videoFee: 400,
      hybridFee: 650,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Fri, 05 Sep", "Sat, 06 Sep", "Mon, 08 Sep"],
      availableSlots: {
        morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
        afternoon: ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM"],
        evening: ["05:00 PM", "05:30 PM", "06:00 PM"]
      },
      telemedicineStatus: "Available Online for Video",
      videoRoomUrl: "https://meet.careforge.live/dr-ananya-sharma-room"
    },
    {
      id: "dr-ashok-seth",
      name: "Dr. Ashok Seth",
      degrees: "MBBS, MD, FRCP (London), FACC",
      specialty: "Chief Consultant - Cardiology",
      dept: "Cardiology & Heart Care",
      experience: "35+ Years Experience",
      languages: "English, Hindi",
      rating: "4.9 (4,280+ reviews)",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Mon, Wed, Fri (10:00 AM - 01:30 PM)",
      room: "OPD Room 12",
      inPersonFee: 800,
      videoFee: 650,
      hybridFee: 950,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Fri, 05 Sep", "Mon, 08 Sep"],
      availableSlots: {
        morning: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
        afternoon: ["01:00 PM", "01:30 PM"],
        evening: ["04:30 PM", "05:00 PM", "05:30 PM"]
      },
      telemedicineStatus: "Available Online for Video",
      videoRoomUrl: "https://meet.careforge.live/dr-ashok-seth-room"
    },
    {
      id: "dr-ashok-rajgopal",
      name: "Dr. Ashok Rajgopal",
      degrees: "MS (Ortho), M.Ch (Ortho), FRCS",
      specialty: "Senior Consultant - Orthopaedics & Joint Care",
      dept: "Orthopaedics & Joint Care",
      experience: "32+ Years Experience",
      languages: "English, Hindi",
      rating: "4.9 (3,900+ reviews)",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Mon to Fri (09:00 AM - 01:00 PM)",
      room: "OPD Room 15",
      inPersonFee: 700,
      videoFee: 550,
      hybridFee: 850,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Fri, 05 Sep", "Sat, 06 Sep"],
      availableSlots: {
        morning: ["09:00 AM", "09:30 AM", "10:30 AM", "11:30 AM"],
        afternoon: ["12:30 PM", "01:00 PM"],
        evening: ["04:00 PM", "04:30 PM", "05:00 PM"]
      },
      telemedicineStatus: "In OPD Clinic",
      videoRoomUrl: "https://meet.careforge.live/dr-ashok-rajgopal-room"
    },
    {
      id: "dr-vikas-maurya",
      name: "Dr. Vikas Maurya",
      degrees: "MBBS, MD (Pulmonary Medicine), FNCCP",
      specialty: "Consultant - Pulmonology & Respiratory Care",
      dept: "Pulmonology & Respiratory Care",
      experience: "18+ Years Experience",
      languages: "English, Hindi",
      rating: "4.8 (1,850+ reviews)",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Tue, Thu, Sat (10:00 AM - 02:00 PM)",
      room: "OPD Room 06",
      inPersonFee: 600,
      videoFee: 500,
      hybridFee: 750,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Sat, 06 Sep", "Tue, 09 Sep"],
      availableSlots: {
        morning: ["10:00 AM", "10:30 AM", "11:00 AM"],
        afternoon: ["01:00 PM", "01:30 PM", "02:00 PM"],
        evening: ["05:30 PM", "06:00 PM", "06:30 PM"]
      },
      telemedicineStatus: "Available Online for Video",
      videoRoomUrl: "https://meet.careforge.live/dr-vikas-maurya-room"
    },
    {
      id: "dr-vivek-vij",
      name: "Dr. Vivek Vij",
      degrees: "MBBS, MS, DNB (Surg Gastro)",
      specialty: "Senior Consultant - Gastroenterology & Liver",
      dept: "Gastroenterology & Liver",
      experience: "22+ Years Experience",
      languages: "English, Hindi, Marathi",
      rating: "4.9 (2,400+ reviews)",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Mon, Wed, Fri, Sat (09:30 AM - 01:30 PM)",
      room: "OPD Room 08",
      inPersonFee: 650,
      videoFee: 550,
      hybridFee: 800,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Fri, 05 Sep", "Sat, 06 Sep"],
      availableSlots: {
        morning: ["09:30 AM", "10:00 AM", "11:00 AM", "11:30 AM"],
        afternoon: ["01:00 PM", "02:00 PM"],
        evening: ["05:00 PM", "06:00 PM"]
      },
      telemedicineStatus: "Available Online for Video",
      videoRoomUrl: "https://meet.careforge.live/dr-vivek-vij-room"
    },
    {
      id: "dr-meenakshi-sundaram",
      name: "Dr. Meenakshi Sundaram",
      degrees: "MBBS, MD (Paediatrics), DCH",
      specialty: "Consultant Paediatrician & Child Health Specialist",
      dept: "Paediatrics & Child Health",
      experience: "14+ Years Experience",
      languages: "English, Hindi, Tamil",
      rating: "4.9 (1,950+ reviews)",
      image: "https://images.unsplash.com/photo-1594824813586-78e7279375e3?w=500&auto=format&fit=crop&q=80",
      opdTiming: "Mon to Sat (09:00 AM - 02:00 PM)",
      room: "OPD Room 18",
      inPersonFee: 500,
      videoFee: 400,
      hybridFee: 650,
      supportedModes: ["in-person", "video", "hybrid"],
      availableDates: ["Today", "Tomorrow", "Fri, 05 Sep", "Sat, 06 Sep"],
      availableSlots: {
        morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM"],
        afternoon: ["01:00 PM", "01:30 PM"],
        evening: ["04:30 PM", "05:00 PM", "05:30 PM"]
      },
      telemedicineStatus: "Available Online for Video",
      videoRoomUrl: "https://meet.careforge.live/dr-meenakshi-room"
    }
  ],

  // Sample Patients in Doctor Queue
  samplePatients: [
    {
      id: "pat-101",
      token: "OPD-EMG-014",
      name: "Rajesh Kumar Sharma",
      age: 56,
      gender: "Male",
      phone: "+91 98712 34567",
      abhaId: "32-9845-1120-4491",
      triageLevel: "EMERGENCY_RED_FLAG",
      triageReason: "Acute crushing retrosternal chest pain with left arm radiation & cold sweats",
      arrivalStatus: "Waiting (Triage Alerted)",
      checkInTime: "10:14 AM",
      department: "Cardiology / OPD-Room 12",
      doctorName: "Dr. Ashok Seth",
      chiefComplaint: "Severe crushing chest pain for 3 hours, radiating to left arm and jaw, profuse sweating, mild breathlessness.",
      duration: "3 hours (Sudden onset at 7:15 AM)",
      painScore: 9,
      symptoms: ["Crushing Chest Pain", "Left Arm Pain", "Diaphoresis (Cold Sweats)", "Shortness of Breath"],
      pastHistory: ["Hypertension (6 yrs)", "Type-2 Diabetes Mellitus (8 yrs)"],
      currentMedications: [
        { name: "Telmisartan", dose: "40mg", frequency: "OD (Morning)" },
        { name: "Metformin", dose: "500mg", frequency: "BD (After meals)" },
        { name: "Atorvastatin", dose: "20mg", frequency: "HS (Night)" }
      ],
      allergies: ["Penicillin (Causes Rash/Urticaria)"],
      scannedDocsCount: 2,
      scannedDocs: [
        {
          id: "doc-101-1",
          type: "Previous OPD Prescription",
          title: "Cardiology Followup Slip",
          ocrSnippet: "Rx: Tab Telmisartan 40mg OD, Tab Metformin 500mg BD. BP 144/92 mmHg, ECG: Normal Sinus rhythm, T-wave inversion in V4-V6 noted previously.",
          extractedEntities: {
            medications: ["Telmisartan 40mg", "Metformin 500mg"],
            bp: "144/92 mmHg",
            diagnoses: ["Essential Hypertension", "Type-2 Diabetes"]
          }
        },
        {
          id: "doc-101-2",
          type: "Lab Report",
          title: "Blood Glucose & Lipid Panel",
          ocrSnippet: "Total Cholesterol: 242 mg/dL (HIGH), Triglycerides: 210 mg/dL (HIGH), LDL: 168 mg/dL (HIGH), HbA1c: 7.9% (Uncontrolled).",
          extractedEntities: {
            hba1c: "7.9% [HIGH]",
            totalCholesterol: "242 mg/dL [HIGH]",
            ldl: "168 mg/dL [HIGH]"
          }
        }
      ],
      aiSummary: "56-year-old male hypertensive and diabetic presenting with acute onset retrosternal crushing chest pain radiating to left shoulder and arm since 3 hours. Associated with diaphoresis and dyspnea on rest. Red-flag safety rules triggered: High suspicion of Acute Coronary Syndrome (STEMI/NSTEMI). Emergency ECG and STAT Troponin-I advised immediately.",
      doctorNotes: "ECG shows 2mm ST elevation in Leads V1-V4. STAT Aspirin 300mg + Clopidogrel 300mg + Atorvastatin 80mg loaded. Transferred immediately to Cath Lab for primary angioplasty.",
      finalDiagnosis: "Acute Anterior Wall STEMI / ACS",
      status: "In-Consultation"
    },
    {
      id: "pat-102",
      token: "OPD-REG-045",
      name: "Meenakshi Sundaram",
      age: 44,
      gender: "Female",
      phone: "+91 94451 88234",
      abhaId: "44-1290-7731-0982",
      triageLevel: "ROUTINE",
      triageReason: "Recurrent acid reflux, heartburn, and bloating after meals",
      arrivalStatus: "Waiting",
      checkInTime: "10:22 AM",
      department: "Gastroenterology / OPD-Room 08",
      doctorName: "Dr. Ananya Sharma",
      chiefComplaint: "Burning sensation in upper abdomen and chest (heartburn), bloating, acid regurgitation for 3 weeks.",
      duration: "3 weeks (Worse after meals and at night)",
      painScore: 4,
      symptoms: ["Heartburn / Reflux", "Epigastric Pain", "Post-prandial Bloating"],
      pastHistory: ["GERD (mild)", "Hypothyroidism (5 yrs)"],
      currentMedications: [
        { name: "Thyronorm", dose: "50mcg", frequency: "OD (Empty stomach morning)" }
      ],
      allergies: ["No known drug allergies (NKDA)"],
      scannedDocsCount: 1,
      scannedDocs: [
        {
          id: "doc-102-1",
          type: "Lab Report",
          title: "Thyroid Profile (Jan 2024)",
          ocrSnippet: "TSH: 2.45 uIU/mL (Normal Range 0.45 - 4.50), Free T4: 1.2 ng/dL (Normal).",
          extractedEntities: {
            tsh: "2.45 uIU/mL [Euthyroid]",
            med: "Thyronorm 50mcg"
          }
        }
      ],
      aiSummary: "44-year-old female with known hypothyroidism (well-controlled on Thyronorm 50mcg) presenting with 3-week history of worsening postprandial heartburn, acid regurgitation, and bloating. No red flags (no dysphagia, no weight loss, no bleeding). Suggestive of GERD with dyspepsia.",
      doctorNotes: "Abdomen soft, mild epigastric tenderness. Advised Tab Pantoprazole 40mg + Domperidone 30mg OD before breakfast for 14 days.",
      finalDiagnosis: "GERD with Functional Dyspepsia",
      status: "Waiting"
    },
    {
      id: "pat-103",
      token: "OPD-URG-028",
      name: "Harpreet Singh Gill",
      age: 62,
      gender: "Male",
      phone: "+91 98140 56219",
      abhaId: "91-4432-8819-7623",
      triageLevel: "URGENT",
      triageReason: "Severe right knee swelling and pain, unable to bear weight",
      arrivalStatus: "Waiting",
      checkInTime: "10:35 AM",
      department: "Orthopaedics / OPD-Room 15",
      doctorName: "Dr. Ashok Rajgopal",
      chiefComplaint: "Bilateral severe knee pain (Right > Left), severe right knee effusion, difficulty standing or walking.",
      duration: "Chronic 2 years, acute flare-up for 4 days",
      painScore: 8,
      symptoms: ["Right Knee Swelling", "Joint Stiffness", "Difficulty Walking"],
      pastHistory: ["Bilateral Osteoarthritis Grade 3", "Hypertension"],
      currentMedications: [
        { name: "Amlodipine", dose: "5mg", frequency: "OD" }
      ],
      allergies: ["Diclofenac / NSAIDs (Causes severe stomach burning)"],
      scannedDocsCount: 1,
      scannedDocs: [
        {
          id: "doc-103-1",
          type: "X-Ray Report",
          title: "Bilateral Knee AP Standing View",
          ocrSnippet: "Findings: Severe medial joint space narrowing in Right Knee with subchondral sclerosis. Kellgren-Lawrence Grade IV Osteoarthritis.",
          extractedEntities: {
            xrayFinding: "Kellgren-Lawrence Grade 4 Osteoarthritis Right Knee",
            jointSpace: "Severe medial reduction"
          }
        }
      ],
      aiSummary: "62-year-old male with bilateral knee osteoarthritis presenting with acute severe right knee pain, joint effusion, and inability to bear weight. Scanned X-ray confirms Grade IV tricompartmental osteoarthritis right knee with bone-on-bone contact. Patient requires orthopaedic evaluation for TKR.",
      doctorNotes: "Right knee warm with joint effusion (+). Medial joint line tenderness marked. Counseled regarding Total Knee Arthroplasty (TKR).",
      finalDiagnosis: "Grade 4 Osteoarthritis Right Knee with Effusion",
      status: "Waiting"
    }
  ],

  // Multilingual Strings for Kiosk
  i18n: {
    en: {
      selectLanguage: "Select Language / भाषा चुनें",
      touchVoiceSub: "Touch buttons or speak directly into the microphone. Voice guidance is active.",
      kioskTitle: "MediKiosik — AI Smart OPD Pre-Consultation",
      kioskSubtitle: "High-Speed OPD Check-in & Medical History Intake",
      step1: "Patient Identification",
      step2: "Chief Complaint & Symptoms",
      step3: "Duration & Severity",
      step4: "Past History & Medications",
      step5: "Scan Reports & Prescriptions",
      step6: "Confirmation",
      step7: "AI Summary & OPD Slip",
      patientName: "Patient Full Name",
      phoneOrAbha: "Mobile Number or ABHA ID",
      age: "Age (Years)",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      tapMicToSpeak: "Tap to Speak (English or Hindi)",
      listening: "Listening... Please describe your symptoms clearly",
      speakHelp: "Example: 'I have severe chest pain and breathlessness since morning' or 'बुखार और सिरदर्द है'",
      commonSymptomsTitle: "Or Tap Quick Symptoms:",
      durationQuestion: "How long have you had this problem?",
      painScaleQuestion: "How severe is your discomfort or pain? (1 to 10 scale)",
      pastConditionsTitle: "Do you have any existing medical conditions?",
      medsTitle: "Are you currently taking any regular medications?",
      allergiesTitle: "Do you have any known drug or food allergies?",
      redFlagAlertTitle: "EMERGENCY SAFETY ALERT TRIGGERED",
      redFlagAlertMsg: "Our clinical rule engine detected potential high-risk emergency symptoms. Emergency OPD Triage staff has been automatically alerted.",
      redFlagAction: "Please proceed directly to the Emergency Room / Triage Desk immediately.",
      scanDocumentTitle: "Scan or Upload Medical Documents",
      scanDocumentSub: "Upload your previous doctor prescriptions or lab reports. Our AI will automatically extract medicines and test values.",
      chooseSampleDoc: "Or Try Instant Sample Documents:",
      btnNext: "Next Step →",
      btnBack: "← Back",
      btnGenerateSummary: "Generate AI History & Print Token →",
      generatingSummary: "MediKiosik AI structuring your clinical history...",
      tokenGenerated: "OPD Pre-Checkin Complete!",
      tokenMsg: "Please carry this token slip to your assigned doctor's OPD room."
    },
    hi: {
      selectLanguage: "भाषा चुनें / Select Language",
      touchVoiceSub: "स्क्रीन पर बटन दबाएं या माइक्रोफोन में सीधे बोलें। वॉयस सहायता सक्रिय है।",
      kioskTitle: "मेडीकियोसिक — एआई स्मार्ट ओपीडी प्री-परामर्श कियोस्क",
      kioskSubtitle: "तेज़ ओपीडी चेक-इन और मेडिकल हिस्ट्री सारांश",
      step1: "मरीज की पहचान",
      step2: "मुख्य समस्या एवं लक्षण",
      step3: "अवधि एवं दर्द की तीव्रता",
      step4: "पिछली बीमारी और दवाएं",
      step5: "दस्तावेज़ एवं पर्ची स्कैन",
      step6: "सत्यापन",
      step7: "एआई सारांश एवं टोकन पर्ची",
      patientName: "मरीज का पूरा नाम",
      phoneOrAbha: "मोबाइल नंबर या आभा (ABHA) आईडी",
      age: "उम्र (वर्ष)",
      gender: "लिंग",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      tapMicToSpeak: "बोलने के लिए माइक दबाएं (हिंदी या अंग्रेजी)",
      listening: "सुन रहे हैं... कृपया अपने लक्षण विस्तार से बताएं",
      speakHelp: "उदाहरण: 'मुझे सुबह से सीने में तेज दर्द और पसीना आ रहा है'",
      commonSymptomsTitle: "या नीचे दिए गए मुख्य लक्षणों पर टैप करें:",
      durationQuestion: "आपको यह समस्या कितने समय से है?",
      painScaleQuestion: "तकलीफ या दर्द कितना गंभीर है? (1 से 10 का पैमाना)",
      pastConditionsTitle: "क्या आपको इनमें से कोई पुरानी बीमारी है?",
      medsTitle: "क्या आप नियमित रूप से कोई दवाई लेते हैं?",
      allergiesTitle: "क्या आपको किसी दवा या चीज़ से एलर्जी है?",
      redFlagAlertTitle: "आपातकालीन सुरक्षा अलर्ट जारी!",
      redFlagAlertMsg: "सिस्टम ने आपातकालीन लक्षण पहचाने हैं। ओपीडी इमरजेंसी ट्रायज स्टाफ को तुरंत सूचित कर दिया गया है।",
      redFlagAction: "कृपया तुरंत अस्पताल इमरजेंसी वार्ड या ट्रायज डेस्क पर संपर्क करें।",
      scanDocumentTitle: "पुराने पर्चे या जांच रिपोर्ट स्कैन करें",
      scanDocumentSub: "अपनी पुरानी डॉक्टर की पर्ची या ब्लड रिपोर्ट लगाएं। हमारा AI आपकी दवाएं और जांच तुरंत निकाल लेगा।",
      chooseSampleDoc: "या तुरंत टेस्ट करने के लिए सैंपल रिपोर्ट चुनें:",
      btnNext: "आगे बढ़ें →",
      btnBack: "← पीछे जाएं",
      btnGenerateSummary: "एआई सारांश बनाएं और टोकन प्राप्त करें →",
      generatingSummary: "MediKiosik AI मेडिकल रिकॉर्ड तैयार कर रहा है...",
      tokenGenerated: "ओपीडी प्री-चेकइन सफलतापूर्वक संपन्न!",
      tokenMsg: "कृपया इस टोकन पर्ची को अपने डॉक्टर के ओपीडी रूम में दिखाएं।"
    }
  },

  // Symptom Chips
  symptomChips: [
    { en: "Chest Pain / Heavy Pressure", hi: "सीने में तेज दर्द / भारीपन", isEmergency: true },
    { en: "High Fever & Chills", hi: "तेज बुखार एवं कंपकंपी" },
    { en: "Severe Shortness of Breath", hi: "सांस लेने में भारी तकलीफ", isEmergency: true },
    { en: "Persistent Cough (>2 weeks)", hi: "लगातार खांसी (2 हफ्ते से अधिक)" },
    { en: "Severe Acid Reflux / Heartburn", hi: "पेट में जलन एवं खट्टी डकार" },
    { en: "Abdominal Cramps / Pain", hi: "पेट में तेज मरोड़ एवं दर्द" },
    { en: "Knee / Joint Pain & Swelling", hi: "घुटनों व जोड़ों में दर्द व सूजन" },
    { en: "Severe Headache & Dizziness", hi: "तेज सिरदर्द एवं चक्कर आना" },
    { en: "Sudden Weakness / Numbness", hi: "अचानक कमजोरी या सुन्नपन", isEmergency: true },
    { en: "Vomiting & Nausea", hi: "उल्टी एवं जी मिचलाना" }
  ],

  durations: [
    { en: "Just Today (< 24 Hours)", hi: "आज ही (24 घंटे से कम)" },
    { en: "2 to 3 Days", hi: "2 से 3 दिन" },
    { en: "1 to 2 Weeks", hi: "1 से 2 सप्ताह" },
    { en: "1 to 3 Months", hi: "1 से 3 महीने" },
    { en: "More than 6 Months (Chronic)", hi: "6 महीने से अधिक (पुरानी)" }
  ],

  pastDiseases: [
    { en: "Diabetes (शुगर)", key: "diabetes" },
    { en: "Hypertension (हाई बीपी)", key: "htn" },
    { en: "Heart Disease (हृदय रोग)", key: "cad" },
    { en: "Asthma / Bronchitis (दमा)", key: "asthma" },
    { en: "Thyroid Disorder (थायराइड)", key: "thyroid" },
    { en: "Kidney Disease (गुर्दा रोग)", key: "ckd" },
    { en: "Past Surgery (पूर्व ऑपरेशन)", key: "surgery" },
    { en: "None / No Known Illness", key: "none" }
  ],

  commonAllergies: [
    { en: "Penicillin / Amoxicillin", hi: "पेनिसिलिन" },
    { en: "Sulfa Drugs", hi: "सल्फा दवाएं" },
    { en: "Aspirin / NSAID Painkillers", hi: "एस्पिरिन / दर्दनिवारक" },
    { en: "Contrast Dye", hi: "कंट्रास्ट डाई" },
    { en: "Dust & Pollen Allergy", hi: "धूल एवं परागकण" },
    { en: "No Known Drug Allergies (NKDA)", hi: "कोई एलर्जी नहीं" }
  ],

  // Nearest Hospitals with Location Factors (Geospatial directory around Byculla / South Mumbai)
  nearestHospitals: [
    {
      id: "hosp-1",
      name: "MHSSCE Healthcare Center & Hospital",
      tagline: "Primary Hospital Hub & On-Campus Health Services",
      type: "Tertiary Multi-Specialty & Campus OPD",
      address: "M.H. Saboo Siddik Campus, 8 Shepherd Road, Byculla, Mumbai 400008",
      distanceKm: 0.2,
      travelTimeMins: 2,
      locationFactor: "Immediate Campus Zone (0.2 km)",
      emergency24x7: true,
      icuBedsAvailable: 14,
      opdTimings: "24x7 Emergency & Daily OPD 8:00 AM - 8:00 PM",
      phone: "+91 22 2301 2922",
      badge: "Primary Assigned Hub",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      rating: 4.9,
      mapQuery: "https://maps.google.com/?q=MH+Saboo+Siddik+College+of+Engineering+Byculla+Mumbai",
      specialties: ["General Medicine", "Triage & Emergency", "Cardiology", "Trauma Care", "Pathology Lab"]
    },
    {
      id: "hosp-2",
      name: "Sir J.J. Group of Hospitals",
      tagline: "Premier Govt Teaching & Level-1 Trauma Hospital",
      type: "Super-Specialty Govt Hospital",
      address: "J.J. Marg, Nagpada, Byculla, Mumbai 400008",
      distanceKm: 1.4,
      travelTimeMins: 6,
      locationFactor: "1.4 km (Very Close)",
      emergency24x7: true,
      icuBedsAvailable: 28,
      opdTimings: "24x7 Emergency / OPD 8:30 AM - 1:30 PM",
      phone: "+91 22 2373 5555",
      badge: "Level 1 Trauma Center",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      rating: 4.6,
      mapQuery: "https://maps.google.com/?q=Sir+JJ+Hospital+Byculla+Mumbai",
      specialties: ["Cardiovascular Surgery", "Trauma", "Neurology", "Burn Unit", "Critical Care"]
    },
    {
      id: "hosp-3",
      name: "B.Y.L. Nair Charitable Hospital & TNMC",
      tagline: "Leading Municipal Medical College & Tertiary Referral Hospital",
      type: "Tertiary Care & Emergency",
      address: "Dr. A.L. Nair Road, Mumbai Central, Mumbai 400008",
      distanceKm: 2.1,
      travelTimeMins: 9,
      locationFactor: "2.1 km (Short Drive)",
      emergency24x7: true,
      icuBedsAvailable: 20,
      opdTimings: "24x7 Casualty & OPD 8:00 AM - 2:00 PM",
      phone: "+91 22 2302 7000",
      badge: "Tertiary Referral",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
      rating: 4.5,
      mapQuery: "https://maps.google.com/?q=BYL+Nair+Hospital+Mumbai+Central",
      specialties: ["General Surgery", "Pediatrics", "Orthopaedics", "Radiology & MRI", "Dialysis"]
    },
    {
      id: "hosp-4",
      name: "Saifee Hospital",
      tagline: "Modern Multi-Disciplinary Super Specialty Hospital",
      type: "Multi-Specialty Private Care",
      address: "15/17 Maharshi Karve Road, Charni Road East, Mumbai 400004",
      distanceKm: 3.8,
      travelTimeMins: 14,
      locationFactor: "3.8 km (14 Mins)",
      emergency24x7: true,
      icuBedsAvailable: 12,
      opdTimings: "24x7 Emergency / OPD 9:00 AM - 7:00 PM",
      phone: "+91 22 6757 0111",
      badge: "NABH Accredited",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      rating: 4.8,
      mapQuery: "https://maps.google.com/?q=Saifee+Hospital+Charni+Road+Mumbai",
      specialties: ["Robotic Surgery", "Cardiology", "Gastroenterology", "Oncology", "Advanced ICU"]
    },
    {
      id: "hosp-5",
      name: "K.E.M. Hospital & Seth G.S. Medical College",
      tagline: "Major Apex Super-Specialty Medical Institute",
      type: "Apex Super-Specialty Center",
      address: "Acharya Donde Marg, Parel, Mumbai 400012",
      distanceKm: 4.2,
      travelTimeMins: 16,
      locationFactor: "4.2 km (Parel Corridor)",
      emergency24x7: true,
      icuBedsAvailable: 35,
      opdTimings: "24x7 Emergency & Critical Care",
      phone: "+91 22 2410 7000",
      badge: "Apex Center",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      rating: 4.7,
      mapQuery: "https://maps.google.com/?q=KEM+Hospital+Parel+Mumbai",
      specialties: ["Organ Transplant", "Neurosurgery", "Cardiac Sciences", "Hematology", "Toxicology"]
    }
  ]
};

window.MEDIKIOSIK_DATA = MEDIKIOSIK_DATA;
