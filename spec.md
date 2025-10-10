# Form Builder App Specification

## Overview
A local form builder application built with Vue and @jsonforms/core that allows users to create forms by editing JSON schemas directly or by pasting example JSON data. The app provides real-time preview and localStorage-based project management.

## Core Features

### 1. Dual Creation Modes

#### Manual Schema Editing
- Users create forms by directly editing JSON Schema, UI Schema and JSON data files
- All modifications happen through code editors
- Future enhancement: Add UI controls for quick field addition

#### Data-Driven Generation
- When users paste example JSON data into the data editor pane, the app automatically infers types and generates JSON Schema and UI Schema
- If existing schemas don't match pasted data, warn user before replacing
- Type inference includes:
  - Basic types: string, number, boolean, object, array
  - Email format detection
  - Date/datetime detection (ISO 8601 and common formats like MM/DD/YYYY, DD-MM-YYYY)
  - Numeric strings treated as strings by default

### 2. User Interface Layout

#### Split-Screen Design
- **Left Panel**: Editor pane with vertical accordion layout
  - JSON Schema editor
  - UI Schema editor
  - Data editor
  - Each pane can be collapsed/expanded and resized
  - Users can only modify form by editing these files

- **Right Panel**: Live preview
  - Shows rendered form using JSONForms
  - Preview-only (not interactive for editing)
  - Uses JSONForms default renderers
  - Updates in real-time as schemas change

#### Styling
- Minimal/clean design aesthetic
- Dark mode support
- Tailwind CSS for styling

### 3. Validation & Error Handling

#### Real-Time Validation
- Validation occurs automatically as user types
- Invalid JSON in any editor triggers visual feedback:
  - Editor title/header turns red
  - Status line displays validation error message
  - Preview freezes showing last valid state
  - "Revert" button appears to restore to last valid state

#### Schema-Data Mismatch
- Preview shows JSONForms validation errors when data doesn't match schema
- Behaves like production JSONForms implementation

### 4. Project Management

#### localStorage-Based Persistence
- Automatic save of work-in-progress to localStorage
- Users can save multiple form projects
- Each project requires user-provided name
- Users can:
  - Rename saved forms
  - Delete saved forms
  - View list of all saved forms

#### App Initialization
- On load, automatically opens last worked-on form
- New users see minimal example form with common control types

#### Default Form Template
- Includes examples of common control types:
  - Text input
  - Number input
  - Checkbox
  - Select/dropdown
  - Date picker
  - Email field

### 5. Export Functionality

#### Download Bundle
- Single .zip file containing:
  - `schema.json` - JSON Schema
  - `uischema.json` - UI Schema
  - `data.json` - Sample data
- Filename uses project name (e.g., "contact-form.zip")
- No import functionality (users copy/paste into editors instead)

### 6. Technical Requirements

#### Framework & Libraries
- Vue.js
- @jsonforms/core
- Tailwind CSS
- Syntax highlighting for editors (eg. highlight.js)
- ZIP generation library (JSZip or similar)

- Vite and bun for build tooling
- Vitest for unit tests
- Playwright for e2e tests

#### Storage
- localStorage for all persistence
- No size limits (browser handles naturally)
- No maximum number of saved forms

#### Browser Compatibility
- Modern browsers with localStorage support
- No server-side requirements (fully local app)

## User Flows

### Creating a New Form from Scratch
1. User opens app (or creates new project)
2. Sees default example form with common controls
3. Edits JSON Schema and UI Schema in left panel
4. Observes real-time preview in right panel
5. Adjusts sample data as needed
6. Saves project with custom name
7. Downloads bundle when complete

### Creating a Form from Example Data
1. User pastes JSON data into data editor
2. App generates JSON Schema and UI Schema automatically
3. If schemas exist, warning appears before replacement
4. User confirms or cancels
5. Generated form appears in preview
6. User refines schemas as needed
7. Saves and downloads

### Managing Projects
1. User accesses projects list view
2. Sees all saved forms by name
3. Can select form to open
4. Can rename or delete forms
5. Last-opened form loads automatically on next visit

### Handling Validation Errors
1. User makes invalid JSON edit
2. Editor header turns red
3. Status line shows error message
4. Preview freezes at last valid state
5. User fixes error or clicks revert
6. Normal state resumes when valid

## Testing Strategy

### Testing Requirements
- All test output must be pristine (no unexpected errors or warnings in logs)
- Tests must cover all core functionality listed in this spec
- Test coverage for type inference must be comprehensive given its complexity
- localStorage tests must clean up after themselves to avoid pollution
- E2E tests should use realistic form examples with various field types

## Success Criteria

- Users can create forms by editing JSON schemas manually
- Users can generate forms from example JSON data with accurate type inference
- Real-time preview accurately reflects schema changes
- Validation errors are clearly communicated
- Projects persist across browser sessions
- Users can manage multiple saved forms
- Export produces valid JSON Schema, UI Schema, and sample data files
- App works entirely offline without server dependencies

