# GenAI Interactive Hub

A simple ASP.NET web app that provides an interactive AI experience with three features:

- Chat assistant
- Text summarization
- Sentiment analysis

The app uses GitHub Models through the .NET AI SDK and serves a lightweight frontend built with HTML, CSS, and JavaScript.

## Features

- Ask questions and receive conversational responses
- Summarize long text into a short clear summary
- Analyze the sentiment of reviews or short feedback
- Clean and modern responsive interface

## Tech Stack

- .NET 9
- ASP.NET Core minimal web API
- Microsoft.Extensions.AI
- OpenAI client integration
- Static frontend files in the wwwroot folder

## Project Structure

```text
genai-dotnet/
├── TextCompletion/
│   ├── Program.cs
│   ├── TextCompletion.csproj
│   └── wwwroot/
│       ├── app.js
│       ├── index.html
│       └── styles.css
└── genai-dotnet.sln
```

## Prerequisites

- .NET SDK 9.0 or later
- A GitHub Models API token

## Setup

1. Clone the repository.
2. Open the project folder.
3. Configure your GitHub Models token using user secrets:

```bash
dotnet user-secrets init
dotnet user-secrets set "GithubModels:Token" "YOUR_GITHUB_MODELS_TOKEN"
```

## Run the Application

From the project folder:

```bash
cd TextCompletion
dotnet run
```

Then open the local URL shown in the terminal, usually one of:

- http://localhost:5000
- http://localhost:5001

## API Endpoints

The app exposes these backend endpoints:

- POST /api/chat
  - Sends a chat message to the AI model
- POST /api/summarize
  - Summarizes the provided text
- POST /api/sentiment
  - Analyzes sentiment for the provided text

## Notes

- The app expects the GitHub Models token to be available in user secrets under the key `GithubModels:Token`.
- If the backend is not running, the frontend will show an error message instead of a response.

## License

This project is for educational and demonstration purposes.
