# Code Reference

This file documents all source files under `src/` with purpose, key logic, and interactions.

## Root Files

### `src/main.tsx`

- Purpose: Application bootstrap.
- Key logic:
  - Creates React root and renders `App` under `React.StrictMode`.
- Interactions:
  - Imports global styles from `index.css`.

### `src/App.tsx`

- Purpose: Top-level app composition.
- Key logic:
  - Uses `useMobile` to detect small screens.
  - Wraps app in `ContextProvider`.
  - Renders `TopPanel`, desktop `SidePanel`, and `Board`.
- Interactions:
  - Integrates all major UI areas.

### `src/context.tsx`

- Purpose: Global state store for active tool and style settings.
- Exports:
  - `AppContext`
  - `ContextProvider`
- Key logic:
  - Defines `DEFAULT_STATE`.
  - Initializes state from localStorage key `state`.
  - Provides `updateState` for partial updates.
  - Provides `resetState` to restore defaults.
  - Persists state back to localStorage on change.
- Data model:
  - Uses `StateType` from `types`.
- Notes:
  - No schema validation on persisted state.

### `src/App.css`

- Purpose: Component-level visual styling.
- Key logic:
  - Defines panel layout, tool states, canvas layering, mobile adaptations, and control styles.

### `src/index.css`

- Purpose: Global base styles and reset.
- Key logic:
  - Sets root typography, body layout, full-height canvas host sizing, and custom scrollbar styles.

### `src/vite-env.d.ts`

- Purpose: Vite ambient type reference.

## Assets

These SVG files are icon resources used by toolbar and control components.

### `src/assets/arrow.svg`

- Purpose: Arrow tool icon.

### `src/assets/circle.svg`

- Purpose: Circle tool icon.

### `src/assets/diamond.svg`

- Purpose: Diamond tool icon.

### `src/assets/download.svg`

- Purpose: Download/export action icon.

### `src/assets/eraser.svg`

- Purpose: Eraser tool icon.

### `src/assets/image-plus.svg`

- Purpose: Image insertion tool icon.

### `src/assets/line-dashed.svg`

- Purpose: Dashed stroke-pattern option icon in side panel selectors.

### `src/assets/line-dotted.svg`

- Purpose: Dotted stroke-pattern option icon in side panel selectors.

### `src/assets/line.svg`

- Purpose: Line tool icon.

### `src/assets/pencil.svg`

- Purpose: Pencil/freehand tool icon.

### `src/assets/rectangle.svg`

- Purpose: Rectangle tool icon.

### `src/assets/redo.svg`

- Purpose: Redo action icon.

### `src/assets/selection.svg`

- Purpose: Selection/edit tool icon.

### `src/assets/settings.svg`

- Purpose: Mobile settings icon used to reveal side panel controls.

### `src/assets/text.svg`

- Purpose: Text tool icon.

### `src/assets/trash.svg`

- Purpose: Clear canvas action icon.

### `src/assets/triangle.svg`

- Purpose: Triangle tool icon.

### `src/assets/undo.svg`

- Purpose: Undo action icon.

## Components

## `src/components/Board`

### `src/components/Board/Board.tsx`

- Purpose: Main board container.
- Key logic:
  - Calls `useBoard` for drawing lifecycle.
  - Conditionally mounts `EditBoard` when tool is `Selection`.
  - Always mounts `UndoRedo` controls.
- Interactions:
  - Reads active tool from context.

### `src/components/Board/EditBoard.tsx`

- Purpose: Overlay canvas for selection/edit interactions.
- Key logic:
  - Uses `useEditBoard` for hit test, drag, and resize behavior.
  - Binds pointer handlers to overlay canvas.
- Interactions:
  - Receives `handleResize` callback from `useBoard` for redraw sync.

### `src/components/Board/index.ts`

- Purpose: Barrel export for `Board`.

## `src/components/TopPanel`

### `src/components/TopPanel/TopPanel.tsx`

- Purpose: Tool picker and export actions.
- Key logic:
  - Iterates `topPanelIcons` config to render tool buttons and separators.
  - Updates active tool in context on click.
  - Special handling for `Download`: reveals format options and exports canvas as Data URL.
- Interactions:
  - Uses `CanvasService.getCanvas()` for export.
  - Uses tool constants and config entries.

### `src/components/TopPanel/index.ts`

- Purpose: Barrel export for `TopPanel`.

## `src/components/SidePanel`

### `src/components/SidePanel/SidePanel.tsx`

- Purpose: Dynamic style control panel.
- Key logic:
  - Uses `sidePanelConfig` to render control sections.
  - Determines active tool context using selected element (if any).
  - Skips controls based on `excludedOptions` per tool.
- Interactions:
  - Reads selected element from storage.
  - Renders `Selector`, `Range`, and `Toggle` by section type.

### `src/components/SidePanel/Selector.tsx`

- Purpose: Option selector for colors and stroke patterns.
- Key logic:
  - Syncs control value from selected element if present.
  - Handles color swatches and native color input.
  - Maps between UI option and state field id.
