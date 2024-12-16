using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder =>
    {
        policyBuilder.WithOrigins("http://localhost:5173", "http://localhost:5295")
           .AllowAnyMethod()
           .AllowCredentials()
           .AllowAnyHeader();
    });
});
builder.Services.AddSingleton<IBoardService, BoardService>();
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnection");
});

var app = builder.Build();
app.UseCors();
// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
app.MapHub<BoardHub>("api/pastesync");


app.MapGet("/", () => "Hello World!");

app.MapGet("api/board/{id}", async (string id, IBoardService boardService) =>
{
    string boardContent = await boardService.GetBoardAsync(id);
    return boardContent;
});

app.MapPost("api/board/{id}", async (string id, [FromBody] string content, IBoardService boardService) =>
{
    await boardService.SaveBoardAsync(id, content);
    return Results.Ok(new { Message = "Board saved successfully!" });
});

app.Run();


// Interface for BoardService
public interface IBoardService
{
    Task<string> GetBoardAsync(string id);
    Task SaveBoardAsync(string id, string content);
}

// Implementation of BoardService using DistributedCache
public class BoardService : IBoardService
{
    private readonly IDistributedCache _cache;

    public BoardService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<string> GetBoardAsync(string id)
    {
        var content = await _cache.GetStringAsync(id);
        if (string.IsNullOrEmpty(content))
        {
            content = ""; // Default content for a new board
            await _cache.SetStringAsync(id, content);
        }
        return content;
    }

    public async Task SaveBoardAsync(string id, string content)
    {
        var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(DateTimeOffset.Now.AddHours(5));
        await _cache.SetStringAsync(id, content, options);
    }
}
public interface IBoardClient
{
    Task ReceiveText(string content);
}
public class BoardHub : Hub<IBoardClient>
{
    private readonly IBoardService boardService;
    public BoardHub(IBoardService boardService)
    {
        this.boardService = boardService;
    }
    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
    }

    public async Task UpdateBoard(string boardId, string content)
    {
        Console.WriteLine("board content: " + content);
        await boardService.SaveBoardAsync(boardId, content);
        await Clients.OthersInGroup(boardId).ReceiveText(content);
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        Console.WriteLine($"User {Context.ConnectionId} connected");
    }

}


