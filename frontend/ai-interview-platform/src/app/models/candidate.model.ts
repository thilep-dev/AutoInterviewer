export interface Candidate {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  resumeContent: string;
  resumePath?: string;
  difficultyLevel: string;
  mode: string;
  scheduleType: string;
  status: string;
  assignedJobDescriptionId: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export enum CandidateStatus {
  New = 'New',
  InReview = 'In Review',
  InterviewScheduled = 'Interview Scheduled',
  Interviewed = 'Interviewed',
  Offered = 'Offered',
  Hired = 'Hired',
  Rejected = 'Rejected'
} 