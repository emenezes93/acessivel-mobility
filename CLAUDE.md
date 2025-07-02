# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Acessível Mobility is a React/TypeScript ride-sharing application designed with comprehensive accessibility features for users with disabilities. The app provides both passenger and driver interfaces with advanced accessibility support including voice interface, haptic feedback, and customizable UI preferences.

## Common Commands

```bash
# Development
npm run dev              # Start development server on port 8080

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # ESLint with security plugin
```

## Technology Stack

- **Frontend**: React 18.3.1 with TypeScript, Vite build tool
- **Mobile**: Capacitor 7.4.0 for iOS/Android deployment
- **Styling**: Tailwind CSS with shadcn/ui design system
- **State Management**: React Context API (AccessibilityContext, ThemeContext, UserContext)
- **Testing**: Vitest with React Testing Library
- **Forms**: React Hook Form with Zod validation

## Code Architecture

### Context-Driven Design
The app uses multiple React contexts for different concerns:
- `AccessibilityContext`: Font sizing, contrast, voice synthesis, haptic feedback
- `ThemeContext`: Light/dark mode with CSS variables
- `UserContext`: User authentication and profile management

### Component Organization
- `/components/ui/`: Base shadcn/ui components with accessibility enhancements
- `/components/`: Feature-specific components (Dashboard, RideRequestForm, etc.)
- `/contexts/`: React Context providers with TypeScript interfaces
- `/hooks/`: Custom hooks for geolocation, geocoding, and accessibility features
- `/pages/`: Page-level components

### Accessibility Patterns
1. **AccessibleButton**: Enhanced button component with built-in haptic feedback, voice announcements, and proper ARIA labels
2. **Voice Interface**: Web Speech API integration with Portuguese (pt-BR) support
3. **Dynamic Sizing**: Font size scaling (16px, 18px, 24px) throughout the app
4. **High Contrast**: CSS class-based contrast adjustments
5. **Reduced Motion**: Respects user motion preferences

## Key Implementation Details

### Accessibility Features
- Voice synthesis uses `speechSynthesis.speak()` with Portuguese language
- Haptic feedback via `navigator.vibrate()` API
- Minimum touch targets of 44px for mobile accessibility
- Screen reader optimization with proper ARIA attributes
- High contrast mode with dedicated CSS classes

### Mobile Configuration
- Capacitor app ID: `com.acessivel.mobility`
- Development server configured for Lovable platform integration
- Cross-platform deployment ready for iOS and Android

### Browser API Dependencies
The app requires these browser APIs to function fully:
- Web Speech API (voice synthesis and recognition)
- Geolocation API (location services)
- Vibration API (haptic feedback)
- Local Storage (settings persistence)

## Development Notes

- Development server runs on IPv6 (::) host, port 8080
- Use `AccessibilityContext` for all user preference features
- All interactive components should extend `AccessibleButton` when possible
- Voice announcements should use Portuguese (pt-BR) language setting
- Test accessibility features across different contrast and font size settings
- Haptic feedback should be optional and respect user preferences