# FD_Management_System

Simple full-stack food ordering management system for a school project.

## Features

- Register & login with JWT authentication
- Admin and user roles
- User can view food menu, place orders, and see order status
- Admin can view users, manage orders, add food, and review reports
- Backend: Node.js, Express, MongoDB Atlas, Mongoose
- Frontend: React with JSX and React Router

## Folder structure

- `backend/` - Express API, models, routes, controllers
- `frontend/` - React app with pages and components

## Backend setup

1. Open `backend/.env.example` and create a `backend/.env` file.
2. Fill values:

```env
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
PORT=5000
```

3. Install dependencies:

```bash
cd backend
npm install
```

4. Start the server:

```bash
npm run dev
```

A default admin account is seeded automatically if missing:
- email: `admin@school.com`
- password: `admin123`

## Frontend setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the React app:

```bash
npm run dev
```

3. Open the front-end URL shown in the terminal.

## API Endpoints

### Auth
- `POST /api/register`
- `POST /api/login`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`

### Users
- `GET /api/users`

### Food
- `GET /api/food`
- `POST /api/food`

## Notes

- Use the admin role to access `/admin-dashboard` and `/reports`.
- The frontend proxies `/api` requests to the backend.
- Keep the UI simple and easy to present.
