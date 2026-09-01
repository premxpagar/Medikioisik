window.MOCK_DATA = window.MOCK_DATA || {};
window.MOCK_DATA.organization = {
  name: "MHSSCE Healthcare Center",
  adminUser: "Admin User",
  metrics: {
    todayAppointments: 42,
    activeDoctors: 12,
    readyForConsultation: 8,
    priorityAlerts: 2
  }
};

function GetOrgNav() {
  return [
    { label: 'Dashboard', path: 'organization', icon: 'layout-dashboard' },
    { label: 'Doctors', path: 'organization/doctors', icon: 'stethoscope' },
    { label: 'Patients', path: 'organization/patients', icon: 'users' },
    { label: 'Appointments', path: 'organization/appointments', icon: 'calendar' },
    { label: 'Billing & Claims', path: 'organization/billing', icon: 'receipt' },
    { label: 'Alerts', path: 'organization/alerts', icon: 'bell' }
  ];
}
