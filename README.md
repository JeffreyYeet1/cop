# Productivity App Onboarding

A modern, iOS-style onboarding experience for a productivity app, built with React, TypeScript, and Tailwind CSS.

## Features

- Clean, minimal UI inspired by iOS apps
- Multi-step onboarding questionnaire
- Progress tracking
- Responsive design

## Technologies

- React
- TypeScript
- Tailwind CSS
- Vite

## Docker Support

The application includes Docker configuration for both development and production environments.

### Development Environment

To run the application in development mode with hot-reloading:

```bash
# Build and start the development container
docker-compose up dev

# Or in detached mode
docker-compose up -d dev
```

The development server will be available at [http://localhost:5173](http://localhost:5173).

### Production Environment

To build and run the production version:

```bash
# Build and start the production container
docker-compose up prod

# Or in detached mode
docker-compose up -d prod
```

The production server will be available at [http://localhost](http://localhost).

### Building Individual Docker Images

You can also build and run the Docker images directly:

#### Development Image

```bash
# Build the development image
docker build --target dev -t productivity-app-onboarding:dev .

# Run the development container
docker run -p 5173:5173 -v $(pwd)/src:/app/src -v $(pwd)/public:/app/public productivity-app-onboarding:dev
```

#### Production Image

```bash
# Build the production image
docker build --target runner -t productivity-app-onboarding:prod .

# Run the production container
docker run -p 80:80 productivity-app-onboarding:prod
```

## Manual Setup

If you prefer to run the application without Docker:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## License

MIT
