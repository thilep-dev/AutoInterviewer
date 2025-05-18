using System;
using System.Threading.Tasks;
using AIInterview.Core.Domain;

namespace AIInterview.Core.Interfaces
{
    public interface IAIInterviewService
    {
        Task<string> GenerateQuestionAsync(Interview interview, QuestionType type);
        Task<decimal> EvaluateAnswerAsync(string question, string answer, QuestionType type);
        Task<decimal> EvaluateCodeSubmissionAsync(string code, string language, string expectedOutput);
        Task<string> GenerateInterviewSummaryAsync(Interview interview);
        Task<string> AnalyzeResumeAsync(string resumeContent);
        Task<string> MatchJobDescriptionAsync(string resumeContent, string jobDescription);
        Task<string> GenerateBehavioralFeedbackAsync(string answer);
        Task<string> GenerateTechnicalFeedbackAsync(string answer);
        Task<string> GenerateCodingFeedbackAsync(string code, string language);
    }
} 