# Use the official .NET image as a build stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TextCompletion/TextCompletion.csproj", "TextCompletion/"]
RUN dotnet restore "TextCompletion/TextCompletion.csproj"
COPY . .
WORKDIR "/src/TextCompletion"
RUN dotnet build "TextCompletion.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TextCompletion.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TextCompletion.dll"]
