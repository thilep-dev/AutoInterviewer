// Job Description Model
export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string;
  responsibilities: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum JobType {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  Contract = 'Contract',
  Internship = 'Internship'
}

export enum JobStatus {
  Draft = 'Draft',
  Published = 'Published',
  Closed = 'Closed'
} 