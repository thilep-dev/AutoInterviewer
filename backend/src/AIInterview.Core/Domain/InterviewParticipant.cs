using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class InterviewParticipant : BaseEntity
    {
        public Guid InterviewId { get; set; }
        public Interview Interview { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public ParticipantRole Role { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public string ConnectionId { get; set; }
    }

    public enum ParticipantRole
    {
        Interviewer,
        Candidate,
        Observer
    }
} 