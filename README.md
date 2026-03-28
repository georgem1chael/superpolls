# SuperPolls

A real-time platform for scheduling, polling, and collaborative decision-making.  
Built during a Distributed and Web Programming course (Erasmus+).

---

## Features

- User authentication
- Create and manage polls/surveys
- Availability scheduling (heatmap calendar)
- Brainstorming wall
- Dockerised setup

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, Flask, SQLAlchemy
- **Database:** SQLite
- **Infrastructure:** Docker, Docker Compose

---

## Architecture

### Monolith (`monolith` branch)

Frontend → Flask Backend → SQLite

### Microservices (`microservices` branch)
Frontend
├── Auth Service
└── Survey Service


---

## Trade-offs

| Monolith | Microservices |
|---|---|
| Simple | More flexible |
| Tightly coupled | Loosely coupled |
| No network overhead | Added latency |

---

## Run

```bash
docker-compose up --build

Frontend: http://localhost:5173
