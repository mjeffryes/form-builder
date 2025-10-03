# Form Builder Implementation Plan

## Overview
This plan breaks down the Form Builder app into small, testable increments following TDD principles. Each step builds on the previous one, ensuring no orphaned code and comprehensive test coverage.

## Technology Stack
- **Framework**: Vue 3 with Composition API
- **Form Rendering**: @jsonforms/core, @jsonforms/vue
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor or CodeMirror
- **Build Tool**: Vite
- **Runtime**: Bun
- **Testing**: Vitest (unit), Playwright (e2e)
- **Utilities**: JSZip (export functionality)

## High-Level Architecture

### Core Modules
1. **Storage Layer** - localStorage persistence
2. **Project Management** - CRUD operations for form projects
3. **JSON Validation** - Real-time JSON parsing and validation
4. **Schema Inference** - Type detection and schema generation from data
5. **UI Components** - Editors, preview, project list
6. **Export Service** - ZIP generation

### Implementation Phases
1. **Foundation** - Project setup, storage, basic models
2. **Core Editing** - Editors, validation, preview integration
3. **Schema Generation** - Data-driven form creation
4. **Project Management** - Save/load/delete functionality
5. **Export & Polish** - Download bundles, UI refinements

---

## Detailed Step-by-Step Breakdown

### Phase 1: Foundation (Steps 1-5)

#### Step 1: Project Initialization & Configuration
- Set up Vue 3 + Vite project with Bun
- Configure Tailwind CSS
- Set up Vitest and Playwright
- Create basic project structure
- Configure path aliases and TypeScript (if used)

#### Step 2: Storage Service Foundation
- Create localStorage wrapper service
- Implement get/set/delete/clear operations
- Handle JSON serialization/deserialization
- Error handling for quota exceeded
- Unit tests for all storage operations

#### Step 3: Project Model & Repository
- Define Project data model (id, name, jsonSchema, uiSchema, data, lastModified)
- Create ProjectRepository with CRUD operations
- Implement auto-save current project to localStorage
- Load last-opened project functionality
- Unit tests for project persistence

#### Step 4: Default Template Data
- Create default form template with example controls
- Include JSON Schema with various field types
- Create matching UI Schema
- Create sample data object
- Unit tests verifying template validity

#### Step 5: JSON Validator Service
- Create validator that parses JSON strings
- Return validation result (success/error with message)
- Handle edge cases (empty, malformed, null)
- Unit tests with valid and invalid JSON

---

### Phase 2: Core Editing (Steps 6-12)

#### Step 6: Basic App Layout Component
- Create main App.vue with split-panel layout structure
- Left panel placeholder for editors
- Right panel placeholder for preview
- Basic responsive layout with Tailwind
- Component test rendering structure

#### Step 7: JSONForms Preview Component
- Create FormPreview.vue component
- Integrate @jsonforms/vue
- Accept schema, uiSchema, data as props
- Render with default renderers
- Display JSONForms validation errors
- Component tests with valid and invalid schemas

#### Step 8: JSON Editor Component (Display Only)
- Create JsonEditor.vue component
- Props: content (string), title, readonly
- Display JSON with syntax highlighting (basic textarea first)
- Emit update events on change
- Unit tests for component rendering and events

#### Step 9: Editor Validation Integration
- Add validation state to JsonEditor
- Show error state (red header) when invalid
- Display error message
- Add revert button when invalid
- Emit validation status changes
- Unit tests for validation UI states

#### Step 10: Code Editor Integration (Monaco/CodeMirror)
- Replace textarea with Monaco or CodeMirror
- Configure JSON mode with syntax highlighting
- Preserve all validation features
- Unit tests ensuring editor integration works

#### Step 11: Three-Editor Layout (Schema, UI Schema, Data)
- Create SchemaEditorPanel component with accordion layout
- Integrate three JsonEditor instances
- Implement collapse/expand functionality
- Basic resize capability between editors
- Component tests for layout behavior

#### Step 12: Wire Editors to Preview
- Connect SchemaEditorPanel to FormPreview in App.vue
- Implement reactive updates (debounced)
- Freeze preview on invalid JSON
- Maintain last valid state
- E2E test: edit schema → see preview update

---

### Phase 3: Schema Generation (Steps 13-17)

#### Step 13: Basic Type Inference Service
- Create TypeInferenceService
- Infer primitive types: string, number, boolean, null
- Handle arrays and objects (nested)
- Return JSON Schema structure
- Unit tests for all primitive types and nesting

#### Step 14: Format Detection (Email, Date)
- Add email format detection (regex)
- Add date format detection (ISO 8601)
- Add datetime detection
- Common date formats (MM/DD/YYYY, DD-MM-YYYY)
- Treat numeric strings as strings
- Comprehensive unit tests for edge cases

#### Step 15: UI Schema Generation
- Create UI Schema generator from JSON Schema
- Generate appropriate control types
- Handle nested objects and arrays
- Maintain reasonable field ordering
- Unit tests verifying UI Schema structure

#### Step 16: Schema Generation Service Integration
- Create SchemaGenerationService combining inference + UI generation
- Accept sample data JSON string
- Return {jsonSchema, uiSchema}
- Handle errors gracefully
- Unit tests with various data examples

#### Step 17: Data Paste Workflow
- Detect when data editor content changes significantly
- Show warning modal if schemas exist
- Implement "Replace" and "Cancel" actions
- Trigger schema generation on replace
- Update all three editors atomically
- E2E test: paste data → confirm → see generated form

---

### Phase 4: Project Management (Steps 18-22)

