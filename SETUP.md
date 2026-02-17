# Quick Start Guide

## One-Time Setup

### Install System Dependencies

**macOS:**
```bash
brew install rust node
rustup update
```

**Ubuntu/Debian:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

**Windows (using WSL2 recommended):**
Follow the official guides for [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org)

### Install Project Dependencies

From the project root:

```bash
# Install frontend dependencies
cd frontend
npm install

# Go back to root
cd ..
```

### Optional: Install concurrently for parallel development
```bash
npm install
```

## Daily Development Workflow

### Start Both Servers

**Option 1: Run servers in parallel (requires `concurrently`)**
```bash
npm run dev
```

**Option 2: Run in separate terminals**

Terminal 1 - Start the Rust backend:
```bash
cd backend
cargo run
```

Terminal 2 - Start the React frontend:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API is at `http://127.0.0.1:3001`

## Common Tasks

### Build for Production

```bash
npm run build
```

This will:
- Compile the Rust backend to `backend/target/release/`
- Build the React frontend to `frontend/dist/`

### Develop Backend Only

```bash
cd backend
cargo run
```

API will be available at `http://127.0.0.1:3001/api`

### Develop Frontend Only

```bash
cd frontend
npm run dev
```

Frontend will be at `http://localhost:3000`

### Add a New Frontend Dependency

```bash
cd frontend
npm install <package-name>
```

### Add a New Backend Dependency

```bash
cd backend
cargo add <crate-name>
```

## Debugging

### Frontend Debugging
- Open DevTools in your browser (F12)
- Use React DevTools browser extension for component debugging
- Check VS Code debugger extension for advanced debugging

### Backend Debugging
- Enable logging by setting `RUST_LOG=debug` environment variable:
  ```bash
  RUST_LOG=debug cargo run
  ```
- Use `println!` macros for quick debugging
- Use a Rust debugger like `rust-gdb` or IDE integration

## Port Configuration

If ports are already in use, modify:

**Backend (change port in `backend/src/main.rs`):**
```rust
.bind("127.0.0.1:3001")?  // Change 3001 to desired port
```

**Frontend (change in `frontend/vite.config.ts`):**
```typescript
server: {
  port: 3000,  // Change 3000 to desired port
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:3001',  // Update backend port here
      changeOrigin: true,
    }
  }
}
```

## Troubleshooting

### Rust compilation errors
```bash
# Update Rust
rustup update

# Clean previous builds
cargo clean
cargo build
```

### Frontend dependencies issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
- Find what's using the port:
  ```bash
  # macOS/Linux
  lsof -i :3000  # for frontend port
  lsof -i :3001  # for backend port
  
  # Windows
  netstat -ano | findstr :3000
  ```
- Kill the process or use different ports

## Next Steps

1. Explore the example API endpoints in the app
2. Modify `backend/src/main.rs` to add your own endpoints
3. Update `frontend/src/App.tsx` to call your new endpoints
4. Use TanStack Query for efficient data fetching
5. Build your awesome full-stack application!
