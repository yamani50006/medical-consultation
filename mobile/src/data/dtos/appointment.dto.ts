export type AppointmentDto = {
  id: string;
  doctorId: string;
  patientId?: string;
  appointmentDate: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  doctor?: {
    user?: {
      fullName?: string;
      email?: string;
    };
  };
};