#### Step 18: Project List Service
- Extend ProjectRepository with list operations
- Get all saved projects (sorted by lastModified)
- Filter/search projects by name (future enhancement structure)
- Unit tests for listing and sorting

#### Step 19: Auto-Save Current Work
- Implement auto-save on editor changes (debounced)
- Save to special "current" project in localStorage
- Load "current" project on app initialization
- Unit tests for auto-save behavior
- E2E test: edit → refresh → see changes persisted

#### Step 20: Save Project Modal
- Create SaveProjectModal.vue component
- Input field for project name
- Validation (non-empty, unique name)
- Save button triggers project save
- Integration test for modal interaction

#### Step 21: Project List View
- Create ProjectList.vue component
- Display all saved projects
- Click to load project
- Rename functionality (inline or modal)
- Delete with confirmation
- Component tests for all interactions

#### Step 22: Navigation & Project Switching
- Add header with "Projects" and "Save As" buttons
- Integrate SaveProjectModal
- Integrate ProjectList (sidebar or modal)
- Handle project switching (load into editors)
- Update document title with project name
- E2E test: create project → save → switch → verify loaded

---

### Phase 5: Export & Polish (Steps 23-27)

#### Step 23: Export Service
- Create ExportService using JSZip
- Generate zip with schema.json, uischema.json, data.json
- Use project name for filename
- Return blob for download
- Unit tests verifying zip contents

#### Step 24: Export UI Integration
- Add "Export" button to header
- Trigger download on click
- Show success feedback
- Handle errors (invalid state)
- E2E test: create form → export → verify zip

#### Step 25: Dark Mode Support
- Implement dark mode toggle
- Persist preference to localStorage
- Apply Tailwind dark mode classes
- Update code editor theme
- Component tests for theme switching

#### Step 26: Status Bar Component
- Create StatusBar.vue for bottom of screen
- Display current project name
- Show validation error messages
- Display last saved timestamp
- Component tests for status display

#### Step 27: Final E2E Testing & Polish
- Comprehensive E2E test suite covering all user flows
- Error boundary implementation
- Loading states for heavy operations
- Accessibility audit (ARIA labels, keyboard nav)
- Performance optimization (debouncing, lazy loading)
- Browser compatibility testing

---

## Testing Strategy

### Unit Tests (Vitest)
- **Services**: 100% coverage for storage, validation, inference, export
- **Components**: Test props, events, computed properties, user interactions
- **Utilities**: All helper functions thoroughly tested
- **localStorage**: Mock localStorage, clean up after each test

### E2E Tests (Playwright)
- Initial load with default template
- Manual schema editing workflow
- Data-driven generation workflow
- Project save/load/delete
- Export functionality
- Validation error handling
- Dark mode toggle
- All tests must produce pristine output (no console errors)

### Test Data
- Realistic form examples (contact form, survey, registration)
- Edge cases (empty objects, deeply nested data, arrays of primitives)
- Invalid JSON samples
- Large projects (test performance)

---

## Implementation Prompts

Each prompt below is designed to be given to a code-generation LLM in sequence. Each builds on the previous work and ends with integration.

### Prompt 1: Project Initialization & Configuration

```
Initialize a new Vue 3 form builder project with the following requirements:

Setup:
- Use Vite as the build tool and Bun as the package manager
- Configure Vue 3 with Composition API (script setup syntax)
- Install and configure Tailwind CSS with a minimal dark mode-ready config
- Set up Vitest for unit testing with appropriate Vue test utilities
- Set up Playwright for E2E testing
- Create a basic project structure with folders: src/components, src/services, src/models, src/utils, tests/unit, tests/e2e

Dependencies to install:
- vue, @vitejs/plugin-vue
- tailwindcss, postcss, autoprefixer
- vitest, @vue/test-utils, happy-dom (or jsdom)
- playwright, @playwright/test
- (defer other libraries for later steps)

Deliverables:
- Working Vite config with Vue plugin
- Tailwind config with dark mode class strategy
- Vitest config with Vue testing setup
- Playwright config with basic test structure
- Basic App.vue that renders "Form Builder" heading
- One passing unit test for App.vue
- One passing E2E test that loads the app

Follow TDD: Write tests first, then implement to make them pass.
```

### Prompt 2: Storage Service Foundation

```
Create a localStorage wrapper service with full test coverage.

Context: We need a reliable storage layer for persisting form projects. This service will be the foundation for all persistence operations.

Requirements:
1. Create src/services/StorageService.ts (or .js)
2. Implement methods:
   - get<T>(key: string): T | null - retrieve and parse JSON
   - set<T>(key: string, value: T): void - stringify and store
   - remove(key: string): void - delete key
   - clear(): void - clear all storage
   - has(key: string): boolean - check if key exists
3. Handle errors:
   - JSON parse errors (return null)
   - QuotaExceededError (throw custom error)
   - Handle null/undefined values gracefully
4. Use a namespace prefix for all keys (e.g., "form-builder:")

TDD Approach:
- Write tests/unit/services/StorageService.test.ts FIRST
- Test all methods with valid and invalid inputs
- Mock localStorage (reset before each test)
- Test error conditions (malformed JSON, quota exceeded)
- Verify namespace prefix is applied
- Then implement StorageService to pass all tests

Success criteria: All tests pass, 100% code coverage for StorageService
```

### Prompt 3: Project Model & Repository

