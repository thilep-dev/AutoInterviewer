using System;
using System.Threading.Tasks;
using Microsoft.SemanticKernel;
using AIInterview.Core.Domain;
using AIInterview.Core.Interfaces;

namespace AIInterview.Infrastructure.Services
{
    public class AIInterviewService : IAIInterviewService
    {
        private readonly Kernel _kernel;
        private readonly KernelFunction _questionGenerator;
        private readonly KernelFunction _answerEvaluator;
        private readonly KernelFunction _codeEvaluator;
        private readonly KernelFunction _summaryGenerator;
        private readonly KernelFunction _resumeAnalyzer;
        private readonly KernelFunction _jobMatcher;
        private readonly KernelFunction _feedbackGenerator;

        public AIInterviewService(Kernel kernel)
        {
            _kernel = kernel;
            _questionGenerator = kernel.CreateFunctionFromPrompt(
                "Generate an interview question based on the following context: {{$input}}"
            );
            _answerEvaluator = kernel.CreateFunctionFromPrompt(
                "Evaluate the following answer: {{$input}}"
            );
            _codeEvaluator = kernel.CreateFunctionFromPrompt(
                "Evaluate the following code: {{$input}}"
            );
            _summaryGenerator = kernel.CreateFunctionFromPrompt(
                "Generate a summary of the interview: {{$input}}"
            );
            _resumeAnalyzer = kernel.CreateFunctionFromPrompt(
                "Analyze the following resume: {{$input}}"
            );
            _jobMatcher = kernel.CreateFunctionFromPrompt(
                "Match the resume with the job description: {{$input}}"
            );
            _feedbackGenerator = kernel.CreateFunctionFromPrompt(
                "Generate feedback for the following: {{$input}}"
            );
        }

        public async Task<string> GenerateQuestionAsync(Interview interview, QuestionType type)
        {
            var input = $"Interview: {interview}, Type: {type}";
            var result = await _kernel.InvokeAsync(_questionGenerator, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<decimal> EvaluateAnswerAsync(string question, string answer, QuestionType type)
        {
            var input = $"Question: {question}, Answer: {answer}, Type: {type}";
            var result = await _kernel.InvokeAsync(_answerEvaluator, new() { ["input"] = input });
            return decimal.Parse(result.GetValue<string>());
        }

        public async Task<decimal> EvaluateCodeSubmissionAsync(string code, string language, string expectedOutput)
        {
            var input = $"Code: {code}, Language: {language}, Expected Output: {expectedOutput}";
            var result = await _kernel.InvokeAsync(_codeEvaluator, new() { ["input"] = input });
            return decimal.Parse(result.GetValue<string>());
        }

        public async Task<string> GenerateInterviewSummaryAsync(Interview interview)
        {
            var input = $"Interview: {interview}";
            var result = await _kernel.InvokeAsync(_summaryGenerator, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<string> AnalyzeResumeAsync(string resumeContent)
        {
            var input = $"Resume: {resumeContent}";
            var result = await _kernel.InvokeAsync(_resumeAnalyzer, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<string> MatchJobDescriptionAsync(string resumeContent, string jobDescription)
        {
            var input = $"Resume: {resumeContent}, Job Description: {jobDescription}";
            var result = await _kernel.InvokeAsync(_jobMatcher, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<string> GenerateBehavioralFeedbackAsync(string answer)
        {
            var input = $"Answer: {answer}, Type: behavioral";
            var result = await _kernel.InvokeAsync(_feedbackGenerator, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<string> GenerateTechnicalFeedbackAsync(string answer)
        {
            var input = $"Answer: {answer}, Type: technical";
            var result = await _kernel.InvokeAsync(_feedbackGenerator, new() { ["input"] = input });
            return result.GetValue<string>();
        }

        public async Task<string> GenerateCodingFeedbackAsync(string code, string language)
        {
            var input = $"Code: {code}, Language: {language}, Type: coding";
            var result = await _kernel.InvokeAsync(_feedbackGenerator, new() { ["input"] = input });
            return result.GetValue<string>();
        }
    }
} 