- Interactions:
  - Uses `LINE_DASH_REVERSE` and `COLOR_PICKER` constants.
  - Updates context via `updateState`.

### `src/components/SidePanel/Range.tsx`

- Purpose: Slider control for numeric properties.
- Key logic:
  - Supports `lineWidth` and `globalAlpha` update.
  - Converts selected element alpha ratio to 0-100 slider representation.
- Interactions:
  - Reads selected element from `StorageService`.

### `src/components/SidePanel/Toggle.tsx`

- Purpose: Generic boolean toggle control.
- Key logic:
  - Flips a context field by id.
- Notes:
  - Utility component exists even if current side panel config does not define toggle sections.

### `src/components/SidePanel/index.ts`

- Purpose: Barrel export for `SidePanel`.

## `src/components/UndoRedo`

### `src/components/UndoRedo/UndoRedo.tsx`

- Purpose: Undo/redo controls and mobile settings shortcut.
- Key logic:
  - Calls `handleUndo` and `handleRedo` utilities.
  - Shows settings button on mobile to toggle side panel overlay.
- Interactions:
  - Uses `useMobile` and `SidePanel`.

### `src/components/UndoRedo/index.ts`

- Purpose: Barrel export for `UndoRedo`.

## Config

### `src/config/topPanel.ts`

- Purpose: Declarative top toolbar definition.
- Exports:
  - `PanelIcon` type
  - `topPanelIcons`
- Key logic:
  - Lists tool icons and separators in visual order.

### `src/config/sidePanel.ts`

- Purpose: Declarative side panel sections.
- Exports:
  - `SidePanelSection` type
  - `sidePanelConfig`
- Key logic:
  - Defines section ids, renderer type (`selector`, `range`, `toggle`), options/min/max, and per-tool exclusions.

### `src/config/index.ts`

- Purpose: Barrel exports for config modules.

## Constants

### `src/constants/tools.ts`

- Purpose: Canonical tool names.
- Exports:
  - `TOOLS` object
  - `ToolName` union type

### `src/constants/styles.ts`

- Purpose: Style constants and stroke pattern mappings.
- Exports:
  - `TRANSPARENT`
  - `COLOR_PICKER`
  - `LINE_DASH`
  - `LINE_DASH_REVERSE`

### `src/constants/index.ts`

- Purpose: Barrel exports for constants.

## Drawing

### `src/drawing/shapes.ts`

- Purpose: Primitive draw functions for geometric tools.
- Exports:
  - `drawRectangle`
  - `drawCircle`
  - `drawDiamond`
  - `drawTriangle`
  - `drawArrow`
  - `fillAndStroke`
- Key logic:
  - Uses canvas context paths and fill/stroke operations per shape.

### `src/drawing/text.ts`

- Purpose: Text draw and text input workflow.
- Exports:
  - `drawText`
  - `createTextInput`
- Key logic:
  - Draws multiline text on canvas.
  - Creates transient textarea input on the page for text editing.
  - Commits text and removes textarea on blur.

### `src/drawing/redraw.ts`

- Purpose: Full-canvas reconstruction from persisted element list.
- Exports:
  - `redrawAllElements`
  - `redrawCanvas`
- Key logic:
  - Resets/clears canvas and reapplies viewport transform.
  - Redraws each element by type in world coordinates.
  - Handles image redraw via in-memory cache and IndexedDB fallback.
- Interactions:
  - Uses `CanvasService`, `StorageService`, `HistoryService`, `IndexedDBService`, and drawing primitives.

### `src/drawing/index.ts`

- Purpose: Barrel exports for drawing modules.

## Hooks

### `src/hooks/useMobile.ts`

- Purpose: Responsive width detector.
- Exports:
  - default `useMobile`
- Key logic:
  - Maintains boolean `window.innerWidth <= 768`.
  - Subscribes to resize events.

### `src/hooks/useBoard.ts`

- Purpose: Main drawing orchestration hook.
- Exports:
  - `useBoard`
- Key logic:
  - Initializes main canvas and event handlers.
  - Processes tool-specific pointer down/move/up behavior.
  - Supports viewport navigation:
    - Wheel pan
    - `Ctrl/Cmd + wheel` zoom-at-cursor
    - Drag-pan via middle/right click or `Shift + drag`
  - Handles text creation workflow.
  - Handles image file load, placement preview, and commit.
  - Persists elements through `StorageService`.
  - Handles clear/reset flow and viewport resize redraw.
  - Syncs selected element style updates.
- Interactions:
  - Depends on context state, drawing utilities, storage/history/indexedDB services, and geometry helpers.

### `src/hooks/useEditBoard.ts`

- Purpose: Selection, drag, and resize orchestration.
- Exports:
  - `useEditBoard`
- File-local transform helpers:
  - `applyShapeTransform`
  - `applyImageTransform`
  - `applyTextTransform`
  - `applyPathTransform`
- Key logic:
  - Detects target element on overlay pointer down.
  - Computes bounding rect + resize corner hit.
  - Applies per-element-type transform during pointer move.
  - Supports pan/zoom interactions directly on overlay canvas in Selection mode.
  - Updates storage and redraws board.
  - Draws selection rectangle/handles.

