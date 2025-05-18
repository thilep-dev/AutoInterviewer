using System;
using AIInterview.Core.Common;

namespace AIInterview.Core.Domain
{
    public class User : BaseEntity
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public UserRole Role { get; set; }
        public ICollection<InterviewParticipant> InterviewParticipations { get; set; }
    }

    public enum UserRole
    {
        Admin,
        HR,
        Candidate
    }
} 