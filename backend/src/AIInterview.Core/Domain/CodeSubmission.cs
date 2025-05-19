using System;
using System.Collections.Generic;
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
        public List<TestCase> TestCases { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public enum SubmissionStatus
    {
        Pending,
        Running,
        Completed,
        Failed,
        Timeout
    }

    public class TestCase
    {
        public Guid Id { get; set; }
        public Guid CodeSubmissionId { get; set; }
        public CodeSubmission CodeSubmission { get; set; }
        public string Input { get; set; }
        public string ExpectedOutput { get; set; }
        public string ActualOutput { get; set; }
        public bool Passed { get; set; }
        public string Status { get; set; }
        public int ExecutionTime { get; set; }
        public int MemoryUsed { get; set; }
    }
} 