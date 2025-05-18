export interface Interview {
  id?: string;
  candidateId: string;
  candidate?: any;
  jobDescriptionId: string;
  jobDescription?: any;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  scheduleType: ScheduleType;
  scheduledTime: string;
  status: InterviewStatus;
  meetingRoomId: string;
  questions?: any[];
  codeSubmissions?: any[];
  participants?: any[];
  duration?: number;
  notes?: string;
  feedback?: string;
  rating?: number;
}

export enum InterviewStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export enum InterviewMode {
  Oral = 0,
  Coding = 1,
  Both = 2
}

export enum InterviewDifficulty {
  Basic = 0,
  Intermediate = 1,
  Advanced = 2
}

export enum ScheduleType {
  Manual = 0,
  Automatic = 1
} 