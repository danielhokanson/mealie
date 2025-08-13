# Mealie Angular Style Guide

## Overview
This document outlines the standardized approach to styling and theming in the Mealie Angular application. All components should follow these guidelines to ensure consistency and maintainability.

## Theme System

### Color Themes
The application supports both **light** and **dark** themes, with dark theme as the default. The theme can be toggled via the switch in the bottom of the left navigation menu.

### CSS Custom Properties
All colors and design tokens are defined as CSS custom properties in `/src/styles/_theme.scss`. This allows for easy theme switching and consistent styling across the application.

## HTML Structure Guidelines

### 1. Minimize Wrapper Elements
**❌ Avoid:**
```html
<div class="container">
  <div class="wrapper">
    <div class="content">
      <mat-card>...</mat-card>
    </div>
  </div>
</div>
```

**✅ Prefer:**
```html
<mat-card class="container">
  ...
</mat-card>
```

### 2. Use Semantic HTML
- Use `<section>` for page sections
- Use `<header>` for headers
- Use `<main>` for main content
- Use `<nav>` for navigation
- Use `<article>` for self-contained content

### 3. Component Structure
```html
<section class="page-container">
  <header class="card mb-lg">
    <h1 class="text-2xl font-medium">Page Title</h1>
  </header>
  
  <main class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
    <!-- Content -->
  </main>
</section>
```

## Utility Classes

### Spacing
- **Margin:** `m-{size}`, `mt-{size}`, `mb-{size}`, `ml-{size}`, `mr-{size}`, `mx-{size}`, `my-{size}`
- **Padding:** `p-{size}`, `pt-{size}`, `pb-{size}`, `pl-{size}`, `pr-{size}`, `px-{size}`, `py-{size}`
- **Gap:** `gap-{size}`
- **Sizes:** `0`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

### Layout
- **Display:** `block`, `inline-block`, `inline`, `hidden`, `flex`, `grid`
- **Flexbox:** `flex-col`, `flex-row`, `flex-wrap`, `flex-1`, `items-center`, `justify-between`
- **Grid:** `grid-cols-1`, `grid-cols-2`, `grid-cols-3`, `grid-cols-4`
- **Position:** `relative`, `absolute`, `fixed`, `sticky`

### Typography
- **Size:** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
- **Weight:** `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- **Color:** `text-primary`, `text-secondary`, `text-tertiary`, `text-white`
- **Alignment:** `text-left`, `text-center`, `text-right`

### Sizing
- **Width:** `w-full`, `w-auto`, `w-screen`, `max-w-{size}`
- **Height:** `h-full`, `h-auto`, `h-screen`, `min-h-screen`

### Colors & Backgrounds
- **Background:** `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-elevated`, `bg-overlay`
- **Surface:** `surface-primary`, `surface-secondary`, `surface-tertiary`

### Borders & Shadows
- **Border:** `border`, `border-t`, `border-b`, `border-l`, `border-r`, `border-0`
- **Radius:** `rounded-sm`, `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full`
- **Shadow:** `shadow-sm`, `shadow`, `shadow-lg`, `shadow-xl`, `shadow-none`

## Component Patterns

### Cards
```html
<mat-card class="card">
  <mat-card-header>
    <mat-card-title class="text-xl font-medium">Title</mat-card-title>
    <mat-card-subtitle class="text-secondary">Subtitle</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <!-- Content -->
  </mat-card-content>
</mat-card>
```

### Forms
```html
<form class="flex flex-col gap-md">
  <mat-form-field appearance="outline" class="w-full">
    <mat-label>Label</mat-label>
    <input matInput placeholder="Placeholder">
    <mat-icon matPrefix>icon_name</mat-icon>
  </mat-form-field>
  
  <button mat-raised-button class="btn btn-primary w-full">
    Submit
  </button>
</form>
```

### Lists
```html
<mat-nav-list class="flex-1">
  <a mat-list-item routerLink="/path" routerLinkActive="active">
    <mat-icon matListItemIcon>icon</mat-icon>
    <span matListItemTitle>Item Title</span>
  </a>
</mat-nav-list>
```

### Grids
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>
```

## Theme Variables

### Using CSS Custom Properties
Always use CSS custom properties for colors and design tokens:

```scss
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: all var(--transition-base);
}
```

### Available Variables
- **Colors:** `--primary-{50-900}`, `--color-success`, `--color-warning`, `--color-error`
- **Backgrounds:** `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`
- **Text:** `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`
- **Borders:** `--border-primary`, `--border-secondary`, `--border-focus`
- **Spacing:** `--spacing-xs` through `--spacing-2xl`
- **Radius:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **Transitions:** `--transition-fast`, `--transition-base`, `--transition-slow`

## Component SCSS Files

### Minimal Custom Styles
Component SCSS files should be minimal and primarily use utility classes:

```scss
// component.scss
.my-component {
  // Only add custom styles that can't be achieved with utilities
  
  // Use theme variables for any custom styles
  .custom-element {
    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
  }
}
```

## Responsive Design

### Breakpoints
- **Small (sm):** max-width: 640px
- **Medium (md):** 641px - 768px
- **Large (lg):** 769px - 1024px
- **Extra Large (xl):** 1025px+

### Responsive Utilities
```html
<!-- Hidden on small screens, visible on medium and up -->
<div class="hidden md:block">...</div>

<!-- Different grid columns at different breakpoints -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  ...
</div>
```

## Best Practices

1. **Always use utility classes first** - Only write custom CSS when utilities can't achieve the desired result
2. **Use semantic HTML elements** - Improve accessibility and SEO
3. **Avoid inline styles** - Use classes and CSS custom properties
4. **Keep specificity low** - Avoid deep nesting and overly specific selectors
5. **Use theme variables** - Never hardcode colors or spacing values
6. **Test both themes** - Ensure components look good in both light and dark themes
7. **Mobile-first approach** - Design for mobile and enhance for larger screens
8. **Consistent spacing** - Use the spacing scale consistently throughout the app

## Migration Checklist

When updating existing components:

- [ ] Remove unnecessary wrapper divs
- [ ] Replace custom styles with utility classes
- [ ] Use CSS custom properties for colors
- [ ] Add appropriate semantic HTML elements
- [ ] Test in both light and dark themes
- [ ] Ensure responsive behavior
- [ ] Update component SCSS to be minimal
- [ ] Add proper ARIA attributes for accessibility