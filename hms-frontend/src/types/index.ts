export type Role =
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_STAFF'
  | 'PHARMACIST'
  | 'ACCOUNTANT';

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
  userId?: number;
}

export interface User {
  userId: number;
  username: string;
  role: Role;
  token: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Doctor {
  id?: number;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  fullName?: string;
  full_name?: string;
  specialization: string;
  department?: Department | null;
  phone?: string;
  email: string;
  workingDays?: string;
  working_days?: string;
  workingHours?: string;
  working_hours?: string;
  status?: string;
  active?: boolean;
}

export interface Patient {
  id?: number;
  patientNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nic: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  conditionSummary?: string;
  registrationDate?: string;
}



export interface Appointment {
  id?: number;
  patient: Patient;
  doctor: Doctor;
  appointmentTime: string;
  reason?: string;
  notes?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export interface MedicalRecord {
  id?: number;
  patient: Patient;
  doctor: Doctor;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  visitDate?: string;
}

export interface LaboratoryTest {
  id?: number;
  patient: Patient;
  testName: string;
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'COMPLETED' | 'CANCELLED';
  resultDetails?: string;
  requestedDate?: string;
}

export interface Medicine {
  id?: number;
  name: string;
  category: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  reorderLevel: number;
}

export interface Invoice {
  id?: number;
  patient: Patient;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
  createdAt?: string;
}

export interface Admission {
  id?: number;
  patient: Patient;
  wardNumber: string;
  bedNumber: string;
  admissionDate?: string;
  dischargeDate?: string;
  status: 'ADMITTED' | 'DISCHARGED';
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
}