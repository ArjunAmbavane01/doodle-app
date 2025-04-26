export const cleanupTextArea = () => {
  const existingTextarea = document.querySelector(".canvas-text-input");
  if (existingTextarea) existingTextarea.remove();
};

export const createTextArea = (e: MouseEvent | TouchEvent, canvasX: number, canvasY: number, fontSize: number, fontFamily:string, textColor:string, textStyle:{ bold: boolean, italic: boolean }) => {

  
  const clientX = (e instanceof TouchEvent) ? e.touches[0]?.clientX as number : e.clientX;
  const clientY = (e instanceof TouchEvent) ? e.touches[0]?.clientY as number : e.clientY;

  const textAreaElem = document.createElement("textarea");
  const fontStyle = textStyle.italic ? "italic" : "normal";
  const fontWeight = textStyle.bold ? "bold" : "normal";

  textAreaElem.className = "canvas-text-input";
  textAreaElem.style.position = "absolute";
  textAreaElem.style.top = `${clientY}px`;
  textAreaElem.style.left = `${clientX}px`;
  textAreaElem.style.fontSize = `${fontSize}px`;
  textAreaElem.style.fontWeight = fontWeight;
  textAreaElem.style.fontStyle = fontStyle; 
  textAreaElem.style.fontFamily = fontFamily;
  textAreaElem.style.color = textColor;
  textAreaElem.style.minWidth = "100px";
  textAreaElem.style.minHeight = "30px";
  textAreaElem.style.letterSpacing = "1px";
  textAreaElem.style.background = "transparent";
  textAreaElem.style.border = "none";
  textAreaElem.style.outline = "none";
  textAreaElem.style.resize = "none";
  textAreaElem.style.overflow = "hidden";
  textAreaElem.style.zIndex = "1000";
  textAreaElem.style.whiteSpace = "pre";

  textAreaElem.dataset.canvasX = canvasX.toString();
  textAreaElem.dataset.canvasY = canvasY.toString();

  const adjustSize = () => {
    textAreaElem.style.height = "auto";
    textAreaElem.style.width = "auto";
    textAreaElem.style.height = `${textAreaElem.scrollHeight}px`;
    textAreaElem.style.width = `${textAreaElem.scrollWidth}px`;
  };

  textAreaElem.addEventListener("input", adjustSize);
  adjustSize();
  
  return textAreaElem;
};