# NutriHub Frontend

React SPA for NutriHub — a nutrition management platform for dietitians and patients.

At the start of every session, read `/Users/santiagofernandez/IdeaProjects/nutrihub-shared/API_CONTRACT.md` for the current cross-project API contract.

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| UI Library | React | 18.3.1 |
| Routing | react-router-dom | 6.23.0 |
| HTTP Client | axios | 1.6.8 |
| State Management | Context API | (built-in) |
| Styling | Tailwind CSS | 3.4.19 |
| Charts | recharts | 3.8.1 |
| Build | Create React App (react-scripts) | 5.0.1 |
| Language | JavaScript (no TypeScript) | — |

No Redux, Zustand, react-query, or form libraries (Formik/RHF) are used.

---

## Folder Structure

```
src/
├── assets/           # Static images and logos
├── components/       # Reusable UI components
│   ├── HealthChart.jsx       # Weight-over-time chart (Recharts)
│   ├── Layout.jsx            # Page shell with sidebar navigation
│   ├── MealLogPanel.jsx      # Meal log form and list display
│   ├── MealPlanPanel.jsx     # Meal plan editor (food items by category)
│   ├── PrivateRoute.jsx      # Route guard (redirects unauthenticated users)
│   ├── Card.jsx / CardList.jsx
│   └── navbar/               # Legacy navbar (not actively routed, do not extend)
├── context/
│   ├── AuthContext.jsx       # Login/register/logout; persists to localStorage
│   └── AppContext.jsx        # Active role, activeDietitian, activePatient state
├── pages/
│   ├── Landing.jsx           # Role selector (Dietitian vs Patient)
│   ├── Auth.jsx              # Login / signup form
│   ├── DietitianList.jsx     # New dietitian profile creation flow
│   ├── DietitianDashboard.jsx# Dietitian home: stats, patient list, packages
│   ├── PatientList.jsx       # Searchable patient roster (dietitian view)
│   ├── PackageList.jsx       # Nutrition package CRUD (dietitian view)
│   ├── PatientDetail.jsx     # Dietitian view of a patient: enroll, health, meals, plan
│   ├── PatientSelector.jsx   # Patient login: find profile by email
│   └── PatientDashboard.jsx  # Patient home: weight log, meal log, health chart, plan
├── services/
│   └── api.js                # Axios instance + all exported API functions
└── App.js                    # Route definitions, context providers
```

The `src/api/` directory exists but is empty — use `src/services/api.js` for all API calls.

---

## API Integration

### Axios instance (`src/services/api.js`)
```js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});
```

All API functions are exported from this file. Do not make raw `axios.get(...)` calls in components — add a function to `api.js` and import it.

**Known exception**: `PatientDetail.jsx` line 85 makes a direct `api.patch('/enrollments/${id}/status', ...)` call — this endpoint does not yet exist on the backend. See `API_CONTRACT.md` TODO section.

### Auth headers
Currently **none** — the backend has no authentication. When JWT is added, implement a request interceptor in `api.js` to attach `Authorization: Bearer <token>`. Do not scatter header logic across components.

---

## Coding Conventions

### Components
- Functional components only; no class components.
- Hooks: `useState`, `useEffect`, `useContext`, `useParams`, `useNavigate`, `useSearchParams`.
- Data fetching in `useEffect` at the top of the component; use `Promise.all` for parallel fetches.
- Name page-level components with a role/action suffix: `*Dashboard`, `*List`, `*Detail`, `*Selector`.
- Name shared UI components descriptively: `MealLogPanel`, `HealthChart`, `PrivateRoute`.

### Naming
- Files: PascalCase for components (`PatientDetail.jsx`), camelCase for utilities (`api.js`).
- State variables: camelCase (`healthRecords`, `selectedPackageId`).
- Event handlers: `handle*` prefix (`handleSubmit`, `handleEnroll`).
- Boolean UI state: `show*` prefix (`showForm`, `showEnrollModal`).

### Styling
- Tailwind utility classes only — no CSS modules or styled-components.
- Dark theme: `bg-dark-900` / `bg-dark-800` backgrounds, `text-primary` (dark green), `lime-400` accent.
- Custom animations (`fade-in`, `slide-up`) are defined in `tailwind.config.js`.
- Fonts: `DM Serif Display` for headings, `Nunito` for body (loaded via CSS).

### State management
- `AuthContext` (`useAuth()`): current user, login, logout, register.
- `AppContext` (`useApp()`): active role, `activeDietitian`, `activePatient`.
- All other state is local to the component. There is no global data cache — each page re-fetches on mount.

### Auth system (current — mock only)
User objects are stored in localStorage under `nutrihub_users` and `nutrihub_current_user`. Passwords are stored in plaintext. This is intentional for the current prototype. **Do not treat this as production auth.**

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend base URL | `http://localhost:8080` |

Create `.env.local` for local overrides (already in `.gitignore`).

---

## Running Locally

```bash
npm install
npm start   # starts on http://localhost:3000
```

The backend must be running on port 8080 (or set `REACT_APP_API_URL`).

---

## Known Issues / Gaps

- `PATCH /enrollments/:id/status` is called in `PatientDetail.jsx` but does not exist on the backend — it will 404 at runtime.
- No real JWT auth: token injection interceptor is missing.
- No input validation beyond HTML5 `required` — backend validation errors surface as unhandled promise rejections.
- No error boundary: uncaught render errors will crash the whole page.
- The `navbar/` directory and its pages (`Home.js`, `About.js`, `Services.js`, `Admin.js`) are legacy and not reachable via current routes.
