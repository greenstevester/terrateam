# CLAUDE.md - Frontend Architecture (Iris)

This file provides architectural guidance for Claude Code when working with the Terrateam frontend layer.

## Frontend Layer Overview

**Iris** is Terrateam's modern Svelte-based frontend that provides the web UI for infrastructure automation workflows. It acts as a type-safe client to the OCaml backend APIs.

## Technology Stack

### Core Framework
- **Svelte 4**: Reactive component framework with compile-time optimizations
- **Vite 5**: Lightning-fast dev server with HMR and ESM-native builds
- **TypeScript**: Full type safety with strict configuration
- **SPA Router**: Client-side routing for seamless navigation

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **PostCSS**: CSS processing pipeline
- **Custom Components**: Reusable UI library with accessibility built-in
- **Responsive Design**: Mobile-first approach with dark/light theme support

### State Management & Special Libraries
- **Svelte Stores**: Reactive state management
- **API Client**: Type-safe HTTP client with runtime validation  
- **Local Storage**: Persistent client state
- **URL State**: Query parameters for bookmarkable states
- **Zod**: Runtime type validation and schema parsing
- **js-yaml**: YAML parsing for configuration files
- **highlight.js**: Syntax highlighting for code blocks (Terraform, JSON, etc.)

### Monitoring & Analytics
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: User analytics and feature flags
- **Custom Metrics**: Application-specific telemetry

## Architecture Patterns

### Component Hierarchy
```
App.svelte
├── Router
├── PageLayout (shared layout)
│   ├── Sidebar (navigation)
│   ├── Header (user controls)
│   └── Main (page content)
└── Pages
    ├── Dashboard
    ├── Repositories
    ├── Runs (work manifests)
    └── Settings
```

### API Integration Layer
```
Frontend (TypeScript)
├── api-types-generated.ts    # Auto-generated from OpenAPI
├── types.ts                  # Manual types with Zod validation
├── api.ts                    # Type-safe API client
└── hooks.ts                  # Reactive API hooks
```

### Data Flow
```
User Action → Component → API Client → Backend → Database
                    ↓
         Update Svelte Store → Reactive UI Update
```

## Development Commands

### Development Server
```bash
cd code/src/iris/

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Start with nginx proxy and SSL (port 3000)
npm run dev:full

# Clean up dev environment
npm run dev:cleanup
```

### Build & Quality
```bash
# Production build
npm run build

# Type checking
npm run check              # Svelte + TypeScript validation
npm run type-check         # TypeScript only

# Code quality
npm run pre-commit         # All quality checks
npm run knip              # Dead code detection

# API synchronization
npm run generate-api-types    # Generate types from OpenAPI
npm run check-api-types      # Validate API alignment
```

## Key Configuration Files

### Build Configuration
- **`package.json`** - Dependencies and scripts
- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.json`** - TypeScript compiler settings
- **`tailwind.config.js`** - Tailwind CSS customization
- **`postcss.config.js`** - CSS processing pipeline

### Development Tools
- **`knip.json`** - Dead code detection configuration
- **`api.json`** - OpenAPI specification (source of truth)

### Quality Assurance
- **`.svelte-check`** - Svelte component validation
- **TypeScript strict mode** - Maximum type safety
- **ESLint/Prettier** - Code formatting and linting

## Architecture Decisions

### Why Svelte?
- **Compile-time optimization**: No virtual DOM overhead
- **Small bundle size**: Minimal runtime, optimal for fast loading
- **Developer experience**: Intuitive syntax and excellent tooling
- **Reactivity**: Built-in reactive state management

### Type Safety Strategy
```typescript
// 1. Auto-generated types from OpenAPI
import type { Installation } from './api-types-generated';

// 2. Manual types with runtime validation
import { validateInstallation } from './types';

// 3. Type-safe API client
const installation = await api.getInstallation(id);
// installation is guaranteed to be Installation type
```

### Component Architecture
```svelte
<!-- Composition over inheritance -->
<script lang="ts">
  import { PageLayout, Button, Card } from '../components';
  import { useAuth, useApi } from '../hooks';
  
  // Props interface
  interface $$Props {
    activeItem: string;
    title: string;
  }
  
  // Reactive state
  const { user } = useAuth();
  const { data, loading, error } = useApi(() => fetchData());
</script>

<PageLayout {activeItem} {title}>
  <!-- Component content -->
</PageLayout>
```

## Integration Points

### Backend Communication
```typescript
// API client with validation
const response = await api.getUserInstallations();
// Automatic type validation and error handling

// Error handling
try {
  const data = await api.createWorkManifest(params);
} catch (error) {
  if (isApiError(error)) {
    // Typed error handling
    console.error('API Error:', error.message, error.status);
  }
}
```

### State Synchronization
```typescript
// Svelte stores for global state
export const currentUser = writable<User | null>(null);
export const installations = writable<Installation[]>([]);

// Reactive updates
$: if ($currentUser) {
  loadUserData($currentUser.id);
}
```

## Development Patterns

### Component Standards
- **PageLayout** - Required wrapper for all pages
- **Type Safety** - All props and functions must be typed
- **Accessibility** - WCAG 2.1 AA compliance required
- **Error Boundaries** - Graceful error handling

### API Integration
- **Validation** - All API responses validated at runtime
- **Loading States** - Consistent loading indicators
- **Error Handling** - User-friendly error messages
- **Caching** - Appropriate caching for performance

### Styling Guidelines
- **Tailwind Only** - No custom CSS unless absolutely necessary
- **Design System** - Consistent color palette and spacing
- **Responsive** - Mobile-first design approach
- **Accessibility** - Proper contrast ratios and keyboard navigation

## Performance Optimization

### Build Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and font optimization
- **Bundle Analysis**: Regular bundle size monitoring

### Runtime Performance
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large lists
- **Memoization**: Expensive calculations cached
- **API Efficiency**: Minimal API calls with proper caching

## Security Considerations

### Content Security Policy
- **No Inline Styles**: All styling via CSS classes
- **Script Security**: Strict CSP headers
- **XSS Prevention**: All user input sanitized

### Authentication
- **OAuth Flow**: Secure GitHub integration
- **Token Management**: Secure token storage and refresh
- **Session Handling**: Proper session timeout and cleanup

This frontend architecture provides a modern, maintainable foundation for Terrateam's user interface while maintaining type safety and performance.