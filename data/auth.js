window.MOCK_DATA = window.MOCK_DATA || {};
window.MOCK_DATA.auth = {
  users: [
    {
      id: "u1",
      email: "patient@careforge.demo",
      password: "patient123",
      role: "PATIENT",
      name: "Demo Patient"
    },
    {
      id: "u2",
      email: "doctor@careforge.demo",
      password: "doctor123",
      role: "DOCTOR",
      name: "Dr. Arjun Sharma",
      specialization: "General Medicine"
    },
    {
      id: "u3",
      email: "admin@careforge.demo",
      password: "admin123",
      role: "ORGANIZATION",
      name: "Admin User",
      organization: "MHSSCE Healthcare Center"
    }
  ]
};
