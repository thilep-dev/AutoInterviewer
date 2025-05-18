using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class InterviewQuestion : BaseEntity
    {
        public Guid InterviewId { get; set; }
        public Interview Interview { get; set; }
        public string QuestionText { get; set; }
        public QuestionType Type { get; set; }
        public string AIEvaluation { get; set; }
        public string CandidateAnswer { get; set; }
        public decimal Score { get; set; }
        public int QuestionOrder { get; set; }
    }

    public enum QuestionType
    {
        Behavioral,
        Technical,
        Coding
    }
} 