```
Create the Project data model and repository layer with CRUD operations.

Context: Projects represent saved forms with schema, UI schema, and data. The repository manages persistence using the StorageService from Prompt 2.

Requirements:
1. Create src/models/Project.ts:
   - Interface/type: Project { id: string, name: string, jsonSchema: string, uiSchema: string, data: string, lastModified: number }
   - Use ISO timestamp for lastModified

2. Create src/services/ProjectRepository.ts:
   - saveProject(project: Project): void - save or update project
   - getProject(id: string): Project | null - retrieve by ID
   - deleteProject(id: string): void - remove project
   - getAllProjects(): Project[] - list all projects sorted by lastModified desc
   - saveCurrent(project: Omit<Project, 'id' | 'name'>): void - save work-in-progress to special "current" key
   - getCurrent(): Omit<Project, 'id' | 'name'> | null - load work-in-progress

3. Use StorageService for all operations
4. Generate IDs using crypto.randomUUID() or timestamp-based approach
5. Store projects with key pattern: "project:{id}"
6. Store current work with key: "current"

TDD Approach:
- Write tests/unit/services/ProjectRepository.test.ts FIRST
- Mock StorageService (or use real localStorage and clean up)
- Test CRUD operations
- Test current project save/load
- Test edge cases (duplicate IDs, missing projects)
- Verify sorting by lastModified
- Then implement to pass tests

Success criteria: All tests pass, repository correctly uses StorageService
```

### Prompt 4: Default Template Data

```
Create the default form template with example controls.

Context: New users should see a functional example form demonstrating various field types. This template will be used on first load and when creating new projects.

Requirements:
1. Create src/data/defaultTemplate.ts
2. Export three constants:
   - DEFAULT_JSON_SCHEMA: Valid JSON Schema (Draft 7 or 2020-12) with:
     * Text input (firstName)
     * Number input (age)
     * Boolean/checkbox (subscribe)
     * Enum/select (country with 3-5 options)
     * Email field (email with format)
     * Date field (birthdate)
   - DEFAULT_UI_SCHEMA: Matching UI Schema with:
     * Vertical layout
     * Appropriate controls for each field
     * Labels and descriptions
   - DEFAULT_DATA: Sample data object matching the schema

3. Ensure all three are valid and work together
4. Use realistic example (e.g., contact form, user registration)

TDD Approach:
- Write tests/unit/data/defaultTemplate.test.ts FIRST
- Test that DEFAULT_JSON_SCHEMA is valid JSON Schema
- Test that DEFAULT_UI_SCHEMA has required structure
- Test that DEFAULT_DATA validates against DEFAULT_JSON_SCHEMA
- Verify all expected fields are present
- Then create defaultTemplate.ts with data to pass tests

Success criteria: Template is valid, tests confirm structure and compatibility
```

### Prompt 5: JSON Validator Service

```
Create a JSON validation service with comprehensive error handling.

Context: Editors need real-time validation to provide immediate feedback. This service parses JSON strings and returns detailed error information.

Requirements:
1. Create src/services/JsonValidator.ts
2. Create ValidationResult type: { valid: boolean, error?: string, parsed?: any }
3. Implement validateJson(jsonString: string): ValidationResult
   - Try to parse with JSON.parse()
   - Return { valid: true, parsed: <result> } on success
   - Return { valid: false, error: <message> } on failure
   - Handle edge cases: empty string, whitespace, null, undefined
   - Extract line/column from SyntaxError if possible

TDD Approach:
- Write tests/unit/services/JsonValidator.test.ts FIRST
- Test valid JSON: objects, arrays, primitives, nested structures
- Test invalid JSON: malformed, trailing commas, single quotes, undefined
- Test edge cases: empty string, whitespace only, null, very large JSON
- Verify error messages are helpful
- Then implement to pass all tests

Success criteria: All tests pass, handles all JSON validation scenarios correctly
```

### Prompt 6: Basic App Layout Component

```
Create the main application layout with split-panel structure.

Context: The app has a split-screen design: left panel for editors, right panel for live preview. Build the layout shell first, then fill it in later steps.

Requirements:
1. Update src/App.vue:
   - Create two-column layout using Tailwind CSS
   - Left panel: 50% width (adjustable later), light background
   - Right panel: 50% width, slightly different background
   - Make responsive (stack on mobile)
   - Add header with app title "Form Builder"
   - Add placeholder text in each panel

2. Basic styling:
   - Clean, minimal design
   - Proper spacing and padding
   - Support both light and dark mode classes (implement toggle later)

TDD Approach:
- Write tests/unit/App.test.ts FIRST
- Test that component renders
- Test that left and right panels are present
- Test that header is rendered with correct title
- Then update App.vue to pass tests

3. E2E test:
- Write tests/e2e/layout.test.ts
- Test that app loads and displays both panels
- Test responsive behavior (viewport resize)

Success criteria: Layout renders correctly, tests pass, foundation ready for editor integration
```

### Prompt 7: JSON Editor Component (Display Only)

```
Create a reusable JSON editor component with basic functionality.

Context: We need three editor instances (schema, UI schema, data). Build a generic component first with basic textarea, then upgrade to Monaco/CodeMirror later.

Requirements:
1. Create src/components/JsonEditor.vue:
   - Props: content (string), title (string), readonly (boolean, default false)
   - Emit: update:content (string), validation-change (ValidationResult)
   - Display title in header
   - Render textarea with content
   - Emit update:content on input (debounced 300ms)
   - Style with Tailwind (border, padding, mono font)

2. Basic features:
   - Resizable textarea
   - Line numbers (nice to have, skip if complex)
   - Monospace font
   - Scroll behavior

TDD Approach:
- Write tests/unit/components/JsonEditor.test.ts FIRST
- Test component renders with props
- Test content prop is displayed
- Test update:content event emits on change
- Test readonly prop disables editing
- Test debouncing works correctly
- Then implement JsonEditor.vue to pass tests

Success criteria: Component is reusable, emits events correctly, all tests pass
```

