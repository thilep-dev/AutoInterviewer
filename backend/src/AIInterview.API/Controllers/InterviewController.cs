using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;
using AIInterview.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using AIInterview.API.Hubs;
using System.Net.Mail;

namespace AIInterview.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewController : ControllerBase
    {
        private readonly IAIInterviewService _interviewService;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<InterviewHub> _hubContext;

        public InterviewController(IAIInterviewService interviewService, ApplicationDbContext context, IHubContext<InterviewHub> hubContext)
        {
            _interviewService = interviewService;
            _context = context;
            _hubContext = hubContext;
        }

        // --- CRUD Endpoints ---
        [HttpGet]
        public async Task<IActionResult> GetInterviews()
        {
            var interviews = await _context.Interviews
                .Include(i => i.Candidate)
                .Include(i => i.JobDescription)
                .ToListAsync();
            return Ok(interviews);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInterview(Guid id)
        {
            var interview = await _context.Interviews
                .Include(i => i.Candidate)
                .Include(i => i.JobDescription)
                .Include(i => i.Questions)
                .Include(i => i.CodeSubmissions)
                .Include(i => i.Participants)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null)
                return NotFound();

            return Ok(interview);
        }

        [HttpPost]
        public async Task<IActionResult> CreateInterview([FromBody] Interview interview)
        {
            // Generate unique meetingRoomId
            interview.MeetingRoomId = Guid.NewGuid().ToString();
            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();

            // Send meeting invite email
            var candidate = await _context.Candidates.FindAsync(interview.CandidateId);
            var job = await _context.JobDescriptions.FindAsync(interview.JobDescriptionId);
            var interviewerEmail = "interviewer@example.com"; // Replace with actual interviewer email logic
            if (candidate != null && !string.IsNullOrEmpty(candidate.Email))
            {
                SendMeetingInvite(candidate.Email, interviewerEmail, interview.MeetingRoomId, job?.Title ?? "Interview");
            }

            return CreatedAtAction(nameof(GetInterview), new { id = interview.Id }, interview);
        }

        private void SendMeetingInvite(string candidateEmail, string interviewerEmail, string meetingRoomId, string jobTitle)
        {
            string link = $"https://yourdomain.com/meeting/{meetingRoomId}";
            string subject = $"Your Interview Meeting Link for {jobTitle}";
            string body = $"You are invited to an interview. Please join at: {link}";

            var mail = new MailMessage();
            mail.To.Add(candidateEmail);
            mail.To.Add(interviewerEmail);
            mail.Subject = subject;
            mail.Body = body;

            // Configure SMTP client (update with your SMTP settings)
            using (var smtp = new SmtpClient("smtp.yourdomain.com"))
            {
                smtp.Port = 587;
                smtp.Credentials = new System.Net.NetworkCredential("youruser", "yourpassword");
                smtp.EnableSsl = true;
                try { smtp.Send(mail); } catch { /* handle or log error */ }
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInterview(Guid id, [FromBody] Interview interview)
        {
            if (id != interview.Id)
                return BadRequest();

            _context.Entry(interview).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(Guid id)
        {
            var interview = await _context.Interviews.FindAsync(id);
            if (interview == null)
                return NotFound();

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Existing AI Endpoints ---
        [HttpPost("generate-question")]
        public async Task<IActionResult> GenerateQuestion([FromBody] Interview interview, [FromQuery] QuestionType type)
        {
            var question = await _interviewService.GenerateQuestionAsync(interview, type);
            await _hubContext.Clients.Group(interview.Id.ToString()).SendAsync("ReceiveAIQuestion", question);
            return Ok(question);
        }

        [HttpPost("evaluate-answer")]
        public async Task<IActionResult> EvaluateAnswer([FromQuery] string question, [FromQuery] string answer, [FromQuery] QuestionType type, [FromQuery] Guid interviewId)
        {
            var feedback = await _interviewService.EvaluateAnswerAsync(question, answer, type);
            await _hubContext.Clients.Group(interviewId.ToString()).SendAsync("ReceiveAIFeedback", feedback);
            return Ok(feedback);
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