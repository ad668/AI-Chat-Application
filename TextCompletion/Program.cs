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

if (string.IsNullOrWhiteSpace(token))
{
    throw new InvalidOperationException("GitHub API token is missing in configuration. Set GithubModels:Token in app settings, use the environment variable GITHUB_MODELS_TOKEN, or use GithubModels__Token / githubmodels__token for ASP.NET config binding.");
}

var credentials = new ApiKeyCredential(token);
var options = new OpenAIClientOptions()
{
    Endpoint = new Uri("https://models.github.ai/inference")
};

var openAiClient = new OpenAIClient(credentials, options);
var chatClient = openAiClient.GetChatClient("openai/gpt-4.1").AsIChatClient();

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
    var prompt = $"Summarize the following text in 2 clear sentences:\n\n{request.Text}";
    var response = await chatClient.GetResponseAsync(prompt);
    return Results.Ok(new ApiResponse(response?.Text ?? "No summary returned."));
});

app.MapPost("/api/sentiment", async (SentimentRequest request) =>
{
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