### Prompt 8: Editor Validation Integration

```
Add validation state and error UI to JsonEditor component.

Context: Editors must show real-time validation feedback with visual indicators and revert functionality. Integrate the JsonValidator service from Prompt 5.

Requirements:
1. Update src/components/JsonEditor.vue:
   - Import JsonValidator service
   - Validate content on every change (debounced)
   - Track validation state in component
   - Emit validation-change event with ValidationResult
   - Show error state visually:
     * Header/title area: red background when invalid
     * Error message: display below title when invalid
     * Revert button: show when invalid, click restores last valid content
   - Track last valid content internally

2. Styling:
   - Error state: red header (bg-red-100, dark:bg-red-900)
   - Error message: red text, small font
   - Revert button: styled button in header

TDD Approach:
- Write additional tests in tests/unit/components/JsonEditor.test.ts FIRST
- Test validation with valid JSON (no error state)
- Test validation with invalid JSON (error state displayed)
- Test error message displays
- Test revert button appears and restores content
- Test validation-change event emits ValidationResult
- Then implement validation features to pass tests

Success criteria: Validation works, error UI displays, revert functionality works, tests pass
```

### Prompt 9: Code Editor Integration (Monaco or CodeMirror)

```
Replace textarea with a professional code editor (Monaco or CodeMirror).

Context: Monaco Editor provides excellent JSON editing with syntax highlighting, bracket matching, and auto-formatting. Integrate it while preserving all validation features.

Requirements:
1. Choose Monaco Editor or CodeMirror (recommend Monaco for JSON support)
2. Install dependencies:
   - Monaco: monaco-editor, @guolao/vue-monaco-editor (or alternative)
   - CodeMirror: codemirror, vue-codemirror

3. Update src/components/JsonEditor.vue:
   - Replace textarea with Monaco/CodeMirror component
   - Configure for JSON mode
   - Enable syntax highlighting
   - Preserve all validation logic
   - Preserve error UI and revert button
   - Handle editor lifecycle (mount, unmount, updates)

4. Configuration:
   - Theme: light/dark based on mode
   - Font size: 14px
   - Minimap: enabled
   - Line numbers: enabled
   - Bracket matching: enabled

TDD Approach:
- Existing tests should still pass (no changes needed if API is preserved)
- Add tests/unit/components/JsonEditor.test.ts tests for:
   * Editor instance is created
   * Content updates propagate to editor
   * Editor changes emit update:content
- Run all existing tests to verify no regression
- Then integrate Monaco/CodeMirror

Success criteria: Professional editor works, all existing tests pass, no loss of functionality
```

### Prompt 10: Three-Editor Layout (Accordion Panel)

```
Create a panel with three JSON editors in an accordion layout.

Context: The left panel contains three editors (JSON Schema, UI Schema, Data) that can be collapsed/expanded independently. Build this composite component now.

Requirements:
1. Create src/components/SchemaEditorPanel.vue:
   - Contains three JsonEditor instances:
     * "JSON Schema" editor
     * "UI Schema" editor
     * "Data" editor
   - Each editor in an accordion section (can collapse/expand)
   - Props: jsonSchema (string), uiSchema (string), data (string)
   - Emit: update:jsonSchema, update:uiSchema, update:data
   - Emit: validation (object with { jsonSchema: ValidationResult, uiSchema: ValidationResult, data: ValidationResult })

2. Accordion behavior:
   - Click header to collapse/expand section
   - Show expand/collapse icon
   - Collapsed: only header visible
   - Expanded: editor visible, takes available height
   - At least one section must be expanded
   - Store expand/collapse state in component

3. Layout:
   - Vertical stack
   - Equal height distribution among expanded sections
   - Smooth transitions

TDD Approach:
- Write tests/unit/components/SchemaEditorPanel.test.ts FIRST
- Test component renders three editors
- Test props are passed to editors
- Test update events are emitted
- Test validation events aggregate correctly
- Test collapse/expand behavior
- Test at least one section stays expanded
- Then implement component to pass tests

Success criteria: Three editors display correctly, accordion works, events propagate, tests pass
```

### Prompt 11: JSONForms Preview Component

```
Create the live preview component using JSONForms.

Context: The right panel displays a live form preview using @jsonforms/vue. This component renders the form based on JSON Schema, UI Schema, and data.

Requirements:
1. Install dependencies:
   - @jsonforms/core
   - @jsonforms/vue
   - @jsonforms/vue-vanilla (or another renderer set)

2. Create src/components/FormPreview.vue:
   - Props: jsonSchema (string), uiSchema (string), data (string), frozen (boolean)
   - Parse JSON strings to objects
   - Use <json-forms> component from @jsonforms/vue
   - Pass parsed schema, uiSchema, data as props
   - Use default renderers from @jsonforms/vue-vanilla
   - Handle data changes (two-way binding, but don't emit back - preview only)
   - Show frozen state: overlay or message when frozen prop is true
   - Display JSONForms validation errors (if data doesn't match schema)

3. Error handling:
   - If schemas can't be parsed, show error message
   - If JSONForms fails to render, show error boundary

TDD Approach:
- Write tests/unit/components/FormPreview.test.ts FIRST
- Test component renders with valid schema and data
- Test parsing of JSON string props
- Test frozen state displays overlay
- Test JSONForms validation errors appear
- Test with invalid schema (error state)
- Mock @jsonforms/vue if needed for unit tests
- Then implement component to pass tests

Success criteria: JSONForms renders correctly, errors handled gracefully, tests pass
```

