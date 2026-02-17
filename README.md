# My Story Team

**Turn your life goals into a story worth directing.**

My Story Team is a cinematic planner and goal-management application that helps users break overwhelming ambitions into clear scenes, daily actions, and motivating milestones—so the future feels directed, not improvised.

---

## The Social Problem

Many people have important life goals—education, career growth, health, personal development—yet struggle to turn those goals into sustained action. Common obstacles include:

- **Not knowing where to begin** — Long-term ambitions feel abstract and intimidating
- **Feeling overwhelmed** — The scale of change leads to paralysis
- **Losing motivation over time** — Progress is invisible or hard to track
- **Neglecting daily habits** — Essential routines fall by the wayside

When these challenges persist, stress, anxiety, and burnout increase. Talented and motivated individuals may give up on their ambitions, leading to lost potential both personally and within society as a whole.

---

## Our Solution

My Story Team addresses this problem by providing a **visual, canvas-based planning environment** where users can:

1. **Break big goals into manageable steps** — Organize ambitions into clear, actionable scenes and milestones
2. **Stay motivated through visible progress** — See progress at a glance with connected elements and structured layouts
3. **Plan daily actions alongside long-term ambitions** — Balance short-term tasks with strategic vision on a single canvas

Instead of facing the future as one overwhelming task, users focus on meaningful steps, track their progress, and build momentum over time.

---

## Features

### Implemented

| Feature | Description |
|--------|-------------|
| **Interactive Canvases** | Create and edit visual canvases with draggable, resizable elements |
| **Rich Element Types** | Text notes, lists, tasks, images, audio, video, and date-based goals |
| **Connections** | Link related elements visually to show relationships and dependencies |
| **Dashboard** | Overview of favorites, personal canvases, and recently opened work |
| **Browse** | Explore public canvases shared by the community with sort filters (created at, updated at, name) |
| **Profile** | User profile with canvas statistics (canvases made, oldest/newest canvas) |
| **Background Customization** | Set background images and colors per canvas |
| **Authentication** | Sign in and registration with JWT-based auth |

### Planned (Not Yet Implemented)

| Feature | Description |
|--------|-------------|
| **Messages** | Direct messages and group chats for collaboration and support. The UI shell is in place (conversation list and thread panel); backend integration and real-time messaging are pending. |
| **AI Helper** | An AI-powered planning assistant to help users with tasks, canvases, and goal-setting. The interface exists with mocked responses; integration with an AI service is planned. |

---

## Tech Stack

- **Frontend:** Vue 3, TypeScript, Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** Scoped CSS with design tokens (colors, radii, typography)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mystoryteamv3.git
cd mystoryteamv3

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file (see `.env.example` for reference) and configure:

```env
VITE_API_BASE_URL=https://localhost:7109
```

Adjust the API base URL to match your backend server.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── api/           # API services (auth, canvas, user, ai)
├── components/    # Reusable Vue components
│   ├── ai/        # AI Helper components
│   ├── auth/      # Authentication forms
│   ├── canvas/    # Canvas editor, viewport, elements
│   ├── common/    # Shared UI components
│   └── dashboard/ # Dashboard and card components
├── composables/   # Vue composables
├── config/       # App configuration
├── layouts/      # App and public layouts
├── store/        # Pinia stores (auth, canvas, user, ai)
├── types/        # TypeScript type definitions
└── views/        # Page-level components
    ├── app/      # Authenticated app views (dashboard, browse, messages, ai-helper, profile, canvas)
    ├── auth/     # Sign in, register
    └── public/   # Home, discover, walkthrough, demonstrations
```

---

## API Integration

The application expects a backend API with endpoints such as:

- `POST /api/auth/login` — Authentication
- `POST /api/auth/register` — Registration
- `GET /api/auth/user` — Current user profile
- `GET /api/auth/canvas` — User canvases
- `GET /api/auth/canvas/public` — Public canvases
- `GET/PUT/DELETE /api/auth/canvas/:id` — Canvas CRUD

---

## Roadmap

- [ ] **Messages** — Real-time direct and group messaging
- [ ] **AI Helper** — Connect to an AI service for planning assistance
- [ ] **Collaboration** — Shared canvases and real-time co-editing

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

---

## Team

**My Story Team** — Built with the goal of helping people turn their ambitions into action.

---

## License

This project is private. All rights reserved.
