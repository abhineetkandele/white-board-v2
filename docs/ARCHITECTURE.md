# Architecture

This document explains the runtime architecture and major logic flow for White Board v2.

## Runtime Composition

- `src/main.tsx` mounts `App` inside `React.StrictMode`.
- `src/App.tsx` composes:
  - `ContextProvider` (global UI/tool state)
  - `TopPanel` (tool selection + download)
  - `SidePanel` (desktop only style controls)
  - `Board` (main drawing area)
- `Board` renders:
  - Main drawing canvas (`#board`) managed by `CanvasService`
  - Overlay canvas (`EditBoard`) in Selection mode
  - Undo/redo controls

## Core State Domains

### 1) UI Tool/Style State (React Context)

Source: `src/context.tsx`

Persisted in localStorage key: `state`

Fields:

- `type`: active tool
- `strokeStyle`, `fillStyle`
- `lineWidth`
- `strokePattern`
- `globalAlpha` (0-100 in context)
- `selectedElement` (selected element id)

Notes:

- Context initializes from localStorage if present.
- `selectedElement` is reset during initialization to avoid stale selection references.

### 2) Board Elements (localStorage)

Source: `src/services/StorageService.ts`

Persisted in localStorage key: `data`

Each entry is a `BoardElement` snapshot that stores geometry and style used for replay redraw.

### 3) Image Binary Data (IndexedDB)

Source: `src/services/IndexedDBService.ts`

Storage:

- Database: `white-board`
- Object store: `files`
- Primary key: `fileId`

Used for storing image Data URLs independently of element records.

### 4) Undo/Redo and Image Cache (In-memory)

Source: `src/services/HistoryService.ts`

In-memory structures:

- `history`: undo stack
- `redoStack`: redo stack
- `cache`: `Map<fileId, HTMLImageElement>` for faster image redraw

## Main Logic Flows

## A) Drawing Flow

Primary controller: `src/hooks/useBoard.ts`

1. Canvas setup

   - Initializes canvas/context via `CanvasService.createCanvas`.
   - Binds pointer handlers through `CanvasService.setHandlers`.
   - Opens IndexedDB.

2. Pointer down

   - Saves start coordinates and drawing snapshot state.
   - Branches by tool:
     - Text: creates overlay textarea (`createTextInput`) and commits on blur.
     - Eraser: removes element under pointer.
     - Image: enters image placement mode and later commits image element.
     - Shape/path tools: begins active drawing.

3. Pointer move

   - Updates current coordinates.
   - Draws preview by clearing/redrawing canvas and rendering active element.
   - For freehand path and line continuation, updates the latest stored element when needed.

4. Pointer up

   - Commits final element snapshot through `StorageService.storeElement`.
   - Clears temporary state.

5. Redraw
   - Uses `redrawCanvas` or `redrawAllElements` to repaint all persisted elements.

## B) Selection and Edit Flow

Primary controller: `src/hooks/useEditBoard.ts`

1. Hit testing

   - Detects element under pointer using geometry helpers.
   - Builds element-specific bounding rectangle and corner handles.

2. Selection state sync

   - Writes selected id to context.
   - Mirrors selected element style properties into context controls.

3. Drag/resize

   - Uses per-type transforms:
     - Generic shape transform
     - Image transform
     - Text transform
     - Path transform
   - Updates element geometry in storage during pointer movement.

4. Overlay rendering
   - Draws selection box and resize handles on overlay canvas.

## C) Undo/Redo Flow

Sources:

- `src/services/HistoryService.ts`
- `src/utils/undoRedo.ts`
- `src/services/StorageService.ts`

Behavior:

- Every stored element operation pushes an entry to history.
- Undo pops from history and applies reverse operation against persisted elements.
- Redo pops from redo stack and reapplies.
- Redraw runs after each undo/redo operation.

## D) Export Flow

Source: `src/components/TopPanel/TopPanel.tsx`

- User chooses download type (`png` or `webp`).
- Component fetches current canvas from `CanvasService`.
- Exports using `canvas.toDataURL()` and triggers a temporary anchor download.

## E) Responsive/Mobile Flow

Sources:

- `src/hooks/useMobile.ts`
- `src/App.tsx`
- `src/components/UndoRedo/UndoRedo.tsx`

Behavior:

- `useMobile` tracks viewport width `<= 768`.
- On mobile, persistent left side panel is hidden.
- Undo/redo area provides settings icon to toggle side panel overlay.

## Module Responsibilities

- `components/`: user interface composition and controls.
- `hooks/`: orchestration logic for drawing/edit interactions.
- `services/`: singleton-like resource and persistence boundaries.
- `drawing/`: pure rendering helpers.
- `utils/`: geometry and tactical helpers used by hooks/services.
- `config/`: declarative, render-driven panel configuration.
- `types/`: shared contracts across all layers.

## Important Invariants

- Every drawable element must carry enough geometry and style data for full redraw from storage.
- Context style values are the source of truth for new element creation.
- Selection overlay canvas does not replace the main canvas; it only visualizes and controls edits.
- Geometry hit-testing assumes valid element structures and path arrays.

## Known Constraints

- localStorage and IndexedDB parse/write errors are minimally handled.
- Persistence data schemas are not versioned.
- Undo/redo granularity is snapshot-driven and can feel coarse for some edit sessions.
- Keyboard accessibility for some icon controls is incomplete.