### Prompt 12: Wire Editors to Preview in App

```
Connect the editor panel to the preview panel with reactive updates.

Context: Now integrate SchemaEditorPanel and FormPreview in App.vue. Changes in editors should update the preview in real-time. Invalid JSON should freeze the preview.

Requirements:
1. Update src/App.vue:
   - Import and use SchemaEditorPanel in left panel
   - Import and use FormPreview in right panel
   - Create reactive state: currentJsonSchema, currentUiSchema, currentData
   - Initialize with DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA (from Prompt 4)
   - Bind SchemaEditorPanel props and events (v-model pattern)
   - Track validation state from SchemaEditorPanel
   - Pass frozen=true to FormPreview when any editor is invalid
   - Pass last valid values to FormPreview (maintain lastValid state)
   - Add debouncing (300ms) before updating preview

2. State management:
   - Current values (may be invalid)
   - Last valid values (for preview)
   - Validation states for all three editors

TDD Approach:
- Update tests/unit/App.test.ts:
   * Test default template loads
   * Test editor changes update state
   * Test preview receives updates
   * Test invalid JSON freezes preview with last valid state
- Write tests/e2e/editing.test.ts:
   * Test editing JSON Schema updates preview
   * Test editing UI Schema updates preview
   * Test editing data updates preview
   * Test invalid JSON freezes preview (visual confirmation)
- Then implement wiring in App.vue to pass tests

Success criteria: Editors and preview are connected, real-time updates work, frozen state works, tests pass
```

### Prompt 13: Basic Type Inference Service

```
Create a service that infers JSON Schema from sample data (primitives and structures).

Context: When users paste data, we need to automatically generate a JSON Schema. Start with basic type inference: primitives, objects, and arrays.

Requirements:
1. Create src/services/TypeInferenceService.ts
2. Implement inferSchema(data: any): object
   - Detect primitive types: string, number, boolean, null
   - Handle objects: create schema with properties
   - Handle arrays: infer item type (homogeneous arrays)
   - Support nested objects and arrays
   - Return valid JSON Schema object
   - Set schema version ($schema field)

3. Type detection rules:
   - Use typeof for primitives
   - Arrays: infer from first item or combine types
   - Objects: recurse through properties
   - Mixed-type arrays: use anyOf or just "type": "string" for simplicity

TDD Approach:
- Write tests/unit/services/TypeInferenceService.test.ts FIRST
- Test inference for:
   * Primitives: string, number, boolean, null
   * Simple objects: { name: "John", age: 30 }
   * Nested objects: { user: { name: "John" } }
   * Arrays of primitives: [1, 2, 3]
   * Arrays of objects: [{ id: 1 }, { id: 2 }]
   * Mixed nested structures
   * Empty objects and arrays
- Verify generated schemas are valid
- Then implement TypeInferenceService to pass tests

Success criteria: Correctly infers types for all cases, generates valid schemas, tests pass
```

### Prompt 14: Format Detection (Email, Date)

```
Enhance type inference with format detection for strings.

Context: Improve schema generation by detecting common formats like email and date/datetime. This makes forms more useful out of the box.

Requirements:
1. Update src/services/TypeInferenceService.ts:
   - Detect email format: use regex to identify emails
   - Detect date formats:
     * ISO 8601: YYYY-MM-DD (set format: "date")
     * ISO 8601 datetime: YYYY-MM-DDTHH:mm:ss (set format: "date-time")
     * Common formats: MM/DD/YYYY, DD-MM-YYYY (set format: "date")
   - Numeric strings: keep as string type (e.g., "12345", "00123")
   - Apply format to JSON Schema when detected

2. Format detection logic:
   - Email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   - ISO date: /^\d{4}-\d{2}-\d{2}$/
   - ISO datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
   - Common dates: /^\d{2}\/\d{2}\/\d{4}$/ or /^\d{2}-\d{2}-\d{4}$/
   - Check string values before applying format

TDD Approach:
- Write additional tests in tests/unit/services/TypeInferenceService.test.ts FIRST
- Test email detection: "user@example.com" → format: "email"
- Test date detection: "2024-01-15" → format: "date"
- Test datetime detection: "2024-01-15T10:30:00" → format: "date-time"
- Test common date formats: "01/15/2024", "15-01-2024"
- Test numeric strings stay as strings: "12345", "00123"
- Test that inference still works for all previous cases
- Then implement format detection to pass tests

Success criteria: Format detection works accurately, no regression, tests pass
```

### Prompt 15: UI Schema Generation

```
Create a service that generates UI Schema from JSON Schema.

Context: After inferring JSON Schema, we need a matching UI Schema to control form rendering. Generate sensible defaults based on field types and formats.

Requirements:
1. Create src/services/UiSchemaGenerator.ts
2. Implement generateUiSchema(jsonSchema: object): object
   - Create vertical layout by default
   - Map schema properties to UI elements
   - Set appropriate controls based on type and format:
     * format: "email" → email control
     * format: "date" → date control
     * enum → dropdown control
     * boolean → checkbox control
     * number → number input
     * string → text input
   - Handle nested objects (create groups)
   - Handle arrays (create list controls)
   - Add labels from property names (convert camelCase to Title Case)

3. UI Schema structure:
   - type: "VerticalLayout"
   - elements: array of controls
   - Each element: { type: "Control", scope: "#/properties/fieldName" }

TDD Approach:
- Write tests/unit/services/UiSchemaGenerator.test.ts FIRST
- Test generation for various schemas:
   * Simple object with primitives
   * Object with formats (email, date)
   * Object with enums
   * Nested objects
   * Arrays
- Verify UI Schema structure is valid
- Verify correct controls are assigned
- Then implement UiSchemaGenerator to pass tests

Success criteria: Generates valid UI Schemas, appropriate controls, tests pass
```

