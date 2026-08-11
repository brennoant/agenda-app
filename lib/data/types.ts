export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo

export interface WeeklyScheduleEntry {
  id: string;
  weekday: Weekday;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  sessionDurationMinutes: number;
}

export interface BlockedSlot {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string | null; // null = dia inteiro
  endTime: string | null;
  reason: string;
}

export type AppointmentStatus = "agendado" | "cancelado" | "reagendado";
export type PaymentStatus = "pago" | "pendente";

export interface Appointment {
  id: string;
  patientName: string;
  patientWhatsapp: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amountCents: number;
  createdAt: string; // ISO timestamp
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
}
