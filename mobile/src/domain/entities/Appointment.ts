export type AppointmentEntity = {
  id: string;
  doctorId: string;
  patientId?: string;
  appointmentDate: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  doctorName?: string;
  doctorEmail?: string;
};
