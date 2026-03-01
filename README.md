# White Board v2

White Board v2 is a browser-based drawing canvas built with React, TypeScript, and Vite. It supports shape drawing, freehand paths, text, image placement, selection/editing, and local persistence with undo/redo.

## Features

- Drawing tools: Pencil, Line, Rectangle, Circle, Triangle, Diamond, Arrow, Eraser, Selection, Text, Image, and Clear.
- Style controls: Stroke color, fill color, stroke pattern, line width, and opacity.
- Editing: Select elements, drag, and resize with shape-specific transform logic.
- Infinite-style canvas navigation:
  - Pan with mouse/trackpad scroll.
  - Zoom with `Ctrl/Cmd + wheel` around cursor.
  - Drag-pan with middle-click, right-click, or `Shift + drag`.
- Export: Download canvas as PNG or WEBP.
- Persistence:
  - UI state in localStorage (`state` key).
  - Board elements in localStorage (`data` key).
  - Image binaries in IndexedDB (`white-board` database, `files` object store).
- Undo/redo for drawing changes.

## Documentation

- Architecture and runtime flow: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Complete code reference (all files in `src/`): [docs/CODE_REFERENCE.md](docs/CODE_REFERENCE.md)

## Tech Stack

- React 18
- TypeScript 5
- Vite 4
- IndexedDB + localStorage for browser-side persistence

## Development

Prerequisites:

- Node.js 18+
- npm 9+

Install and run:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Canvas Navigation Controls

- `Wheel` / trackpad scroll: pan the canvas viewport.
- `Ctrl/Cmd + Wheel`: zoom in/out centered at pointer position.
- `Middle-click drag`, `Right-click drag`, or `Shift + Left-drag`: pan by dragging.

## Project Structure

```text
src/
   components/    # UI components (board, panels, undo/redo controls)
   config/        # Declarative tool and side panel configuration
   constants/     # Tool names and style constants
   drawing/       # Pure drawing + redraw pipeline
   hooks/         # Controller hooks for board and selection logic
   services/      # Canvas, storage, history, and IndexedDB services
   types/         # Shared type contracts
   utils/         # Geometry, coordinate, eraser, file, and undo/redo helpers
```

## Current Limitations

- Persistence schemas are not versioned/migrated.
- IndexedDB and localStorage error handling is minimal.
- Keyboard accessibility is partial for icon-only controls.
- No backend or collaboration support.
