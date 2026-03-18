# Mobile App

React Native + TypeScript mobile client for the existing medical platform backend.

## Architecture

- `src/app`: bootstrap, configuration, top-level providers.
- `src/core`: low-level concerns such as networking, storage, base abstractions, errors, helpers.
- `src/theme`: design tokens and theme composition for light/dark modes.
- `src/navigation`: root navigator, role-aware stacks, tabs, and guards.
- `src/domain`: pure business entities, repository contracts, use cases.
- `src/data`: DTOs, remote datasources, mappers, repository implementations.
- `src/features`: isolated feature modules. `auth`, `home`, `doctors`, and `appointments` include functional screens; remaining modules are scaffolded for expansion.
- `src/shared`: reusable UI, hooks, localization, animations, utilities, shared typings.
- `src/store`: Zustand slices for auth, app preferences, and UI feedback.
- `src/assets`: fonts, images, and icons placeholders.

## Why Zustand

Zustand is used for local app/session/UI state because it is lightweight, TypeScript-friendly, and keeps feature state modular without Redux boilerplate. TanStack Query handles remote server state and caching; Zustand handles session, theme, language, and transient UI state.

## Backend Compatibility

- Base API path targets `/api/v1`.
- Implemented endpoints align with the current server routes for `auth`, `doctors`, `appointments`, and `posts`.
- Refresh-token flow is prepared in the HTTP layer, but the current backend exposes login and me only. When a refresh endpoint is added, the client interceptor can be enabled without changing feature code.

