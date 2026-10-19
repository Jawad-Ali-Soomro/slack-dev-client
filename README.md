<div align="center">
  <img src="public/logo.svg" alt="Slack Dev" width="96" height="96">

  <h1>Slack Dev</h1>
  <p>The web app for a developer workspace: tasks, meetings, projects, GitHub repos, and team chat in one place.</p>
</div>

Slack Dev Client is the React interface for Slack Dev. You sign in, work from the dashboard, and talk to the API at `http://localhost:4000`. This repository is the frontend only. The API, database, and background jobs live in the Slack Dev server.

## What you can do

- Sign up, verify email, and reset a password
- Run a dashboard for tasks, meetings, and team activity
- Create and track tasks, including status, priority, and due dates
- Schedule meetings and join online ones through Jitsi
- Organize work in projects and workspaces
- Browse and buy projects on Explore
- Connect GitHub, open a repository, and create pull requests
- Chat with teammates and manage friends
- Turn on automations such as pull-request status sync
- Administer users and permissions

## Stack

React 19, Vite 7, React Router 7, Tailwind CSS 4, Socket.IO, and Axios. Payments use Stripe. The code editor uses CodeMirror.

## Requirements

- Node.js 22
- npm
- The Slack Dev server running on port 4000

## Install locally

```bash
git clone https://github.com/Jawad-Ali-Soomro/slack-dev-client.git
cd slack-dev-client
copy .sample.env .env
npm install
npm run dev
```

On macOS or Linux, use `cp .sample.env .env` instead of `copy`.

Open http://localhost:5173.

Fill in `.env` before you rely on GitHub login or payments. `.env` stays on your machine. Commit `.sample.env` only. The full notes are in [ENV-SETUP.md](ENV-SETUP.md).

```env
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_CLIENT_ID=
VITE_ENCRYPTION_KEY=
```

`VITE_API_URL` is the API origin. `VITE_CLIENT_ID` is the GitHub OAuth client id and must match the server. `VITE_ENCRYPTION_KEY` must match the server `ENCRYPTION_KEY`. The Stripe key is the publishable test key.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test:e2e` | Run Playwright |

## App map

| Route | Screen |
| --- | --- |
| `/` | Landing |
| `/login`, `/signup` | Account access |
| `/dashboard` | Home |
| `/dashboard/tasks` | Tasks |
| `/dashboard/meetings` | Meetings |
| `/dashboard/projects` | Projects |
| `/dashboard/teams` | Workspace |
| `/dashboard/repos` | GitHub repositories |
| `/dashboard/chat` | Messages |
| `/dashboard/automation` | Automations |
| `/dashboard/explore` | Explore and purchases |
| `/dashboard/admin/users` | User management |

## Layout

```
src/
  components/    Shared UI, chat, dashboard widgets
  contexts/      Auth, chat, theme, notifications
  pages/         Screens for each route
  services/      API clients
  hooks/         GitHub and permission hooks
public/
  logo.svg
```

## Docker

From the parent `slack-dev` folder, after both `.env` files exist:

```bash
docker compose up --build
```

The client container publishes port 5173. Compose sets `VITE_API_URL` to `http://localhost:4000`. Your local `.env` is not copied into the image.

## If it will not start

- Port 5173 is taken: stop the other process or change the Vite port.
- The UI loads and every request fails: the server is not running, or `VITE_API_URL` does not point at it.
- GitHub connect fails: `VITE_CLIENT_ID` does not match `GITHUB_CLIENT_ID` on the server.
