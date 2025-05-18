using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AIInterview.Core.Domain;

namespace AIInterview.API.Hubs
{
    public class InterviewHub : Hub
    {
        public async Task JoinInterview(string interviewId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, interviewId);
        }

        public async Task LeaveInterview(string interviewId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, interviewId);
        }

        public async Task SendQuestion(string interviewId, string questionText)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveQuestion", questionText);
        }

        public async Task SendAnswer(string interviewId, string answer)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveAnswer", answer);
        }

        public async Task SendCodeSubmission(string interviewId, string code, string language)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveCodeSubmission", code, language);
        }

        public async Task SendEvaluation(string interviewId, string evaluation)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveEvaluation", evaluation);
        }

        public async Task SendParticipantJoined(string interviewId, string participantName, ParticipantRole role)
        {
            await Clients.Group(interviewId).SendAsync("ParticipantJoined", participantName, role);
        }

        public async Task SendParticipantLeft(string interviewId, string participantName)
        {
            await Clients.Group(interviewId).SendAsync("ParticipantLeft", participantName);
        }

        public async Task SendVideoStream(string interviewId, string streamData)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveVideoStream", streamData);
        }

        public async Task SendAudioStream(string interviewId, string streamData)
        {
            await Clients.Group(interviewId).SendAsync("ReceiveAudioStream", streamData);
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
} 