using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIInterview.Core.Domain;
using AIInterview.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AIInterview.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobDescriptionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobDescriptionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobDescriptions()
        {
            var jobDescriptions = await _context.JobDescriptions.ToListAsync();
            return Ok(jobDescriptions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobDescription(Guid id)
        {
            var jobDescription = await _context.JobDescriptions.FindAsync(id);
            if (jobDescription == null)
            {
                return NotFound();
            }
            return Ok(jobDescription);
        }

        [HttpPost]
        public async Task<IActionResult> CreateJobDescription([FromBody] JobDescription jobDescription)
        {
            _context.JobDescriptions.Add(jobDescription);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJobDescription), new { id = jobDescription.Id }, jobDescription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJobDescription(Guid id, [FromBody] JobDescription jobDescription)
        {
            if (id != jobDescription.Id)
            {
                return BadRequest();
            }
            _context.Entry(jobDescription).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobDescription(Guid id)
        {
            var jobDescription = await _context.JobDescriptions.FindAsync(id);
            if (jobDescription == null)
            {
                return NotFound();
            }
            _context.JobDescriptions.Remove(jobDescription);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishJobDescription(Guid id)
        {
            var jobDescription = await _context.JobDescriptions.FindAsync(id);
            if (jobDescription == null)
            {
                return NotFound();
            }
            jobDescription.IsPublished = true;
            await _context.SaveChangesAsync();
            return Ok(jobDescription);
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> CloseJobDescription(Guid id)
        {
            var jobDescription = await _context.JobDescriptions.FindAsync(id);
            if (jobDescription == null)
            {
                return NotFound();
            }
            jobDescription.IsClosed = true;
            await _context.SaveChangesAsync();
            return Ok(jobDescription);
        }
    }
} 