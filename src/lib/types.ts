export type Professor = {
  id: string;
  name: string;
  email: string;
  expertise: string;
  courses: string[];
};

export type UniversityApplication = {
  id: string;
  university: string;
  program: string;
  deadline: string;
  description: string;
};

export type LoRStatus = 'Requested' | 'In Progress' | 'Submitted';

export type LoRRequest = {
  id: string;
  professorId: string;
  applicationId: string;
  status: LoRStatus;
  deadline: string;
  reminderSent: boolean;
};