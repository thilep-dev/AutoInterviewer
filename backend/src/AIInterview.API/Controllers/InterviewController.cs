using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;
using AIInterview.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AIInterview.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewController : ControllerBase
    {
        private readonly IAIInterviewService _interviewService;
        private readonly ApplicationDbContext _context;

        public InterviewController(IAIInterviewService interviewService, ApplicationDbContext context)
        {
            _interviewService = interviewService;
            _context = context;
        }

        // --- CRUD Endpoints ---
        [HttpGet]
        public async Task<IActionResult> GetInterviews()
        {
            var interviews = await _context.Interviews
                .Include(i => i.Candidate)
                .Include(i => i.JobDescription)
                .Select(i => new {
                    i.Id,
                    i.CandidateId,
                    candidateName = i.Candidate != null ? i.Candidate.Name : null,
                    i.JobDescriptionId,
                    jobTitle = i.JobDescription != null ? i.JobDescription.Title : null,
                    i.Mode,
                    i.Difficulty,
                    i.ScheduleType,
                    i.ScheduledTime,
                    i.Status,
                    i.MeetingRoomId,
                    i.Duration,
                    i.Questions,
                    i.CodeSubmissions,
                    i.Participants
                })
                .ToListAsync();
            return Ok(interviews);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInterview(Guid id)
        {
            var interview = await _context.Interviews
                .Include(i => i.Candidate)
                .Include(i => i.JobDescription)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (interview == null)
            {
                return NotFound();
            }
            return Ok(interview);
        }

        [HttpPost]
        public async Task<IActionResult> CreateInterview([FromBody] Interview interview)
        {
            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInterview), new { id = interview.Id }, interview);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInterview(Guid id, [FromBody] Interview interview)
        {
            if (id != interview.Id)
            {
                return BadRequest();
            }
            _context.Entry(interview).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(Guid id)
        {
            var interview = await _context.Interviews.FindAsync(id);
            if (interview == null)
            {
                return NotFound();
            }
            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Existing AI Endpoints ---
        [HttpPost("generate-question")]
        public async Task<IActionResult> GenerateQuestion([FromBody] Interview interview, [FromQuery] QuestionType type)
        {
            var question = await _interviewService.GenerateQuestionAsync(interview, type);
            return Ok(question);
        }

        [HttpPost("evaluate-answer")]
        public async Task<IActionResult> EvaluateAnswer([FromQuery] string question, [FromQuery] string answer, [FromQuery] QuestionType type)
        {
            var score = await _interviewService.EvaluateAnswerAsync(question, answer, type);
            return Ok(score);
        }

        [HttpPost("evaluate-code")]
        public async Task<IActionResult> EvaluateCode([FromQuery] string code, [FromQuery] string language, [FromQuery] string expectedOutput)
        {
            var score = await _interviewService.EvaluateCodeSubmissionAsync(code, language, expectedOutput);
            return Ok(score);
        }

        [HttpPost("generate-summary")]
        public async Task<IActionResult> GenerateSummary([FromBody] Interview interview)
        {
            var summary = await _interviewService.GenerateInterviewSummaryAsync(interview);
            return Ok(summary);
        }

        [HttpPost("analyze-resume")]
        public async Task<IActionResult> AnalyzeResume([FromBody] string resumeContent)
        {
            var analysis = await _interviewService.AnalyzeResumeAsync(resumeContent);
            return Ok(analysis);
        }

        [HttpPost("match-job")]
        public async Task<IActionResult> MatchJob([FromQuery] string resumeContent, [FromQuery] string jobDescription)
        {
            var match = await _interviewService.MatchJobDescriptionAsync(resumeContent, jobDescription);
            return Ok(match);
        }

        [HttpPost("generate-behavioral-feedback")]
        public async Task<IActionResult> GenerateBehavioralFeedback([FromBody] string answer)
        {
            var feedback = await _interviewService.GenerateBehavioralFeedbackAsync(answer);
            return Ok(feedback);
        }

        [HttpPost("generate-technical-feedback")]
        public async Task<IActionResult> GenerateTechnicalFeedback([FromBody] string answer)
        {
            var feedback = await _interviewService.GenerateTechnicalFeedbackAsync(answer);
            return Ok(feedback);
        }

        [HttpPost("generate-coding-feedback")]
        public async Task<IActionResult> GenerateCodingFeedback([FromQuery] string code, [FromQuery] string language)
        {
            var feedback = await _interviewService.GenerateCodingFeedbackAsync(code, language);
            return Ok(feedback);
        }
    }
} 