using System;
using AIInterview.Core.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIInterview.Core.Domain
{
    public class Candidate : BaseEntity
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ResumeContent { get; set; }
        [NotMapped]
        public string ResumeContentBase64 { get; set; }
        public string ResumePath { get; set; }
        public InterviewDifficulty DifficultyLevel { get; set; }
        public InterviewMode Mode { get; set; }
        public ScheduleType ScheduleType { get; set; }
        public CandidateStatus Status { get; set; }
        public Guid? AssignedJobDescriptionId { get; set; }
        public JobDescription? AssignedJobDescription { get; set; }
        public ICollection<Interview> Interviews { get; set; }
    }

    public enum InterviewDifficulty
    {
        Basic,
        Intermediate,
        Advanced
    }

    public enum InterviewMode
    {
        Oral,
        Coding,
        Both
    }

    public enum ScheduleType
    {
        Manual,
        Automatic
    }

    public enum CandidateStatus
    {
        Scheduled,
        Ongoing,
        Selected,
        Rejected,
        Pending
    }
} 