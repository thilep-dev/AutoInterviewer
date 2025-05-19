using System;

namespace AIInterview.Core.Domain
{
    public class InterviewFeedback
    {
        public Guid Id { get; set; }
        public Guid InterviewId { get; set; }
        public Interview Interview { get; set; }
        public string TechnicalScore { get; set; }
        public string CommunicationScore { get; set; }
        public string ProblemSolvingScore { get; set; }
        public string OverallScore { get; set; }
        public string Strengths { get; set; }
        public string AreasForImprovement { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 