### Prompt 16: Schema Generation Service Integration

```
Combine type inference and UI Schema generation into a unified service.

Context: Create a high-level service that takes sample JSON data and returns both JSON Schema and UI Schema. This will be called when users paste data.

Requirements:
1. Create src/services/SchemaGenerationService.ts
2. Implement generateFromData(dataString: string): { jsonSchema: string, uiSchema: string, error?: string }
   - Parse dataString to object (handle errors)
   - Use TypeInferenceService to generate JSON Schema
   - Use UiSchemaGenerator to generate UI Schema
   - Return both as JSON strings (formatted with 2-space indent)
   - Return error message if parsing fails or generation fails

3. Use services from Prompts 13-15
4. Handle edge cases: empty data, invalid JSON, non-object data

TDD Approach:
- Write tests/unit/services/SchemaGenerationService.test.ts FIRST
- Test full generation with various sample data:
   * Simple contact form data
   * Complex nested data
   * Data with dates and emails
   * Invalid JSON (error case)
   * Empty object
- Verify both schemas are generated correctly
- Verify error handling
- Then implement SchemaGenerationService to pass tests

Success criteria: End-to-end generation works, integrates all previous services, tests pass
```

### Prompt 17: Data Paste Workflow with Confirmation

```
Implement the data-driven generation workflow with user confirmation.

Context: When users paste new data into the data editor, detect significant changes and offer to generate schemas. Warn if existing schemas will be replaced.

Requirements:
1. Create src/components/GenerateSchemaModal.vue:
   - Modal dialog with warning message
   - "Existing schemas will be replaced. Continue?"
   - "Replace" button (primary, danger style)
   - "Cancel" button
   - Emit: confirm, cancel events

2. Update src/App.vue:
   - Detect when data editor content changes significantly:
     * Data is pasted (large change in character count)
     * Data becomes valid JSON object after being invalid
   - Check if schemas already exist (not empty or not default)
   - Show GenerateSchemaModal if schemas exist
   - On confirm: call SchemaGenerationService
   - Update jsonSchema and uiSchema editors atomically
   - If no existing schemas, generate immediately
   - Add "Generate Schemas from Data" button as alternative trigger

3. State management:
   - Track if user has made manual edits (dirty flag)
   - Only warn if manual edits exist

TDD Approach:
- Write tests/unit/components/GenerateSchemaModal.test.ts FIRST
- Test modal renders, emits events
- Write tests/unit/App.test.ts for workflow:
   * Paste data with empty schemas → generates immediately
   * Paste data with existing schemas → shows modal
   * Confirm → updates editors
   * Cancel → no changes
- Write tests/e2e/schemaGeneration.test.ts:
   * Full workflow: paste data, confirm, verify form renders
   * Test with various data samples
- Then implement modal and workflow to pass tests

Success criteria: Data paste workflow works, modal confirms, schemas generate, tests pass
```

### Prompt 18: Project List Service

```
Extend project repository with listing and sorting capabilities.

Context: Users need to see all saved projects. Add listing functionality to ProjectRepository.

Requirements:
1. Update src/services/ProjectRepository.ts:
   - getAllProjects() already exists from Prompt 3
   - Ensure it returns projects sorted by lastModified (descending)
   - Add searchProjects(query: string): Project[] for future use
     * Filter by name (case-insensitive contains)
     * Also sort by lastModified

2. Optimize for performance:
   - Cache project list (invalidate on save/delete)
   - Consider localStorage key enumeration cost

TDD Approach:
- Update tests/unit/services/ProjectRepository.test.ts:
   * Test getAllProjects returns sorted list
   * Create multiple projects with different lastModified
   * Verify sort order
   * Test searchProjects filters correctly
   * Test empty results
- Then implement enhancements to pass tests

Success criteria: Listing and search work correctly, sorted properly, tests pass
```

### Prompt 19: Auto-Save Current Work

```
Implement automatic saving of current work-in-progress.

Context: Users shouldn't lose work if they close the browser. Auto-save the current state to localStorage periodically.

Requirements:
1. Update src/App.vue:
   - Add auto-save logic triggered by editor changes
   - Debounce auto-save (2 seconds after last change)
   - Use ProjectRepository.saveCurrent() with current editor content
   - Save all three: jsonSchema, uiSchema, data
   - Don't save if nothing has changed
   - Show "Saving..." and "Saved" status indicator

2. On app initialization (created/mounted):
   - Load from ProjectRepository.getCurrent()
   - If exists, use it
   - If not, use default template

3. Add status indicator:
   - Show last saved time
   - Show "Unsaved changes" when dirty

TDD Approach:
- Write tests/unit/App.test.ts for auto-save:
   * Test save is triggered after changes
   * Test debouncing works (doesn't save on every keystroke)
   * Test initialization loads current work
   * Mock timers for debounce testing
- Write tests/e2e/autoSave.test.ts:
   * Edit content, wait, refresh page, verify content persisted
- Then implement auto-save to pass tests

Success criteria: Auto-save works reliably, loads on init, tests pass
```

