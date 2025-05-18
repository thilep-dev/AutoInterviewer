using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class CodeSubmission : BaseEntity
    {
        public Guid InterviewId { get; set; }
        public Interview Interview { get; set; }
        public string Language { get; set; }
        public string Code { get; set; }
        public string Judge0Result { get; set; }
        public decimal Score { get; set; }
        public SubmissionStatus Status { get; set; }
        public string ErrorMessage { get; set; }
        public TimeSpan ExecutionTime { get; set; }
        public int MemoryUsage { get; set; }
    }

    public enum SubmissionStatus
    {
        Pending,
        Running,
        Completed,
        Failed,
        Timeout
    }
} 