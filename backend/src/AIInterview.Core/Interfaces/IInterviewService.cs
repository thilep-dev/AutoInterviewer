using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIInterview.Core.Domain;
using AIInterview.Core.Enums;

namespace AIInterview.Core.Interfaces
{
    public interface IInterviewService
    {
        Task<Domain.Interview> CreateInterviewAsync(Domain.Interview interview);
        Task<Domain.Interview> GetInterviewByIdAsync(Guid id);
        Task<IEnumerable<Domain.Interview>> GetInterviewsByTypeAsync(InterviewType type);
        Task<IEnumerable<Domain.Interview>> GetInterviewsByCandidateIdAsync(Guid candidateId);
        Task<Domain.Interview> UpdateInterviewAsync(Domain.Interview interview);
        Task<bool> DeleteInterviewAsync(Guid id);
        Task<Domain.Interview> StartInterviewAsync(Guid id);
        Task<Domain.Interview> EndInterviewAsync(Guid id);
        Task<Domain.Interview> SubmitFeedbackAsync(Guid id, string feedback);
        Task<Domain.Interview> GenerateReportAsync(Guid id);
        Task<InterviewQuestion> GenerateNextQuestionAsync(Guid interviewId);
        Task<InterviewFeedback> EvaluateResponseAsync(Guid interviewId, string response);
    }
} 