using System;
using System.Collections.Generic;

namespace AIInterview.Core.DTOs
{
    public class InterviewDto
    {
        public Guid Id { get; set; }
        public Guid CandidateId { get; set; }
        public CandidateDto Candidate { get; set; }
        public Guid JobDescriptionId { get; set; }
        public JobDescriptionDto JobDescription { get; set; }
        public string Mode { get; set; }
        public string Difficulty { get; set; }
        public string ScheduleType { get; set; }
        public DateTime? ScheduledTime { get; set; }
        public string Status { get; set; }
        public string MeetingRoomId { get; set; }
        public int Duration { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
        public List<CodeSubmissionDto> CodeSubmissions { get; set; } = new List<CodeSubmissionDto>();
        public List<ParticipantDto> Participants { get; set; } = new List<ParticipantDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CandidateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string ResumeUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class JobDescriptionDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Department { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Location { get; set; }
        public string EmploymentType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class QuestionDto
    {
        public Guid Id { get; set; }
        public string QuestionText { get; set; }
        public string Type { get; set; }
        public int? Score { get; set; }
        public string Answer { get; set; }
        public string Feedback { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CodeSubmissionDto
    {
        public Guid Id { get; set; }
        public string Language { get; set; }
        public string Status { get; set; }
        public int? Score { get; set; }
        public string Code { get; set; }
        public string Output { get; set; }
        public string Feedback { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class ParticipantDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime? JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 