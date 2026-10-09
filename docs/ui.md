# UI Coding Standards

This document outlines the strict UI coding standards for this project. All developers must adhere to these guidelines when building user interfaces.

## Core Principles

### 1. Angular Material MD3 Components Only

**ABSOLUTELY NO CUSTOM COMPONENTS SHALL BE CREATED.**

All UI components must use Angular Material MD3 (Material Design 3) components exclusively. This ensures:

- Consistent design language across the application
- Accessibility compliance out of the box
- Reduced maintenance overhead
- Adherence to Material Design specifications

### 2. Approved Component Library

The only approved UI component library is:

- **Angular Material** (MD3/Material Design 3)
- Official package: `@angular/material`
- Documentation: https://material.angular.io/

### 3. Prohibited Practices

The following practices are **strictly prohibited**:

- Creating custom UI components (buttons, inputs, cards, etc.)
- Using third-party UI libraries other than Angular Material
- Implementing custom design systems or component patterns
- Building wrapper components around Angular Material components (unless absolutely necessary for business logic)

## Implementation Guidelines

### Component Usage

When building features, you must:

1. **Search Angular Material first**: Before implementing any UI element, check if Angular Material provides a component for it
2. **Use components as-is**: Utilize Angular Material components with their native APIs
3. **Theme customization only**: Customize appearance through Angular Material's theming system, not by creating custom components
4. **Compose, don't create**: Build complex UIs by composing Angular Material components, not by creating new base components

### Common Components Reference

For quick reference, here are commonly used Angular Material MD3 components:

**Form Controls:**
- `<mat-form-field>` with `<input matInput>` for text inputs
- `<mat-select>` for dropdowns
- `<mat-checkbox>` for checkboxes
- `<mat-radio-group>` and `<mat-radio-button>` for radio buttons
- `<mat-slide-toggle>` for toggles
- `<mat-datepicker>` for date selection

**Layout:**
- `<mat-card>` for card layouts
- `<mat-toolbar>` for toolbars and headers
- `<mat-sidenav>` for side navigation
- `<mat-grid-list>` for grid layouts
- `<mat-divider>` for visual separators

**Navigation:**
- `<mat-tab-group>` and `<mat-tab>` for tabs
- `<mat-menu>` for menus
- `<mat-list>` for lists

**Buttons & Indicators:**
- `<button mat-button>`, `mat-raised-button`, `mat-flat-button`, `mat-stroked-button`, `mat-icon-button`, `mat-fab`, `mat-mini-fab`
- `<mat-icon>` for icons (Material Icons)
- `<mat-badge>` for badges
- `<mat-chip>` for chips
- `<mat-progress-bar>` and `<mat-progress-spinner>` for loading states

**Overlays:**
- `MatDialog` service for dialogs
- `MatSnackBar` service for snackbars/toasts
- `MatBottomSheet` service for bottom sheets
- `<mat-tooltip>` for tooltips

**Data Display:**
- `<mat-table>` for tables
- `<mat-paginator>` for pagination
- `<mat-sort>` for sortable columns
- `<mat-expansion-panel>` for expandable content

## Date Formatting

### Required Library

All date formatting must use **date-fns**:

```bash
npm install date-fns
# or
pnpm add date-fns
```

### Standard Date Format

All dates displayed in the UI must follow this format:

```
[ordinal day] [abbreviated month] [full year]
```

**Examples:**
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024
- 21st Dec 2025
- 22nd Nov 2024
- 23rd Oct 2025
- 31st Mar 2024

### Implementation

Use the following `date-fns` functions to achieve this format:

```typescript
import { format } from 'date-fns';

function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  return format(dateObj, 'do MMM yyyy');
}
```

**Format tokens:**
- `do` - Day of month with ordinal (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - Full year (2024, 2025, etc.)

### Usage Examples

**In Components:**

```typescript
import { Component } from '@angular/core';
import { format } from 'date-fns';

@Component({
  selector: 'app-example',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Event Details</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Date: {{ formattedDate }}</p>
      </mat-card-content>
    </mat-card>
  `
})
export class ExampleComponent {
  eventDate = new Date('2025-09-01');
  formattedDate = format(this.eventDate, 'do MMM yyyy'); // "1st Sep 2025"
}
```

**In Pipes (Optional):**

If you need to format dates in templates frequently, you may create a pipe:

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'standardDate',
  standalone: true
})
export class StandardDatePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) return '';

    const dateObj = typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;

    return format(dateObj, 'do MMM yyyy');
  }
}
```

**Usage in template:**

```html
<p>{{ eventDate | standardDate }}</p>
<!-- Output: 1st Sep 2025 -->
```

### Date Picker Integration

When using Angular Material's `mat-datepicker`, display the selected date in the standard format:

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { format } from 'date-fns';

@Component({
  selector: 'app-date-picker-example',
  template: `
    <mat-form-field>
      <mat-label>Select Date</mat-label>
      <input matInput [matDatepicker]="picker" [formControl]="dateControl">
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>

    @if (formattedDate) {
      <p>Selected: {{ formattedDate }}</p>
    }
  `
})
export class DatePickerExampleComponent {
  dateControl = new FormControl<Date | null>(null);

  get formattedDate(): string | null {
    const value = this.dateControl.value;
    return value ? format(value, 'do MMM yyyy') : null;
  }
}
```

## Enforcement

These standards are mandatory and will be enforced through:

1. **Code reviews**: All pull requests must comply with these guidelines
2. **Linting rules**: Configure ESLint to detect prohibited patterns
3. **Team awareness**: All team members must read and acknowledge these standards

## Exceptions

In the extremely rare case where Angular Material does not provide a component for a specific use case:

1. Document the use case and why Angular Material is insufficient
2. Get approval from the tech lead or architect
3. Explore if the requirement can be met by composing existing Angular Material components
4. Only if approved, implement the minimum necessary custom code while following Material Design principles

## Resources

- Angular Material Documentation: https://material.angular.io/
- Material Design 3 Guidelines: https://m3.material.io/
- date-fns Documentation: https://date-fns.org/
- Angular Material Theming: https://material.angular.io/guide/theming

---

**Last Updated**: {{ current_date }}
**Version**: 1.0.0
