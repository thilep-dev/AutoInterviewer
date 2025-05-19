using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;
using AIInterview.Infrastructure.Data;

namespace AIInterview.Infrastructure.Repositories
{
    public class CodeSubmissionRepository : ICodeSubmissionRepository
    {
        private readonly ApplicationDbContext _context;

        public CodeSubmissionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CodeSubmission> GetByIdAsync(Guid id)
        {
            return await _context.CodeSubmissions
                .Include(cs => cs.TestCases)
                .FirstOrDefaultAsync(cs => cs.Id == id);
        }

        public async Task<IEnumerable<CodeSubmission>> GetByInterviewIdAsync(Guid interviewId)
        {
            return await _context.CodeSubmissions
                .Include(cs => cs.TestCases)
                .Where(cs => cs.InterviewId == interviewId)
                .OrderByDescending(cs => cs.SubmittedAt)
                .ToListAsync();
        }

        public async Task<CodeSubmission> AddAsync(CodeSubmission submission)
        {
            await _context.CodeSubmissions.AddAsync(submission);
            await _context.SaveChangesAsync();
            return submission;
        }

        public async Task<CodeSubmission> UpdateAsync(CodeSubmission submission)
        {
            _context.Entry(submission).State = EntityState.Modified;
            foreach (var testCase in submission.TestCases)
            {
                _context.Entry(testCase).State = testCase.Id == Guid.Empty 
                    ? EntityState.Added 
                    : EntityState.Modified;
            }
            await _context.SaveChangesAsync();
            return submission;
        }

        public async Task DeleteAsync(Guid id)
        {
            var submission = await _context.CodeSubmissions
                .Include(cs => cs.TestCases)
                .FirstOrDefaultAsync(cs => cs.Id == id);

            if (submission != null)
            {
                _context.CodeSubmissions.Remove(submission);
                await _context.SaveChangesAsync();
            }
        }
    }
} 