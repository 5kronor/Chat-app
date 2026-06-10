using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string username, string message, string role)
        {
            await Clients.All.SendAsync("ReceiveMessage", username, message, role);
        }

        public async Task SendAnnouncement(string username, string message, string role)
        {
            if (role != "teacher")
            {
                throw new HubException("Only teachers can send announcements.");
            }
            await Clients.All.SendAsync("ReceiveAnnouncement", username, message);
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("UserConnected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}