### Prompt 20: Save Project Modal

```
Create a modal for saving current work as a named project.

Context: Users need to save their work-in-progress as a named project. This modal captures the project name and triggers the save.

Requirements:
1. Create src/components/SaveProjectModal.vue:
   - Props: open (boolean), existingNames (string[]) for validation
   - Input field for project name
   - Validation:
     * Non-empty
     * Not duplicate (check against existingNames)
     * Show error message inline
   - "Save" button (disabled if invalid)
   - "Cancel" button
   - Emit: save(name: string), cancel events
   - Clear input on cancel

2. Styling:
   - Modal overlay (backdrop)
   - Centered modal dialog
   - Focus trap
   - Close on Escape key
   - Accessible (ARIA labels)

TDD Approach:
- Write tests/unit/components/SaveProjectModal.test.ts FIRST
- Test modal shows/hides based on open prop
- Test name validation (empty, duplicate)
- Test save event emits with name
- Test cancel event emits
- Test keyboard interactions (Escape, Enter)
- Then implement modal to pass tests

Success criteria: Modal works, validation correct, events emit properly, tests pass
```

### Prompt 21: Project List View

```
Create a project list component for viewing and managing saved projects.

Context: Users need to see all their saved projects, load them, rename them, and delete them. This component provides that interface.

Requirements:
1. Create src/components/ProjectList.vue:
   - Props: projects (Project[])
   - Display list of projects:
     * Project name
     * Last modified date (formatted)
     * Actions: Load, Rename, Delete
   - Emit: load(projectId: string), rename(projectId: string, newName: string), delete(projectId: string)
   - Inline rename: click to edit name, Enter to confirm, Escape to cancel
   - Delete confirmation: show modal or inline confirm

2. Layout:
   - List or grid view
   - Sort by last modified (already sorted by repo)
   - Show count: "X projects"
   - Empty state: "No saved projects"

3. Delete confirmation:
   - Simple inline confirm: "Delete? [Yes] [No]"
   - Or reuse modal pattern from Prompt 20

TDD Approach:
- Write tests/unit/components/ProjectList.test.ts FIRST
- Test rendering with projects
- Test empty state
- Test load event emits on click
- Test rename flow (edit, confirm, cancel)
- Test delete flow (confirm, cancel)
- Then implement ProjectList to pass tests

Success criteria: List displays, all actions work, tests pass
```

### Prompt 22: Navigation & Project Switching

```
Add project management UI to the app with navigation and switching.

Context: Integrate the project list and save modal into the app. Add header navigation to access these features.

Requirements:
1. Update src/App.vue:
   - Add header bar with:
     * App title "Form Builder"
     * Current project name (if saved) or "Untitled"
     * "Save As" button
     * "Projects" button
   - Clicking "Save As" opens SaveProjectModal
   - Clicking "Projects" opens ProjectList (modal or sidebar)
   - SaveProjectModal:
     * On save: create new Project, call ProjectRepository.saveProject()
     * Update current project reference
     * Close modal
   - ProjectList:
     * On load: load project, update all editor states
     * On rename: update project name, save
     * On delete: confirm, delete from repository, update list
     * Close list view

2. State management:
   - Track current project ID (null if unsaved)
   - Track all saved projects (reload when needed)
   - Update document.title with project name

3. Project switching:
   - Load project → update editors with project data
   - Warn if unsaved changes (optional, future enhancement)

TDD Approach:
- Update tests/unit/App.test.ts:
   * Test "Save As" opens modal
   * Test saving creates project
   * Test "Projects" opens list
   * Test loading project updates editors
- Write tests/e2e/projectManagement.test.ts:
   * Create project, save with name
   * Switch to projects list
   * Load different project
   * Verify content changed
   * Rename project
   * Delete project
- Then implement project management UI to pass tests

Success criteria: Full project management works, switching works, tests pass
```

### Prompt 23: Export Service

```
Create a service that generates a ZIP file with schema and data files.

Context: Users need to export their form as a bundle containing schema.json, uischema.json, and data.json files. Use JSZip for this.

Requirements:
1. Install dependency: jszip

2. Create src/services/ExportService.ts:
   - Implement exportProject(project: Project): Blob
     * Create new JSZip instance
     * Add schema.json with formatted jsonSchema
     * Add uischema.json with formatted uiSchema
     * Add data.json with formatted data
     * Generate zip as blob
     * Return blob
   - Implement downloadBlob(blob: Blob, filename: string): void
     * Create object URL
     * Create anchor element
     * Trigger download
     * Cleanup URL

3. File naming:
   - Use project name for zip: "project-name.zip"
   - Sanitize filename (remove special chars, spaces → hyphens)

TDD Approach:
- Write tests/unit/services/ExportService.test.ts FIRST
- Test exportProject creates zip blob
- Test zip contains three files
- Test file contents match project data
- Mock JSZip if needed, or use real JSZip and verify structure
- Test filename sanitization
- Then implement ExportService to pass tests

Success criteria: ZIP generation works, files correct, tests pass
```

### Prompt 24: Export UI Integration

