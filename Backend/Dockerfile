FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ["PadelBackend.csproj", "./"]
RUN dotnet restore "./PadelBackend.csproj"

COPY . .
RUN dotnet publish "PadelBackend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

CMD ["dotnet", "PadelBackend.dll"]