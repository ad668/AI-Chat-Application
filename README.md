# GenAI Interactive Hub

A simple ASP.NET web app that provides an interactive AI experience with four features:

- Chat assistant
- Text summarization
- Sentiment analysis
- Text-to-speech playback in the browser

The app uses GitHub Models through the .NET AI SDK and serves a lightweight frontend built with HTML, CSS, and JavaScript.

## Features

- Ask questions and receive conversational responses
- Summarize long text into a short clear summary
- Analyze the sentiment of reviews or short feedback
- Enter text and listen to speech output directly in the browser
- Clean and modern responsive interface

## Tech Stack

- .NET 9
- ASP.NET Core minimal web API
- Microsoft.Extensions.AI
- OpenAI client integration
- Static frontend files in the wwwroot folder



## Prerequisites

- .NET SDK 9.0 or later
- A GitHub Models API token



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

- Text-to-speech playback is handled in the browser using the Web Speech API.
- Audio files are no longer saved on the server; speech plays directly in the interface.

- The app expects the GitHub Models token to be available in user secrets under the key `GithubModels:Token`.
- If the backend is not running, the frontend will show an error message instead of a response.


