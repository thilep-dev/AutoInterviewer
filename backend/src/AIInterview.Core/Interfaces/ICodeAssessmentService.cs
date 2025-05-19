using System;
using System.Threading.Tasks;
using AIInterview.Core.Domain;

namespace AIInterview.Core.Interfaces
{
    public interface ICodeAssessmentService
    {
        Task<CodeSubmission> SubmitCodeAsync(
            Guid interviewId,
            string code,
            string language,
            string[] testCases);
        
        Task<CodeSubmission> GetSubmissionResultAsync(Guid submissionId);
        
        Task<CodeSubmission> EvaluateSubmissionAsync(
            Guid submissionId,
            string[] expectedOutputs,
            int timeLimit,
            int memoryLimit);
    }
} 