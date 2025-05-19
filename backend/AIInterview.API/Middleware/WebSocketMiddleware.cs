using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using AIInterview.API.Services;

namespace AIInterview.API.Middleware;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<WebSocketMiddleware> _logger;
    private readonly WebSocketConnectionManager _connectionManager;
    private readonly ICodeExecutionService _codeExecutionService;
    private readonly IWebRTCService _webRTCService;

    public WebSocketMiddleware(
        RequestDelegate next,
        ILogger<WebSocketMiddleware> logger,
        WebSocketConnectionManager connectionManager,
        ICodeExecutionService codeExecutionService,
        IWebRTCService webRTCService)
    {
        _next = next;
        _logger = logger;
        _connectionManager = connectionManager;
        _codeExecutionService = codeExecutionService;
        _webRTCService = webRTCService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            await _next(context);
            return;
        }

        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var connectionId = _connectionManager.AddSocket(socket);

        try
        {
            await HandleWebSocketConnection(socket, connectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling WebSocket connection");
        }
        finally
        {
            _connectionManager.RemoveSocket(connectionId);
        }
    }

    private async Task HandleWebSocketConnection(WebSocket socket, string connectionId)
    {
        var buffer = new byte[1024 * 4];
        var receiveResult = await socket.ReceiveAsync(
            new ArraySegment<byte>(buffer), CancellationToken.None);

        while (!receiveResult.CloseStatus.HasValue)
        {
            if (receiveResult.MessageType == WebSocketMessageType.Text)
            {
                var message = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
                await HandleMessage(socket, connectionId, message);
            }

            receiveResult = await socket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);
        }

        await socket.CloseAsync(
            receiveResult.CloseStatus.Value,
            receiveResult.CloseStatusDescription,
            CancellationToken.None);
    }

    private async Task HandleMessage(WebSocket socket, string connectionId, string message)
    {
        try
        {
            var webSocketMessage = JsonSerializer.Deserialize<WebSocketMessage>(message);
            if (webSocketMessage == null) return;

            switch (webSocketMessage.Type)
            {
                case "code_execution":
                    await HandleCodeExecution(socket, connectionId, webSocketMessage.Data);
                    break;
                case "test_result":
                    await HandleTestResult(socket, connectionId, webSocketMessage.Data);
                    break;
                case "interview_status":
                    await HandleInterviewStatus(socket, connectionId, webSocketMessage.Data);
                    break;
                case "webrtc_signal":
                    await HandleWebRTCSignal(socket, connectionId, webSocketMessage.Data);
                    break;
                default:
                    _logger.LogWarning("Unknown message type: {Type}", webSocketMessage.Type);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling WebSocket message");
            await SendErrorMessage(socket, "Error processing message");
        }
    }

    private async Task HandleCodeExecution(WebSocket socket, string connectionId, JsonElement data)
    {
        var code = data.GetProperty("code").GetString();
        var language = data.GetProperty("language").GetString();

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(language))
        {
            await SendErrorMessage(socket, "Invalid code execution request");
            return;
        }

        try
        {
            // Send initial status
            await SendMessage(socket, new WebSocketMessage
            {
                Type = "code_execution",
                Data = new { status = "running" }
            });

            // Execute code
            var result = await _codeExecutionService.ExecuteCodeAsync(code, language);

            // Send result
            await SendMessage(socket, new WebSocketMessage
            {
                Type = "code_execution",
                Data = new { status = "completed", result }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing code");
            await SendMessage(socket, new WebSocketMessage
            {
                Type = "code_execution",
                Data = new { status = "error", error = ex.Message }
            });
        }
    }

    private async Task HandleTestResult(WebSocket socket, string connectionId, JsonElement data)
    {
        var testCaseId = data.GetProperty("testCaseId").GetString();
        var result = data.GetProperty("result");

        if (string.IsNullOrEmpty(testCaseId))
        {
            await SendErrorMessage(socket, "Invalid test result");
            return;
        }

        // Broadcast test result to all connected clients
        await _connectionManager.BroadcastMessage(new WebSocketMessage
        {
            Type = "test_result",
            Data = new { testCaseId, result }
        });
    }

    private async Task HandleInterviewStatus(WebSocket socket, string connectionId, JsonElement data)
    {
        var status = data.GetProperty("status").GetString();

        if (string.IsNullOrEmpty(status))
        {
            await SendErrorMessage(socket, "Invalid interview status");
            return;
        }

        // Broadcast status to all connected clients
        await _connectionManager.BroadcastMessage(new WebSocketMessage
        {
            Type = "interview_status",
            Data = new { status }
        });
    }

    private async Task HandleWebRTCSignal(WebSocket socket, string connectionId, JsonElement data)
    {
        // Forward WebRTC signal to the appropriate peer
        var targetConnectionId = data.GetProperty("targetConnectionId").GetString();
        if (!string.IsNullOrEmpty(targetConnectionId))
        {
            var targetSocket = _connectionManager.GetSocketById(targetConnectionId);
            if (targetSocket != null)
            {
                await SendMessage(targetSocket, new WebSocketMessage
                {
                    Type = "webrtc_signal",
                    Data = data
                });
            }
        }
    }

    private async Task SendErrorMessage(WebSocket socket, string error)
    {
        await SendMessage(socket, new WebSocketMessage
        {
            Type = "error",
            Data = new { message = error }
        });
    }

    private async Task SendMessage(WebSocket socket, WebSocketMessage message)
    {
        if (socket.State != WebSocketState.Open) return;

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);
        await socket.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            CancellationToken.None);
    }
}

public class WebSocketMessage
{
    public string Type { get; set; } = string.Empty;
    public object Data { get; set; } = new();
} 