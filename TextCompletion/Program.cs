using Microsoft.Extensions.AI;
using OpenAI;
using System.ClientModel;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddUserSecrets<Program>();

var token = builder.Configuration["GithubModels:Token"]
    ?? builder.Configuration["GITHUB_MODELS_TOKEN"]
    ?? builder.Configuration["githubmodels_token"]
    ?? builder.Configuration["GithubModels__Token"]
    ?? builder.Configuration["githubmodels__token"]
    ?? Environment.GetEnvironmentVariable("GITHUB_MODELS_TOKEN")
    ?? Environment.GetEnvironmentVariable("githubmodels_token")
    ?? Environment.GetEnvironmentVariable("GithubModels__Token")
    ?? Environment.GetEnvironmentVariable("githubmodels__token");

OpenAIClient? openAiClient = null;
IChatClient? chatClient = null;

if (string.IsNullOrWhiteSpace(token))
{
    Console.WriteLine("WARNING: GitHub API token is missing. OpenAI endpoints will return 503 until GITHUB_MODELS_TOKEN or GithubModels__Token is configured.");
}
else
{
    var credentials = new ApiKeyCredential(token);
    var options = new OpenAIClientOptions()
    {
        Endpoint = new Uri("https://models.github.ai/inference")
    };

    openAiClient = new OpenAIClient(credentials, options);
    chatClient = openAiClient.GetChatClient("openai/gpt-4.1").AsIChatClient();
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/api/chat", async (ChatRequest request) =>
{
    if (chatClient is null)
    {
        return Results.Problem("GitHub API token is missing. Set GITHUB_MODELS_TOKEN or GithubModels__Token in environment variables.", statusCode: 503);
    }

    var prompt = new[]
    {
        new ChatMessage(ChatRole.System, "You are a friendly AI assistant that responds clearly and helpfully."),
        new ChatMessage(ChatRole.User, request.Message)
    };

    var response = await chatClient.GetResponseAsync(prompt);
    return Results.Ok(new ApiResponse(response?.Text ?? "No response returned."));
});

app.MapPost("/api/summarize", async (SummaryRequest request) =>
{
    if (chatClient is null)
    {
        return Results.Problem("GitHub API token is missing. Set GITHUB_MODELS_TOKEN or GithubModels__Token in environment variables.", statusCode: 503);
    }

    var prompt = $"Summarize the following text in 2 clear sentences:\n\n{request.Text}";
    var response = await chatClient.GetResponseAsync(prompt);
    return Results.Ok(new ApiResponse(response?.Text ?? "No summary returned."));
});

app.MapPost("/api/sentiment", async (SentimentRequest request) =>
{
    if (chatClient is null)
    {
        return Results.Problem("GitHub API token is missing. Set GITHUB_MODELS_TOKEN or GithubModels__Token in environment variables.", statusCode: 503);
    }

    var prompt = $"Analyze sentiment for the text below. Return a short summary and label the overall tone as Positive, Neutral, or Negative:\n\n{request.Text}";
    var response = await chatClient.GetResponseAsync(prompt);
    return Results.Ok(new ApiResponse(response?.Text ?? "No sentiment returned."));
});

app.MapFallbackToFile("index.html");
app.Run();

internal sealed record ChatRequest(string Message);
internal sealed record SummaryRequest(string Text);
internal sealed record SentimentRequest(string Text);
internal sealed record ApiResponse(string Result);
