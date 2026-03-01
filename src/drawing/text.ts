const FONT_FAMILY = "LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif";

/**
 * Renders text lines onto the canvas.
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: string,
  textArea: HTMLTextAreaElement | null,
  lineWidth: number,
  strokeStyle: string,
): void => {
  textArea?.remove();

  if (!value) return;

  ctx.font = `${lineWidth * 6}px ${FONT_FAMILY}`;
  ctx.fillStyle = strokeStyle;

  const lines = value.split("\n");
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineWidth * 5);
  }
};

/**
 * Creates an inline textarea for text input, then draws the text
 * to the canvas and invokes the callback on blur.
 */
export const createTextInput = (
  xCoord: number,
  yCoord: number,
  lineWidth: number,
  globalAlpha: number,
  strokeStyle: string,
  ctx: CanvasRenderingContext2D,
  onComplete: (text: string, width: number, height: number) => void,
): void => {
  const textArea = document.createElement("textarea");
  let taHeight = 20;
  let taWidth = 20;

  textArea.wrap = "off";
  textArea.dir = "auto";
  textArea.tabIndex = 0;
  textArea.setAttribute(
    "style",
    `
    position: absolute;
    background: transparent;
    left: ${xCoord}px;
    top: ${yCoord}px;
    opacity: ${globalAlpha / 100};
    color: ${strokeStyle};
    font-size: ${lineWidth * 6}px;
    height: ${lineWidth * 6}px;
    line-height: 0.85;
    max-width: ${window.innerWidth - xCoord}px;
    white-space: pre;
    margin: 0px;
    padding: 0px;
    border: none;
    outline: none;
    resize: none;
    overflow: hidden;
    word-break: normal;
    width: 20px;
    backface-visibility: hidden;
    overflow-wrap: break-word;
    font-family: ${FONT_FAMILY};
    box-sizing: content-box;
    `,
  );

  textArea.oninput = () => {
    taWidth = textArea.scrollWidth;
    taHeight = textArea.scrollHeight;
    textArea.style.width = `${textArea.scrollWidth}px`;
    textArea.style.height = `${textArea.scrollHeight}px`;
  };

  textArea.onblur = (e) => {
    const value = (e.target as HTMLTextAreaElement).value;
    drawText(ctx, xCoord, yCoord + lineWidth * 4.75, value, textArea, lineWidth, strokeStyle);
    onComplete(value, taWidth, taHeight);
  };

  document.body.appendChild(textArea);
  setTimeout(() => textArea.focus(), 0);
};
