# 🎾 Padel Mates — Padel Management System

> **Live App:** [padel-management-system-psi.vercel.app](https://padel-management-system-psi.vercel.app/)
> **API Docs:** [Swagger UI](https://padel-management-system-production.up.railway.app/swagger/index.html)

---

## What is Padel Mates?

Padel Mates is a full-stack web application for managing padel clubs and competitive play. It handles the full user flow from court reservations to post-match ELO updates, giving players a seamless experience from booking a court to tracking their rank over time.

Players can register, log in, book courts, record 2v2 match results, and watch their stats evolve through an ELO-based ranking system. The platform also provides matchmaking recommendations based on balanced team ELO, plus an analytics dashboard for reviewing match history, win rates, and performance trends.

---

## Tech Stack

| Layer              | Technology           |
| ------------------ | -------------------- |
| Frontend           | React + Vite         |
| Backend            | ASP.NET Core Web API |
| Database           | PostgreSQL           |
| Auth               | JWT Bearer Token     |
| API Docs           | Swagger / OpenAPI    |
| Hosting — Frontend | Vercel               |
| Hosting — Backend  | Railway              |

---

## Features

* **User authentication** — register, log in, and stay authenticated using JWT
* **Court listing** — browse available courts and locations
* **Real-time availability** — view hourly court availability
* **Conflict-free booking** — create court bookings without overlaps
* **Booking history** — view upcoming, completed, and cancelled bookings
* **2v2 match creation** — create matches directly from confirmed bookings
* **Match result submission** — submit scores and trigger ELO/stat updates
* **Rankings** — view the leaderboard sorted by ELO rating
* **Matchmaking** — get balanced 2v2 matchup recommendations based on ELO
* **Analytics** — track personal performance, win rates, match history, and rating progress

---

## Deployments

| Environment            | URL                                                                           |
| ---------------------- | ----------------------------------------------------------------------------- |
| Frontend — Production  | https://padel-management-system-psi.vercel.app/                               |
| Frontend — Main Branch | https://padel-management-system-git-main-omarelmaraghys-projects.vercel.app/  |
| Frontend — Preview     | https://padel-management-system-dss6bnxgh-omarelmaraghys-projects.vercel.app/ |
| Backend API Docs       | https://padel-management-system-production.up.railway.app/swagger/index.html  |
| Backend API Base URL   | https://padel-management-system-production.up.railway.app/api                 |

---

## Running Locally

### Prerequisites

* [.NET SDK](https://dotnet.microsoft.com/) for the backend
* [Node.js](https://nodejs.org/) for the frontend
* PostgreSQL database instance

---

### 1. Clone the repository

```bash
git clone https://github.com/OmarElMaraghy/padel-management-system.git
cd padel-management-system
```

---

### 2. Start the backend

```bash
cd Backend
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

The backend will be available at:

```text
http://localhost:5180
```

Swagger will be available at:

```text
http://localhost:5180/swagger
```

---

### 3. Start the frontend

Open a new terminal:

```bash
cd Frontend/padel-ai
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

By default, local development points to:

```text
http://localhost:5180/api
```

---

## Environment Variables

| Variable            | Local Value                 | Production Value                                                |
| ------------------- | --------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5180/api` | `https://padel-management-system-production.up.railway.app/api` |

For local development, this value is optional because the frontend already falls back to `http://localhost:5180/api`.

For Vercel deployment, `VITE_API_BASE_URL` must be added in the Vercel project environment variables.

---

## Demo Walkthrough

1. Open the [live app](https://padel-management-system-psi.vercel.app/) and register or log in.
2. Navigate to **Booking**.
3. Select a court, choose a date, and pick a future time slot.
4. Confirm the booking.
5. Go to **Analytics** and create a match using that booking.
6. Select 4 players, submit the match result, and confirm the match.
7. Check the **Rankings** page to see updated ELO scores.
8. Explore **Analytics** to view match history and performance trends.

---

## Repository

GitHub Repository:

```text
https://github.com/OmarElMaraghy/padel-management-system
```
