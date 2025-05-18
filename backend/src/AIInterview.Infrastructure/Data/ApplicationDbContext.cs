using System;
using Microsoft.EntityFrameworkCore;
using AIInterview.Core.Domain;

namespace AIInterview.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<InterviewQuestion> InterviewQuestions { get; set; }
        public DbSet<CodeSubmission> CodeSubmissions { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<JobDescription> JobDescriptions { get; set; }
        public DbSet<InterviewParticipant> InterviewParticipants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Candidate
            modelBuilder.Entity<Candidate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.ResumeContent).IsRequired();
                entity.HasOne(e => e.AssignedJobDescription)
                    .WithMany(e => e.Candidates)
                    .HasForeignKey(e => e.AssignedJobDescriptionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure JobDescription
            modelBuilder.Entity<JobDescription>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Department).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired();
            });

            // Configure Interview
            modelBuilder.Entity<Interview>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Candidate)
                    .WithMany(e => e.Interviews)
                    .HasForeignKey(e => e.CandidateId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.JobDescription)
                    .WithMany(e => e.Interviews)
                    .HasForeignKey(e => e.JobDescriptionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure InterviewQuestion
            modelBuilder.Entity<InterviewQuestion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuestionText).IsRequired();
                entity.Property(e => e.CandidateAnswer);
                entity.Property(e => e.AIEvaluation);
                entity.Property(e => e.Score).HasPrecision(5, 2);
                entity.HasOne(e => e.Interview)
                    .WithMany(e => e.Questions)
                    .HasForeignKey(e => e.InterviewId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CodeSubmission
            modelBuilder.Entity<CodeSubmission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired();
                entity.Property(e => e.Language).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Score).HasPrecision(5, 2);
                entity.HasOne(e => e.Interview)
                    .WithMany(e => e.CodeSubmissions)
                    .HasForeignKey(e => e.InterviewId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure InterviewParticipant
            modelBuilder.Entity<InterviewParticipant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Interview)
                    .WithMany(e => e.Participants)
                    .HasForeignKey(e => e.InterviewId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User)
                    .WithMany(e => e.InterviewParticipations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
} 