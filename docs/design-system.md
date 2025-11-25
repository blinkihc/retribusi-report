# Design System & UI Kit
## Sistem Monitoring Retribusi Daerah

**Version:** 1.0  
**Date:** November 5, 2025  
**Framework:** Tailwind CSS + Shadcn/ui  
**Theme:** Indonesian Government Appropriate

---

## 1. Design Philosophy

### 1.1 Core Principles
**Professional Government Interface**
- Clean, authoritative appearance suitable for government applications
- High contrast for accessibility and clarity
- Conservative color palette respecting formal government context
- Clear hierarchy and easy navigation for civil servants

**Indonesian Context**
- Cultural appropriateness for Indonesian government users
- Support for Bahasa Indonesia text and formatting
- Government-standard typography and spacing
- Regional government branding flexibility

**User-Centric Design**
- Optimized for daily operational use by government staff
- Minimal learning curve for users with varying tech literacy
- Efficient workflows for repetitive tasks
- Mobile-responsive for field access

### 1.2 Accessibility Standards
- **WCAG 2.1 Level A compliance** minimum
- **High contrast ratios** (4.5:1 for normal text, 3:1 for large text)
- **Keyboard navigation** support for all interactive elements
- **Screen reader compatibility** with semantic HTML and ARIA labels
- **Focus indicators** clear and visible for all focusable elements

---

## 2. Color System

### 2.1 Primary Color Palette

**Government Blue (Primary)**
```css
--color-primary: #1e40af;        /* Blue 700 - Main brand color */
--color-primary-50: #eff6ff;     /* Very light blue backgrounds */
--color-primary-100: #dbeafe;    /* Light blue backgrounds */
--color-primary-200: #bfdbfe;    /* Subtle blue elements */
--color-primary-500: #3b82f6;    /* Interactive elements */
--color-primary-600: #2563eb;    /* Hover states */
--color-primary-700: #1d4ed8;    /* Active states */
--color-primary-800: #1e3a8a;    /* Dark mode primary */
```

**Neutral Grays**
```css
--color-gray-50: #f9fafb;        /* Page backgrounds */
--color-gray-100: #f3f4f6;       /* Card backgrounds */
--color-gray-200: #e5e7eb;       /* Borders, dividers */
--color-gray-300: #d1d5db;       /* Input borders */
--color-gray-400: #9ca3af;       /* Placeholder text */
--color-gray-500: #6b7280;       /* Secondary text */
--color-gray-600: #4b5563;       /* Primary text */
--color-gray-700: #374151;       /* Headings */
--color-gray-800: #1f2937;       /* Dark text */
--color-gray-900: #111827;       /* High emphasis text */
```

### 2.2 Semantic Colors

**Success (Green)**
```css
--color-success: #059669;        /* Success messages, approved status */
--color-success-50: #ecfdf5;
--color-success-100: #d1fae5;
--color-success-600: #047857;
--color-success-700: #065f46;
```

**Warning (Amber)**
```css
--color-warning: #d97706;        /* Warnings, pending status */
--color-warning-50: #fffbeb;
--color-warning-100: #fef3c7;
--color-warning-600: #b45309;
--color-warning-700: #92400e;
```

**Error (Red)**
```css
--color-error: #dc2626;          /* Errors, cancelled status */
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-600: #b91c1c;
--color-error-700: #991b1b;
```

**Info (Blue)**
```css
--color-info: #2563eb;           /* Information, neutral status */
--color-info-50: #eff6ff;
--color-info-100: #dbeafe;
--color-info-600: #1d4ed8;
--color-info-700: #1e40af;
```

### 2.3 Government Specific Colors

**Indonesian Flag Red (Accent)**
```css
--color-indonesia-red: #ff0000;   /* Indonesian flag red for special elements */
--color-indonesia-red-light: #fee2e2;
--color-indonesia-red-dark: #b91c1c;
```

**Gold (Premium Elements)**
```css
--color-gold: #f59e0b;           /* Gold accents for important elements */
--color-gold-50: #fffbeb;
--color-gold-100: #fef3c7;
--color-gold-600: #d97706;
```

---

## 3. Typography

### 3.1 Font Stack

**Primary Font Family**
```css
font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```
- **Inter**: Modern, highly legible font excellent for UI
- **Fallbacks**: System fonts for reliable cross-platform rendering
- **Characteristics**: High readability, professional appearance, excellent at small sizes

**Monospace Font (Code/Data)**
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
```

### 3.2 Type Scale

**Font Sizes**
```css
--text-xs: 0.75rem;      /* 12px - Captions, helper text */
--text-sm: 0.875rem;     /* 14px - Small body text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
--text-4xl: 2.25rem;     /* 36px - Main headings */
--text-5xl: 3rem;        /* 48px - Hero text */
```

**Font Weights**
```css
--font-light: 300;       /* Light emphasis */
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasis */
--font-semibold: 600;    /* Subheadings */
--font-bold: 700;        /* Headings */
--font-extrabold: 800;   /* High emphasis */
```

**Line Heights**
```css
--leading-tight: 1.25;   /* Headings */
--leading-snug: 1.375;   /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Comfortable reading */
--leading-loose: 2;      /* Very spacious */
```

### 3.3 Typography Components

**Heading Styles**
```css
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-gray-900);
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--color-gray-800);
}

.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--color-gray-700);
}
```

**Body Text Styles**
```css
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-gray-700);
}

