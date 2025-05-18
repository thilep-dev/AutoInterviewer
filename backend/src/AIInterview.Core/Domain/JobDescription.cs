using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class JobDescription : BaseEntity
    {
        public string Title { get; set; }
        public string Department { get; set; }
        public string Description { get; set; }
        public bool IsPublished { get; set; }
        public bool IsClosed { get; set; }
        public ICollection<Candidate>? Candidates { get; set; }
        public ICollection<Interview>? Interviews { get; set; }
    }
} 