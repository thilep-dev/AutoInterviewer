using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class Interview : BaseEntity
    {
        public Guid CandidateId { get; set; }
        public Candidate? Candidate { get; set; }
        public Guid JobDescriptionId { get; set; }
        public JobDescription? JobDescription { get; set; }
        public InterviewMode Mode { get; set; }
        public InterviewDifficulty Difficulty { get; set; }
        public ScheduleType ScheduleType { get; set; }
        public DateTime ScheduledTime { get; set; }
        public InterviewStatus Status { get; set; }
        public string MeetingRoomId { get; set; }
        public int Duration { get; set; } // Duration in minutes
        public ICollection<InterviewQuestion> Questions { get; set; }
        public ICollection<CodeSubmission> CodeSubmissions { get; set; }
        public ICollection<InterviewParticipant> Participants { get; set; }
    }

    public enum InterviewStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }
} 