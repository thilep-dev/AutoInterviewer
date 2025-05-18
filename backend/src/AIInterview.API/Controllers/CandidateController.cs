using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIInterview.Core.Domain;
using AIInterview.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text;

namespace AIInterview.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidateController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCandidates()
        {
            var candidates = await _context.Candidates.ToListAsync();
            return Ok(candidates);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCandidate(Guid id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }
            return Ok(candidate);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCandidate([FromBody] Candidate candidate)
        {
            if (!string.IsNullOrEmpty(candidate.ResumeContentBase64))
            {
                try
                {
                    var bytes = Convert.FromBase64String(candidate.ResumeContentBase64);
                    candidate.ResumeContent = Encoding.UTF8.GetString(bytes);
                }
                catch (FormatException)
                {
                    return BadRequest("Invalid base64 string for resume content");
                }
            }
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCandidate), new { id = candidate.Id }, candidate);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCandidate(Guid id, [FromBody] Candidate candidate)
        {
            if (id != candidate.Id)
            {
                return BadRequest();
            }
            _context.Entry(candidate).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCandidate(Guid id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }
            _context.Candidates.Remove(candidate);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/resume")]
        public async Task<IActionResult> UploadResume(Guid id, [FromForm] IFormFile resume)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }

            if (resume == null || resume.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{candidate.Id}_{resume.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await resume.CopyToAsync(stream);
            }

            candidate.ResumePath = filePath;
            await _context.SaveChangesAsync();

            return Ok(candidate);
        }
    }
} 