.body-normal {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-gray-600);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-gray-500);
}
```

---

## 4. Spacing System

### 4.1 Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### 4.2 Layout Spacing

**Container Padding**
```css
--container-padding-mobile: var(--space-4);    /* 16px */
--container-padding-tablet: var(--space-6);    /* 24px */
--container-padding-desktop: var(--space-8);   /* 32px */
```

**Component Spacing**
```css
--component-gap-xs: var(--space-2);     /* Between small elements */
--component-gap-sm: var(--space-4);     /* Between related elements */
--component-gap-md: var(--space-6);     /* Between sections */
--component-gap-lg: var(--space-8);     /* Between major sections */
--component-gap-xl: var(--space-12);    /* Between page sections */
```

---

## 5. Component Library

### 5.1 Button Components

**Primary Button**
```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 0.375rem;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  background-color: var(--color-primary-700);
  transform: translateY(0);
}
```

**Secondary Button**
```css
.btn-secondary {
  background-color: white;
  color: var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border: 1px solid var(--color-primary);
  border-radius: 0.375rem;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
}
```

**Button Sizes**
```css
.btn-xs { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); }
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
```

### 5.2 Form Components

**Input Field**
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input-field.error {
  border-color: var(--color-error);
}

.input-field.error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}
```

**Select Dropdown**
```css
.select-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  background-color: white;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02IDhMMCAwaDEyTDYgOHoiIGZpbGw9IiM2QjcyODAiLz4KPHN2Zz4K');
  background-repeat: no-repeat;
  background-position: right var(--space-4) center;
  padding-right: var(--space-10);
  appearance: none;
}
```

**Label**
```css
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
}

.form-label.required::after {
  content: " *";
  color: var(--color-error);
}
```

**Error Message**
```css
.form-error {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### 5.3 Card Components

**Basic Card**
```css
.card {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid var(--color-gray-200);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
}
```

**Stats Card**
```css
.stats-card {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 100%);
  color: white;
  padding: var(--space-6);
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stats-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.stats-label {
  font-size: var(--text-sm);
  opacity: 0.9;
  margin-top: var(--space-1);
}
```

### 5.4 Status & Badge Components

**Status Badges**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-success {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-warning {
  background-color: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-error {
  background-color: var(--color-error-100);
  color: var(--color-error-700);
}

.badge-info {
  background-color: var(--color-info-100);
  color: var(--color-info-700);
}
```

### 5.5 Table Components

**Data Table**
```css
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table th {
  background-color: var(--color-gray-50);
  padding: var(--space-4);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  border-bottom: 1px solid var(--color-gray-200);
}

.table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-100);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.table tr:hover {
  background-color: var(--color-gray-50);
}
```

---

## 6. Layout System

### 6.1 Grid System

**CSS Grid Layout**
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
```

**Responsive Grid**
```css
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

### 6.2 Container System

**Page Container**
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--container-padding-mobile);
  padding-right: var(--container-padding-mobile);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-left: var(--container-padding-tablet);
    padding-right: var(--container-padding-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-left: var(--container-padding-desktop);
    padding-right: var(--container-padding-desktop);
  }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### 6.3 Sidebar Layout

**Admin Layout**
```css
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: var(--color-gray-900);
  color: white;
  padding: var(--space-6);
}

.main-content {
  background-color: var(--color-gray-50);
  padding: var(--space-6);
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* sm - Small tablets */ }
@media (min-width: 768px)  { /* md - Tablets */ }
@media (min-width: 1024px) { /* lg - Small desktops */ }
@media (min-width: 1280px) { /* xl - Large desktops */ }
@media (min-width: 1536px) { /* 2xl - Extra large */ }
```

### 7.2 Mobile Optimizations

**Touch Targets**
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Mobile Navigation**
```css
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid var(--color-gray-200);
  padding: var(--space-4);
  display: flex;
  justify-content: space-around;
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}
```

---

## 8. Animation & Transitions

### 8.1 Transition System

**Standard Transitions**
```css
.transition-default {
  transition: all 0.2s ease;
}

.transition-fast {
  transition: all 0.15s ease;
}

.transition-slow {
  transition: all 0.3s ease;
}
```

**Hover Effects**
```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 8.2 Loading States

**Skeleton Loader**
```css
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Spinner**
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-gray-200);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 9. Dark Mode Support

### 9.1 Dark Color Variables

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-border: #334155;
  }
}
```

### 9.2 Dark Mode Classes

```css
.dark .card {
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

.dark .input-field {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
```

---

## 10. Implementation Guidelines

### 10.1 Shadcn/ui Integration

**Install Required Components**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

### 10.2 Tailwind Configuration

**tailwind.config.js**
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
}
```

### 10.3 Usage Examples

**Button Component Usage**
```jsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">
  Simpan Laporan
</Button>

<Button variant="outline" size="sm">
  Batal
</Button>

<Button variant="destructive" size="lg">
  Hapus Data
</Button>
```

**Form Component Usage**
```jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="form-group">
  <Label htmlFor="nominal" className="form-label required">
    Nominal Retribusi
  </Label>
  <Input
    id="nominal"
    type="number"
    placeholder="Masukkan nominal dalam rupiah"
    className="input-field"
  />
</div>
```

---

This design system provides a comprehensive foundation for building a professional, accessible, and government-appropriate interface for the Indonesian regional retribution monitoring system. All components are designed to work seamlessly with TanStack Start, Shadcn/ui, and Tailwind CSS while maintaining consistency with Indonesian government design standards.