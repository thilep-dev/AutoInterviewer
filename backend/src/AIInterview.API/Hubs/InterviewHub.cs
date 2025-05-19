using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AIInterview.Core.Interfaces;
using AIInterview.Core.Domain;

namespace AIInterview.API.Hubs
{
    public class InterviewHub : Hub
    {
        private readonly IInterviewService _interviewService;

        public InterviewHub(IInterviewService interviewService)
        {
            _interviewService = interviewService;
        }

        public async Task JoinInterview(Guid interviewId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, interviewId.ToString());
        }

        public async Task LeaveInterview(Guid interviewId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, interviewId.ToString());
        }

        public async Task SendMessage(Guid interviewId, string message)
        {
            await Clients.Group(interviewId.ToString()).SendAsync("ReceiveMessage", Context.ConnectionId, message);
        }

        public async Task SubmitAnswer(Guid interviewId, string answer)
        {
            var feedback = await _interviewService.EvaluateResponseAsync(interviewId, answer);
            await Clients.Group(interviewId.ToString()).SendAsync("ReceiveFeedback", feedback);
        }

        public async Task RequestNextQuestion(Guid interviewId)
        {
            var question = await _interviewService.GenerateNextQuestionAsync(interviewId);
            await Clients.Group(interviewId.ToString()).SendAsync("ReceiveQuestion", question);
        }

        // WebRTC signaling
        public async Task SendSignal(Guid interviewId, string signal)
        {
            await Clients.OthersInGroup(interviewId.ToString()).SendAsync("ReceiveSignal", Context.ConnectionId, signal);
        }

        public async Task ShareScreen(Guid interviewId, string streamId)
        {
            await Clients.OthersInGroup(interviewId.ToString()).SendAsync("ScreenShared", Context.ConnectionId, streamId);
        }

        public async Task StopScreenShare(Guid interviewId)
        {
            await Clients.OthersInGroup(interviewId.ToString()).SendAsync("ScreenShareStopped", Context.ConnectionId);
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