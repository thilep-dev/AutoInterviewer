using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;
using Microsoft.Extensions.Configuration;

namespace AIInterview.Infrastructure.Services
{
    public class CodeAssessmentService : ICodeAssessmentService
    {
        private readonly HttpClient _httpClient;
        private readonly string _judge0BaseUrl;
        private readonly IConfiguration _configuration;
        private readonly ICodeSubmissionRepository _submissionRepository;

        public CodeAssessmentService(
            HttpClient httpClient, 
            IConfiguration configuration,
            ICodeSubmissionRepository submissionRepository)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _submissionRepository = submissionRepository;
            _judge0BaseUrl = _configuration["Judge0:BaseUrl"] ?? "http://localhost:2358";
        }

        public async Task<CodeSubmission> SubmitCodeAsync(Guid interviewId, string code, string language, string[] testCases)
        {
            var submission = new CodeSubmission
            {
                Id = Guid.NewGuid(),
                InterviewId = interviewId,
                Code = code,
                Language = language,
                Status = SubmissionStatus.Pending,
                SubmittedAt = DateTime.UtcNow,
                TestCases = testCases.Select(tc => new TestCase 
                { 
                    Id = Guid.NewGuid(),
                    Input = tc,
                    Status = "Pending"
                }).ToList()
            };

            try
            {
                // Submit to Judge0
                var judge0Submission = new
                {
                    source_code = code,
                    language_id = GetLanguageId(language),
                    stdin = string.Join("\n", testCases)
                };

                var response = await _httpClient.PostAsync(
                    $"{_judge0BaseUrl}/submissions",
                    new StringContent(JsonSerializer.Serialize(judge0Submission), Encoding.UTF8, "application/json")
                );

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<Judge0Response>();
                    submission.Judge0Result = result?.token;
                    submission.Status = SubmissionStatus.Running;
                }
                else
                {
                    submission.Status = SubmissionStatus.Failed;
                    submission.ErrorMessage = "Failed to submit code to Judge0";
                }

                // Save to database
                submission = await _submissionRepository.AddAsync(submission);
            }
            catch (Exception ex)
            {
                submission.Status = SubmissionStatus.Failed;
                submission.ErrorMessage = ex.Message;
                await _submissionRepository.AddAsync(submission);
            }

            return submission;
        }

        public async Task<CodeSubmission> GetSubmissionResultAsync(Guid submissionId)
        {
            try
            {
                // Get submission from database
                var submission = await _submissionRepository.GetByIdAsync(submissionId);
                if (submission == null)
                    throw new ArgumentException($"Submission {submissionId} not found");

                if (string.IsNullOrEmpty(submission.Judge0Result))
                    throw new InvalidOperationException("No Judge0 token found for submission");

                // Get result from Judge0
                var response = await _httpClient.GetAsync($"{_judge0BaseUrl}/submissions/{submission.Judge0Result}");
                if (!response.IsSuccessStatusCode)
                {
                    submission.Status = SubmissionStatus.Failed;
                    submission.ErrorMessage = "Failed to get result from Judge0";
                    await _submissionRepository.UpdateAsync(submission);
                    return submission;
                }

                var result = await response.Content.ReadFromJsonAsync<Judge0SubmissionResult>();
                if (result == null)
                {
                    submission.Status = SubmissionStatus.Failed;
                    submission.ErrorMessage = "Invalid response from Judge0";
                    await _submissionRepository.UpdateAsync(submission);
                    return submission;
                }

                // Update submission with Judge0 result
                submission.Status = MapJudge0Status(result.status);
                submission.ExecutionTime = TimeSpan.FromMilliseconds(result.time ?? 0);
                submission.MemoryUsage = result.memory ?? 0;

                if (result.stdout != null)
                {
                    var outputs = result.stdout.Split('\n');
                    for (int i = 0; i < Math.Min(outputs.Length, submission.TestCases.Count); i++)
                    {
                        submission.TestCases[i].ActualOutput = outputs[i];
                        submission.TestCases[i].Status = "Completed";
                    }
                }

                if (result.stderr != null)
                {
                    submission.ErrorMessage = result.stderr;
                }

                submission.CompletedAt = DateTime.UtcNow;
                await _submissionRepository.UpdateAsync(submission);
                return submission;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting submission result: {ex.Message}", ex);
            }
        }

        public async Task<CodeSubmission> EvaluateSubmissionAsync(Guid submissionId, string[] expectedOutputs, int timeLimit, int memoryLimit)
        {
            var submission = await GetSubmissionResultAsync(submissionId);
            if (submission.Status != SubmissionStatus.Completed)
                return submission;

            // Evaluate test cases
            for (int i = 0; i < Math.Min(expectedOutputs.Length, submission.TestCases.Count); i++)
            {
                var testCase = submission.TestCases[i];
                testCase.ExpectedOutput = expectedOutputs[i];
                testCase.Passed = testCase.ActualOutput?.Trim() == expectedOutputs[i]?.Trim();
            }

            // Check time and memory limits
            if (submission.ExecutionTime.TotalMilliseconds > timeLimit)
            {
                submission.Status = SubmissionStatus.Timeout;
                submission.ErrorMessage = "Execution time exceeded limit";
            }
            else if (submission.MemoryUsage > memoryLimit)
            {
                submission.Status = SubmissionStatus.Failed;
                submission.ErrorMessage = "Memory usage exceeded limit";
            }

            // Calculate score
            submission.Score = CalculateScore(submission);
            await _submissionRepository.UpdateAsync(submission);
            return submission;
        }

        private int GetLanguageId(string language)
        {
            return language.ToLower() switch
            {
                "python" => 71,
                "javascript" => 63,
                "java" => 62,
                "csharp" => 51,
                "cpp" => 54,
                _ => throw new ArgumentException($"Unsupported language: {language}")
            };
        }

        private SubmissionStatus MapJudge0Status(int judge0Status)
        {
            return judge0Status switch
            {
                1 => SubmissionStatus.Pending,
                2 => SubmissionStatus.Running,
                3 => SubmissionStatus.Completed,
                4 => SubmissionStatus.Failed,
                5 => SubmissionStatus.Timeout,
                _ => SubmissionStatus.Failed
            };
        }

        private decimal CalculateScore(CodeSubmission submission)
        {
            if (submission.TestCases == null || !submission.TestCases.Any())
                return 0;

            var passedTests = submission.TestCases.Count(tc => tc.Passed);
            return (decimal)passedTests / submission.TestCases.Count * 100;
        }

        private class Judge0Response
        {
            public string token { get; set; }
        }

        private class Judge0SubmissionResult
        {
            public int status { get; set; }
            public string stdout { get; set; }
            public string stderr { get; set; }
            public int? time { get; set; }
            public int? memory { get; set; }
        }
    }
} 