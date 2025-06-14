# PT SOAP Generator - Tailwind CSS Setup Guide

## Overview

This project uses Tailwind CSS v4 with Next.js 15, incorporating the PT SOAP Generator style guide. We're using a hybrid Next.js structure with both App Router (`src/app`) and Pages Router (`src/pages`).

## Key Files and Their Purpose

### Configuration Files

- `tailwind.config.js` - Main Tailwind configuration
  - Defines content paths for purging unused styles
  - Extends the theme with our custom colors, fonts, and spacing
  - References CSS variables defined in globals.css

- `postcss.config.mjs` - PostCSS configuration
  - Uses `@tailwindcss/postcss` plugin for processing CSS

- `src/app/globals.css` - Global CSS & CSS variables
  - Contains Tailwind imports
  - Defines custom CSS variables for colors and typography
  - Contains global styles

### Integration Files

- `src/app/layout.js` - App Router layout
  - Imports globals.css for App Router pages
  - Sets up font variables

- `src/pages/_app.js` - Pages Router layout
  - Imports globals.css for Pages Router pages
  - Required for Pages Router components to receive Tailwind styles

## How Tailwind is Applied

1. **App Router Pages** (`src/app/...`)
   - Automatically receive Tailwind styles via `src/app/layout.js`
   - Use `'use client'` directive for client components

2. **Pages Router Pages** (`src/pages/...`)
   - Receive Tailwind styles via `src/pages/_app.js`
   - No directive needed

3. **Components**
   - Use Tailwind utility classes for styling
   - Component styles are automatically applied when imported

## Style Guide Implementation

### Color System

Our Tailwind configuration maps to our style guide using CSS variables:

```css
:root {
  /* PT SOAP Generator Colors */
  --blue-primary: #2563eb;
  --blue-light: #dbeafe;
  --blue-dark: #1d4ed8;
  
  --background: #ffffff;
  --foreground: #111827;
  --muted: #f9fafb;
  --muted-foreground: #9ca3af;
  
  --border: #f3f4f6;
  --input: #f3f4f6;
  --ring: #2563eb;
  
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}
```

Access these in your components using Tailwind classes:

```jsx
// Example
<button className="bg-blue-primary text-white hover:bg-blue-dark">
  Click Me
</button>
```

### Typography

We use Roboto font with fallbacks defined in our configuration:

```jsx
<p className="font-sans text-foreground text-base">
  Sample text using our style guide
</p>
```

## Common Patterns

### UI Components with Tailwind

```jsx
// Button example
<Button 
  variant="primary" 
  className="w-full mt-4"
>
  Sign In
</Button>

// Card example
<Card className="p-6 border-border shadow-lg">
  {children}
</Card>
```

### Responsive Design with Tailwind

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Common Issues and How to Avoid Them

### Missing Tailwind Styles

**Issue**: Tailwind styles not applying to certain components or pages

**Solution**:
- Make sure the page is importing Tailwind CSS, either through:
  - App Router (`src/app/layout.js` imports globals.css)
  - Pages Router (`src/pages/_app.js` imports globals.css)
- Check the component path in `tailwind.config.js` content array
- Restart the dev server after configuration changes

### Hybrid Router Issues

**Issue**: Component styling differs between App Router and Pages Router

**Solution**:
- Ensure both routers are importing the same CSS
- Keep UI components router-agnostic where possible
- Use consistent class naming between routers

### CSS Variables

**Issue**: Custom colors or styles not applying

**Solution**:
- Ensure CSS variables are defined in globals.css
- Reference them in tailwind.config.js
- Use proper Tailwind class names (e.g., `text-blue-primary` not `text-[#2563eb]`)

## Best Practices

1. **Use Tailwind utility classes over custom CSS** when possible
2. **Reference CSS variables** instead of hardcoding color values
3. **Extend the theme** in tailwind.config.js rather than using arbitrary values
4. **Group related utilities** using meaningful component classes
5. **Maintain a clean globals.css** file for better maintainability
6. **Restart dev server** after configuration changes

## Quick Reference

### Style Guide Colors as Tailwind Classes

- Blue Primary: `bg-blue-primary`, `text-blue-primary`, `border-blue-primary`
- Blue Light: `bg-blue-light`, `text-blue-light`, `border-blue-light`
- Blue Dark: `bg-blue-dark`, `text-blue-dark`, `border-blue-dark`
- Background: `bg-background`
- Foreground: `text-foreground`
- Muted: `bg-muted`, `text-muted-foreground`
- Border: `border-border`

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
