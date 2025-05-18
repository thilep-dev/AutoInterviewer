# AI Interview Platform

A production-grade, AI-powered interview platform that enables automated technical and behavioral interviews with real-time HR participation.

## Features

- 🤖 AI-driven autonomous interview conduction
- 📹 Real-time video/audio communication via WebRTC
- 💻 Live coding assessment with Judge0 integration
- 👥 HR real-time participation and monitoring
- 📊 Comprehensive candidate evaluation and reporting
- 🔒 Secure authentication and role-based access control

## Tech Stack

### Backend
- ASP.NET Core Web API
- SignalR for real-time communication
- Semantic Kernel for AI orchestration
- Judge0 (Dockerized) for code execution
- MailKit for email notifications

### Frontend
- Angular 16+
- Angular Material UI
- Monaco Editor
- WebRTC

### AI Layer
- LangChain.NET/Semantic Kernel
- Local LLMs (Ollama with Mistral/LLaMA3)

### Database
- SQL Server

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+
- Docker & Docker Compose
- SQL Server
- Ollama (for local LLM)

### Development Setup

1. Clone the repository
```bash
git clone [repository-url]
cd ai-interview-platform
```

2. Start the required services
```bash
docker-compose up -d
```

3. Set up the backend
```bash
cd backend
dotnet restore
dotnet run
```

4. Set up the frontend
```bash
cd frontend
npm install
ng serve
```

5. Access the application
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Judge0: http://localhost:2358

## Project Structure

```
ai-interview-platform/
├── backend/                 # ASP.NET Core Web API
│   ├── src/
│   │   ├── AIInterview.API/
│   │   ├── AIInterview.Core/
│   │   ├── AIInterview.Infrastructure/
│   │   └── AIInterview.Application/
│   └── tests/
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   └── tests/
├── docker/                # Docker configuration
├── scripts/              # Deployment and setup scripts
└── docs/                # Documentation
```

## Security

- JWT-based authentication
- Role-based access control
- HTTPS enforcement
- Secure WebRTC connections
- Encrypted data storage

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 