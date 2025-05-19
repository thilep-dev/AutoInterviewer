using System;

namespace AIInterview.API.Models
{
    public class SubmitCodeRequest
    {
        public Guid InterviewId { get; set; }
        public string Code { get; set; }
        public string Language { get; set; }
        public string[] TestCases { get; set; }
    }

    public class EvaluateSubmissionRequest
    {
        public string[] ExpectedOutputs { get; set; }
        public int TimeLimit { get; set; }
        public int MemoryLimit { get; set; }
    }
} 