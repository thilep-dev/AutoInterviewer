using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace AIInterview.API.Services;

public class WebSocketConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();
    private readonly ILogger<WebSocketConnectionManager> _logger;

    public WebSocketConnectionManager(ILogger<WebSocketConnectionManager> logger)
    {
        _logger = logger;
    }

    public string AddSocket(WebSocket socket)
    {
        var connectionId = Guid.NewGuid().ToString();
        _sockets.TryAdd(connectionId, socket);
        _logger.LogInformation("WebSocket connection added: {ConnectionId}", connectionId);
        return connectionId;
    }

    public void RemoveSocket(string connectionId)
    {
        if (_sockets.TryRemove(connectionId, out var socket))
        {
            try
            {
                socket.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Connection closed by the server",
                    CancellationToken.None).Wait();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error closing WebSocket connection: {ConnectionId}", connectionId);
            }
            _logger.LogInformation("WebSocket connection removed: {ConnectionId}", connectionId);
        }
    }

    public WebSocket? GetSocketById(string connectionId)
    {
        return _sockets.TryGetValue(connectionId, out var socket) ? socket : null;
    }

    public async Task BroadcastMessage(object message)
    {
        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);
        var arraySegment = new ArraySegment<byte>(bytes);

        var tasks = _sockets.Select(async kvp =>
        {
            if (kvp.Value.State == WebSocketState.Open)
            {
                try
                {
                    await kvp.Value.SendAsync(
                        arraySegment,
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error broadcasting message to connection: {ConnectionId}", kvp.Key);
                }
            }
        });

        await Task.WhenAll(tasks);
    }

    public async Task SendMessageToConnection(string connectionId, object message)
    {
        if (_sockets.TryGetValue(connectionId, out var socket) && socket.State == WebSocketState.Open)
        {
            try
            {
                var json = JsonSerializer.Serialize(message);
                var bytes = Encoding.UTF8.GetBytes(json);
                await socket.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to connection: {ConnectionId}", connectionId);
            }
        }
    }

    public IEnumerable<string> GetAllConnectionIds()
    {
        return _sockets.Keys;
    }

    public int GetActiveConnectionCount()
    {
        return _sockets.Count;
    }
} 