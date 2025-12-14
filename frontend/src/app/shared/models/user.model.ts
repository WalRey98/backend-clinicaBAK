export interface User {
  id: string;
  name: string;
  lastname?: string;
  email: string;
  avatar?: string;
  username?: string;
  date?: string; // fecha de nacimiento u otra
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  country?: string;
  rut?: string;
  password?: string;
  role: 'DOCTOR' | 'ENFERMERA' | 'AUXILIAR' | 'ADMIN';
  authProvider: 'local' | 'google' | 'microsoft';
  status: 'active' | 'inactive';
  loginStatus: 'active' | 'inactive' | 'suspended';
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  clinica?: string;

  // Extras que puede enviar el backend
  active?: boolean;
  lastSeen?: string;
  lastActiveDays?: number;
}