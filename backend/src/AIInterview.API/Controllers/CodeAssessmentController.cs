using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;
using AIInterview.API.Models;

namespace AIInterview.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CodeAssessmentController : ControllerBase
    {
        private readonly ICodeAssessmentService _codeAssessmentService;

        public CodeAssessmentController(ICodeAssessmentService codeAssessmentService)
        {
            _codeAssessmentService = codeAssessmentService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitCode([FromBody] SubmitCodeRequest request)
        {
            try
            {
                var submission = await _codeAssessmentService.SubmitCodeAsync(
                    request.InterviewId,
                    request.Code,
                    request.Language,
                    request.TestCases
                );
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("submission/{id}")]
        public async Task<IActionResult> GetSubmissionResult(Guid id)
        {
            try
            {
                var submission = await _codeAssessmentService.GetSubmissionResultAsync(id);
                if (submission == null)
                    return NotFound();
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("evaluate/{id}")]
        public async Task<IActionResult> EvaluateSubmission(Guid id, [FromBody] EvaluateSubmissionRequest request)
        {
            try
            {
                var submission = await _codeAssessmentService.EvaluateSubmissionAsync(
                    id,
                    request.ExpectedOutputs,
                    request.TimeLimit,
                    request.MemoryLimit
                );
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 