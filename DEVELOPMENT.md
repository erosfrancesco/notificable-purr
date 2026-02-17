# Development Guide

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Hooks
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: TanStack Query for server state, React Hooks for local state
- **Styling**: CSS modules with CSS-in-JS options available
- **API Communication**: Fetch API with TanStack Query wrappers

### Backend (Rust)
- **Framework**: Actix-web (async web framework)
- **Architecture**: Traditional request-response model
- **Concurrency**: Tokio async runtime
- **CORS**: Enabled for cross-origin requests from frontend
- **Serialization**: Serde for JSON handling

## Frontend Development Patterns

### Using TanStack Query

#### Basic Query (GET requests)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
});
```

#### Query with Parameters

```typescript
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    const res = await fetch(`/api/users/${userId}`);
    return res.json();
  },
  enabled: !!userId, // Only run when userId is defined
});
```

#### Mutation (POST/PUT/DELETE requests)

```typescript
const mutation = useMutation({
  mutationFn: async (newTodo: Todo) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo),
    });
    return res.json();
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// Usage
mutation.mutate({ title: 'New Todo' });
```

#### Dependent Queries

```typescript
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
});

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetch(`/api/users/${user.id}/posts`).then(r => r.json()),
  enabled: !!user?.id, // Wait for user data first
});
```

### TypeScript Best Practices

```typescript
// Define interfaces for API responses
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Use generics with TanStack Query
const { data } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: async () => {
    const res = await fetch('/api/users');
    const json: ApiResponse<User[]> = await res.json();
    return json.data;
  },
});
```

### Component Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Spinner.tsx
│   ├── features/        # Feature-specific components
│   │   ├── TodoList.tsx
│   │   └── TodoForm.tsx
├── hooks/               # Custom hooks
│   ├── useTodos.ts
│   └── useUser.ts
├── api/                 # API client functions
│   ├── client.ts
│   └── todos.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Backend Development Patterns

### Adding a New Endpoint

```rust
// Define request/response types
#[derive(Serialize, Deserialize)]
struct CreateTodoRequest {
    title: String,
    description: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct TodoResponse {
    id: i32,
    title: String,
    description: Option<String>,
    completed: bool,
}

// Create handler
async fn create_todo(
    body: web::Json<CreateTodoRequest>,
) -> HttpResponse {
    let todo = TodoResponse {
        id: 1,
        title: body.title.clone(),
        description: body.description.clone(),
        completed: false,
    };
    HttpResponse::Created().json(todo)
}

// Register in main function
HttpServer::new(|| {
    App::new()
        .service(
            web::scope("/api")
                .route("/todos", web::post().to(create_todo))
                // ... other routes
        )
})
```

### Error Handling

```rust
use actix_web::{error, HttpResponse};

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn get_todo(id: web::Path<i32>) -> Result<HttpResponse, error::Error> {
    let todo_id = id.into_inner();
    
    // Simulate getting from database
    if todo_id <= 0 {
        return Err(error::ErrorBadRequest("Invalid ID"));
    }
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "id": todo_id,
        "title": "Sample Todo"
    })))
}
```

### Middleware for Custom Logic

```rust
use actix_web::middleware::Logger;

HttpServer::new(|| {
    App::new()
        .wrap(Logger::default())
        .wrap(actix_cors::Cors::permissive())
        // ... routes
})
```

### Database Integration Example

For future database integration, consider:
- **SQLite**: `sqlx` or `rusqlite` (lightweight)
- **PostgreSQL**: `sqlx` or `diesel`
- **MongoDB**: `mongodb` crate
- **ORM**: `sea-orm` or `sqlx`

## Communication Between Frontend and Backend

### Request Flow

1. **Frontend** initiates query/mutation via TanStack Query
2. **Fetch API** sends HTTP request to `http://localhost:3000/api/*`
3. **Vite Proxy** forwards request to `http://127.0.0.1:3001/api/*`
4. **Actix-web** receives request, processes it
5. **Backend** returns JSON response with CORS headers
6. **TanStack Query** caches and manages the response
7. **React** renders updated UI

### API Contract Example

**Frontend Query:**
```typescript
const { data } = useQuery({
  queryKey: ['todo', todoId],
  queryFn: async () => {
    const res = await fetch(`/api/todos/${todoId}`);
    if (!res.ok) throw new Error('Failed');
    return res.json() as Promise<Todo>;
  },
});
```

**Backend Handler:**
```rust
async fn get_todo(id: web::Path<i32>) -> HttpResponse {
    let todo = Todo {
        id: id.into_inner(),
        title: "Example".to_string(),
        completed: false,
    };
    HttpResponse::Ok().json(todo)
}
```

## Testing

### Frontend Unit Tests (Optional)

To add testing, install dependencies in `frontend/`:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

it('renders the app', () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  expect(screen.getByText(/Notificable Purr/i)).toBeInTheDocument();
});
```

### Backend Tests

In `backend/Cargo.toml`, tests are written inline:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_something() {
        assert_eq!(2 + 2, 4);
    }
}
```

Run tests:
```bash
cd backend
cargo test
```

## Performance Optimization Tips

### Frontend
- Use `React.memo()` for performance-critical components
- Implement code splitting with dynamic imports
- Use TanStack Query's caching to minimize API calls
- Set appropriate `staleTime` and `gcTime` values
- Monitor bundle size with Vite build analysis

### Backend
- Use connection pooling for databases
- Implement pagination for large result sets
- Cache frequently accessed data
- Use async handlers for I/O operations
- Profile and optimize hot paths

## Debugging Tips

### Frontend
```typescript
// Enable TanStack Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Backend
```rust
// Set logging level
RUST_LOG=debug cargo run

// In code
log::debug!("Processing request");
log::info!("Server started");
log::error!("Database error: {}", error);
```

## Useful Resources

- **Frontend**:
  - TanStack Query hooks patterns: https://tanstack.com/query/latest/docs/react/overview
  - React TypeScript cheatsheet: https://react-typescript-cheatsheet.netlify.app/
  
- **Backend**:
  - Actix-web guide: https://actix.rs/docs/
  - Rust async book: https://rust-lang.github.io/async-book/
  - Serde documentation: https://serde.rs/

Happy coding! 🚀
