# Notificable Purr 🐱

A full-stack web application combining:
- **Frontend**: React + TypeScript + TanStack Query
- **Backend**: Rust with Actix-web
- **Build Tool**: Vite for fast development

## Project Structure

```
notificable-purr/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # App styling
│   │   ├── main.tsx         # Entry point with TanStack Query setup
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite configuration with API proxy
│   ├── tsconfig.json        # TypeScript configuration
│   └── tsconfig.node.json   # TypeScript config for Vite
├── backend/                  # Rust backend API
│   ├── src/
│   │   └── main.rs          # Actix-web server
│   └── Cargo.toml           # Rust dependencies
├── Cargo.toml               # Workspace root
└── README.md
```

## Prerequisites

- **Node.js** 16+ and npm
- **Rust** 1.70+ (install from [rustup.rs](https://rustup.rs/))

## Installation

### Backend Setup

1. Install Rust dependencies:
```bash
cd backend
cargo build
```

### Frontend Setup

2. Install Node dependencies:
```bash
cd frontend
npm install
```

## Development

### Running the Backend

Start the Rust server on `http://127.0.0.1:3001`:

```bash
cd backend
cargo run
```

The backend serves these API endpoints:
- `GET /api/health` - Health check endpoint
- `GET /api/hello/{name}` - Returns a personalized greeting

### Running the Frontend

In a new terminal, start the React development server on `http://localhost:3000`:

```bash
cd frontend
npm run dev
```

The Vite development server includes a proxy to the backend API, so all `/api/*` requests are forwarded to `http://127.0.0.1:3001`.

## Features

### Frontend (React + TypeScript + TanStack Query)
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **TanStack Query (React Query)**: 
  - Automatic caching of API responses
  - Background refetching
  - Intelligent stale state management
  - Built-in error handling
- **Vite**: Lightning-fast development and build tool
- **Responsive Design**: Mobile-friendly CSS

### Backend (Rust + Actix-web)
- **Actix-web**: High-performance web framework
- **CORS Support**: Cross-origin requests enabled
- **JSON APIs**: Structured request/response handling
- **Logging**: Built-in request logging

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

The output will be in `frontend/dist/`.

### Backend Release Build

```bash
cd backend
cargo build --release
```

The compiled binary will be in `backend/target/release/notificable-purr-backend`.

## Example: Adding a New API Endpoint

### 1. Add a handler in `backend/src/main.rs`:

```rust
async fn users(id: web::Path<i32>) -> HttpResponse {
    let user_id = id.into_inner();
    HttpResponse::Ok().json(Message {
        message: format!("User ID: {}", user_id),
    })
}
```

### 2. Register the route in the App configuration:

```rust
web::scope("/api")
    .route("/health", web::get().to(health))
    .route("/hello/{name}", web::get().to(hello))
    .route("/users/{id}", web::get().to(users))  // Add this
```

### 3. Use it in React with TanStack Query:

```typescript
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
});
```

## Deployment

### Docker Support (Optional)

Create a `Dockerfile` in the root directory for containerized deployment:

```dockerfile
# Build stage
FROM rust:latest as rust-builder
WORKDIR /app
COPY backend ./backend
RUN cd backend && cargo build --release

FROM node:18 as node-builder
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Runtime stage
FROM rust:latest
COPY --from=rust-builder /app/backend/target/release/notificable-purr-backend /app/
COPY --from=node-builder /app/frontend/dist /app/static
WORKDIR /app
EXPOSE 3001
CMD ["./notificable-purr-backend"]
```

## Troubleshooting

### Port Already in Use
- Backend runs on port 3001
- Frontend dev server runs on port 3000

If ports are already in use, modify the configuration in:
- Backend: `backend/src/main.rs` (change `.bind("127.0.0.1:3001")`)
- Frontend: `frontend/vite.config.ts` (change `server.port`)

### CORS Issues
CORS is enabled in the backend (`actix_cors::Cors::permissive()`). If you have issues, ensure the frontend proxy is correctly configured in `frontend/vite.config.ts`.

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Actix-web Documentation](https://actix.rs)
- [Vite Documentation](https://vitejs.dev)
- [Rust Book](https://doc.rust-lang.org/book/)

## License

MIT License - Feel free to use this template for your projects!
webapp built with rust, react and typescript. also tanstack-query (WRRTT)
