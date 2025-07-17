# Component Structure

This directory contains all the modular components for the Sustained landing page, organized for maximum maintainability and reusability.

## Directory Structure

```
src/components/
├── index.ts                 # Main export file for all components
├── ui/                      # Reusable UI components
│   ├── index.ts            # UI components exports
│   ├── Button.tsx          # Animated button component with variants
│   ├── FeatureCard.tsx     # Reusable feature card with hover effects
│   └── ScrollIndicator.tsx # Animated scroll chevron indicator
├── sections/               # Page section components
│   ├── index.ts           # Section components exports
│   ├── HeroSection.tsx    # Hero section with Spline integration
│   ├── AboutSection.tsx   # Challenge explanation section
│   ├── SolutionSection.tsx # Our solution presentation
│   ├── FeaturesSection.tsx # Platform features grid
│   ├── CTASection.tsx     # Call-to-action section
│   └── Footer.tsx         # Site footer
└── common/                # Common/shared components (future use)
```

## Usage

### Importing Components

```tsx
// Import specific components
import { Button, FeatureCard } from '../components/ui'
import { HeroSection, AboutSection } from '../components/sections'

// Or import all components
import {
  Button,
  FeatureCard,
  HeroSection,
  AboutSection,
  // ... etc
} from '../components'
```

### Component Features

- **Fully typed TypeScript interfaces**
- **Framer Motion animations throughout**
- **Tailwind CSS styling with green/black theme**
- **Responsive design for mobile and desktop**
- **Modular and reusable architecture**

### Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: UI components can be used across different sections
3. **Scalability**: Easy to add new components without affecting existing ones
4. **Developer Experience**: Clear organization and easy imports
5. **Performance**: Components can be lazy-loaded if needed in the future

## Component Props

### Button
```tsx
interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}
```

### FeatureCard
```tsx
interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}
```

### HeroSection
```tsx
interface HeroSectionProps {
  showChevron: boolean
  opacity: MotionValue<number>
}
```

## Future Enhancements

- Add Spline 3D integration to HeroSection
- Create theme context for color variations
- Add loading states for dynamic content
- Implement error boundaries for robust error handling 