## Services

### `src/services/CanvasService.ts`

- Purpose: Main canvas singleton manager.
- Exports:
  - `CanvasService`
- Key logic:
  - Creates canvas and 2D context.
  - Manages DPI scaling with device pixel ratio.
  - Stores viewport camera state (`scale`, `offsetX`, `offsetY`).
  - Exposes world/screen coordinate conversion helpers.
  - Applies viewport transform and supports pan/zoom operations.
  - Stores and exposes static canvas/context references.
  - Registers pointer + wheel handlers.

### `src/services/StorageService.ts`

- Purpose: Persist and manage board elements in localStorage.
- Exports:
  - `StorageService`
- Key logic:
  - `getData`, `setData`, `clearData` wrappers.
  - `storeElement` to append/update last element with style snapshot.
  - Pushes history entries for undo/redo.

### `src/services/HistoryService.ts`

- Purpose: In-memory history and image cache service.
- Exports:
  - `HistoryService`
- Key logic:
  - Stack operations for history and redo.
  - Cache set/get for loaded images by file id.

### `src/services/IndexedDBService.ts`

- Purpose: Browser IndexedDB wrapper for image persistence.
- Exports:
  - `IndexedDBService`
- Key logic:
  - Opens database and creates object store on upgrade.
  - Saves file records by id.
  - Reads file records by id.

### `src/services/index.ts`

- Purpose: Barrel exports for services.

## Types

### `src/types/index.ts`

- Purpose: Shared type contracts.
- Includes:
  - UI/context types (`StateType`, `Store`, `StrokePattern`)
  - Geometry/edit types (`Coordinates`, `ResizeCorner`, `CornerHit`, `BoundingRect`, `RectPointsTuple`)
  - Data types (`BoardElement`)
  - Side panel config/rendering types (`ConfigRootType`, `ConfigObjType`, `ConfigType`, `PropsType`, `SectionType`, `RangeOptions`, `SelectorOptions`)

## Utilities

### `src/utils/coordinates.ts`

- Purpose: Coordinate and color helper functions.
- Exports:
  - `getPointerCoords`
  - `hex2rgb`
- Key logic:
  - Converts pointer events to world or screen coordinates.
  - Uses current viewport transform for world-space conversion.
  - Converts hex color string to RGB components.

### `src/utils/editHelpers.ts`

- Purpose: Overlay edit-canvas utility functions.
- Exports:
  - `recreateEditContext`
  - `drawSelectionBox`
- Key logic:
  - Recreates overlay canvas context dimensions/scaling.
  - Applies shared viewport transform so overlay alignment matches main canvas.
  - Draws selection rectangle and corner handles.

### `src/utils/eraser.ts`

- Purpose: Eraser behavior for element removal.
- Exports:
  - `handleEraser`
- Key logic:
  - Hit-tests target element at pointer location.
  - Removes element from storage.
  - Pushes to history and redraws board.

### `src/utils/file.ts`

- Purpose: File and image helpers.
- Exports:
  - `generateFileId`
  - `loadImage`
- Key logic:
  - Generates deterministic-ish file id (SHA-1 when available).
  - Reads file as Data URL and loads image metadata.

### `src/utils/geometry.ts`

- Purpose: Geometry, hit-testing, and corner detection.
- Exports include:
  - Distance/boundary checks (`distance`, `isPointOnLine`, `isPointOnShapeBoundary`)
  - Polygon/ellipse checks (`isPointInsidePolygon`, `isPointInsideEllipse`, `isPointOnEllipseBorder`)
  - Shape/path closure checks (`isClosedLine`, `isClosedPolygon`, `hasFilledInterior`)
  - Bounding and detection (`createBoundingRect`, `detectElementAtPoint`)
  - Corner picking (`getCornerAtPoint`, `getReverseTriangleCornerAtPoint`, `getArrowCornerAtPoint`)

### `src/utils/undoRedo.ts`

- Purpose: Apply undo and redo operations to stored data.
- Exports:
  - `handleUndo`
  - `handleRedo`
- Key logic:
  - Pops history/redo entries.
  - Replaces or removes element snapshots by id.
  - Triggers full redraw after each operation.

### `src/utils/index.ts`

- Purpose: Barrel exports for utilities.

## Cross-Cutting Behavior

### Tool and config coupling

- Toolbar and side panel behavior is config-driven via `config/topPanel.ts` and `config/sidePanel.ts`.
- Runtime behavior still lives in hooks; config controls visibility and rendering of controls.

### Persistence and replay

- All visual output is reconstructed from persisted element snapshots.
- Style values must be captured on element creation/update to guarantee deterministic redraw.

### Selection semantics

- Selection stores active element id in context.
- Side panel controls can reflect/edit selected element values.

## Known Risks and Limitations (from current implementation)

- localStorage parse/write errors are minimally guarded.
- IndexedDB duplicate key/error paths are not fully managed.
- Undo/redo behavior can depend heavily on snapshot frequency.
- Accessibility for icon-only controls is not fully keyboard-complete.
- Persisted schema has no versioning/migration strategy.
