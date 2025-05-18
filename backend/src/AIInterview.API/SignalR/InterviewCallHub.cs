using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace AIInterview.API.SignalR
{
    public class InterviewCallHub : Hub
    {
        public async Task SendSignal(string roomId, string user, string signal)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveSignal", user, signal);
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }
    }
} 