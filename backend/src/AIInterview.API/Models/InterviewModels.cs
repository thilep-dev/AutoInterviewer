using System;
using AIInterview.Core.Domain;
using AIInterview.Core.Enums;

namespace AIInterview.API.Models
{
    public class ScheduleInterviewRequest
    {
        public Guid CandidateId { get; set; }
        public Guid InterviewerId { get; set; }
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public InterviewType Type { get; set; }
    }

    public class UpdateStatusRequest
    {
        public InterviewStatus Status { get; set; }
    }
} 