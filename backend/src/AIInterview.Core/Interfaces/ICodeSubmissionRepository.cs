using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using AIInterview.Core.Domain;

namespace AIInterview.Core.Interfaces
{
    public interface ICodeSubmissionRepository
    {
        Task<CodeSubmission> GetByIdAsync(Guid id);
        Task<IEnumerable<CodeSubmission>> GetByInterviewIdAsync(Guid interviewId);
        Task<CodeSubmission> AddAsync(CodeSubmission submission);
        Task<CodeSubmission> UpdateAsync(CodeSubmission submission);
        Task DeleteAsync(Guid id);
    }
} 