```
Add export functionality to the UI with download button.

Context: Integrate the ExportService into the app. Add a button that triggers the export and downloads the ZIP file.

Requirements:
1. Update src/App.vue:
   - Add "Export" button to header
   - On click:
     * Validate all editors are valid (don't export if invalid)
     * Create project object from current state (or use saved project)
     * Call ExportService.exportProject()
     * Call ExportService.downloadBlob() with project name
     * Show success feedback (toast or status message)
   - Show error if export fails

2. Button state:
   - Disabled if any editor is invalid
   - Tooltip explaining why disabled

TDD Approach:
- Update tests/unit/App.test.ts:
   * Test export button exists
   * Test button disabled when invalid
   * Test clicking triggers export
   * Mock ExportService
- Write tests/e2e/export.test.ts:
   * Create a form
   * Click export
   * Verify download triggered (check download event)
   * Optionally: verify zip contents if Playwright supports
- Then implement export UI to pass tests

Success criteria: Export button works, validation prevents invalid exports, download triggers, tests pass
```

### Prompt 25: Dark Mode Support

```
Implement dark mode toggle with theme persistence.

Context: Add dark mode support throughout the app with a toggle. Persist the user's preference.

Requirements:
1. Create src/composables/useDarkMode.ts (or src/utils/darkMode.ts):
   - Reactive dark mode state
   - Load preference from localStorage on init
   - Toggle function
   - Apply "dark" class to document root
   - Save preference to localStorage on change

2. Update Tailwind config:
   - Ensure dark mode is set to 'class' strategy

3. Update components with dark mode styles:
   - App.vue: dark backgrounds
   - JsonEditor.vue: dark editor theme
   - All modals and buttons: dark variants
   - Use Tailwind dark: prefix

4. Create src/components/DarkModeToggle.vue:
   - Button to toggle dark mode
   - Icon: sun/moon
   - Place in header

5. Update Monaco/CodeMirror theme:
   - Switch editor theme based on dark mode
   - Light theme: 'vs'
   - Dark theme: 'vs-dark'

TDD Approach:
- Write tests/unit/composables/useDarkMode.test.ts FIRST
- Test initial load from localStorage
- Test toggle changes state and saves
- Test class application to document
- Write tests/unit/components/DarkModeToggle.test.ts
- Test button renders and toggles
- Write tests/e2e/darkMode.test.ts:
   * Toggle dark mode
   * Verify background colors change
   * Refresh and verify preference persists
- Then implement dark mode to pass tests

Success criteria: Dark mode works, persists, affects all components, tests pass
```

### Prompt 26: Status Bar Component

```
Create a status bar for displaying app state information.

Context: Add a status bar at the bottom of the app to show project name, validation errors, and save status.

Requirements:
1. Create src/components/StatusBar.vue:
   - Props:
     * projectName (string)
     * validationErrors (string[]) - array of error messages
     * lastSaved (number | null) - timestamp
     * saving (boolean)
   - Display sections:
     * Left: Project name
     * Center: Validation errors (red text) or "All valid" (green)
     * Right: Save status ("Saving...", "Saved 2m ago", "Unsaved changes")
   - Format lastSaved as relative time ("just now", "2m ago", "1h ago")

2. Styling:
   - Fixed at bottom of viewport
   - Small height (32px)
   - Subtle background
   - Dark mode support

TDD Approach:
- Write tests/unit/components/StatusBar.test.ts FIRST
- Test rendering with various prop combinations
- Test time formatting (mock Date.now())
- Test error display
- Test saving states
- Then implement StatusBar to pass tests

3. Update src/App.vue:
   - Add StatusBar at bottom
   - Pass appropriate props
   - Track saving state
   - Pass validation errors

Success criteria: Status bar displays correctly, updates in real-time, tests pass
```

### Prompt 27: Final Polish & E2E Testing

```
Complete the app with final polish, comprehensive E2E tests, and error boundaries.

Context: Finalize the app with production-ready features, full E2E test coverage, and edge case handling.

Requirements:
1. Error boundaries:
   - Create src/components/ErrorBoundary.vue
   - Catch component errors
   - Display friendly error message
   - Log to console
   - Wrap App.vue in ErrorBoundary

2. Loading states:
   - Add loading indicators for heavy operations:
     * Schema generation (if slow)
     * Export (if large)
   - Use skeleton loaders or spinners

3. Accessibility:
   - ARIA labels on all interactive elements
   - Keyboard navigation (Tab order)
   - Focus indicators
   - Screen reader announcements for status changes

4. Performance:
   - Verify debouncing is effective
   - Lazy load Monaco/CodeMirror if possible
   - Optimize re-renders

5. Comprehensive E2E tests:
   - Create tests/e2e/fullUserFlows.test.ts:
     * Complete flow: new user → create form → save → export
     * Complete flow: paste data → generate → edit → save → switch projects
     * Error handling: invalid JSON → see errors → revert
     * Dark mode: toggle → persist
     * Project management: create multiple → rename → delete → verify

6. Browser compatibility:
   - Test in Chrome, Firefox, Safari (if possible)
   - Verify localStorage works
   - Verify file downloads work

TDD Approach:
- Write comprehensive E2E tests FIRST covering all user flows
- Test error scenarios (network issues, quota exceeded)
- Test edge cases (very large JSON, deeply nested data)
- Verify pristine test output (no console errors)
- Then implement polish features to pass tests
- Run full test suite, ensure 100% pass rate

Success criteria: All E2E tests pass, app is production-ready, no console errors, excellent UX
```

---

## Summary

This plan provides 27 incremental prompts that build a complete form builder application using TDD principles. Each prompt:

1. **Builds on previous work** - No orphaned code
2. **Tests first** - TDD approach throughout
3. **Small scope** - Can be completed in one focused session
4. **Integrated** - Ends with wiring to existing code
5. **Validated** - Tests confirm functionality

The progression moves from foundation (storage, models) → core features (editors, preview) → advanced features (schema generation, project management) → polish (export, dark mode, status bar). Each step is independently testable and moves the project forward.

