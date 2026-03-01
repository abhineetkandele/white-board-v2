export const TOOLS = {
  SELECTION: "Selection",
  RECTANGLE: "Rectangle",
  CIRCLE: "Circle",
  DIAMOND: "Diamond",
  TRIANGLE: "Triangle",
  LINE: "Line",
  ARROW: "Arrow",
  ADD_TEXT: "Add Text",
  PENCIL: "Pencil",
  ERASER: "Eraser",
  ADD_IMAGE: "Add Image",
  DOWNLOAD: "Download",
  CLEAR: "Clear",
} as const;

export type ToolName = (typeof TOOLS)[keyof typeof TOOLS];
