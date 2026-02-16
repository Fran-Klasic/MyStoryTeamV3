import { ref } from "vue";
import type {
  CanvasElement,
  ID,
  Connection,
} from "@/types/canvas/canvas-element";
import type { Vector2Int } from "@/types/canvas/vector2int";
import type { Vector3Int } from "@/types/canvas/vector3int";

/** Element position.x and position.y are in canvas space (0..CANVAS_WIDTH, 0..CANVAS_HEIGHT). They do not depend on viewport pan/zoom; saving them persists the position on the canvas. */
const MIN_WIDTH = 140;
const MIN_HEIGHT = 80;
const MAX_WIDTH = 480;
const MAX_HEIGHT = 320;
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2000;

function clampSize(size: Vector2Int): Vector2Int {
  return {
    x: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, size.x)),
    y: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, size.y)),
  };
}

export function useCanvasElements(initial: CanvasElement[]) {
  const elements = ref<CanvasElement[]>([...initial]);

  function updateElement(id: ID, patch: Partial<CanvasElement>) {
    elements.value = elements.value.map((el) =>
      el.id === id ? ({ ...el, ...patch } as CanvasElement) : el,
    );
  }

  function updatePosition(id: ID, position: Vector3Int) {
    updateElement(id, { position } as Partial<CanvasElement>);
  }

  function updateSize(id: ID, size: Vector2Int) {
    updateElement(id, { size: clampSize(size) } as Partial<CanvasElement>);
  }

  function updateText(id: ID, text: string) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id) return el;
      if (el.type === "Text") return { ...el, data: text } as CanvasElement;
      return el;
    });
  }

  function updateList(id: ID, listData: string[]) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "List") return el;
      return { ...el, data: { listData } } as CanvasElement;
    });
  }

  function updateTask(id: ID, data: string, checked: boolean) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "Task") return el;
      return { ...el, data: { data, checked } } as CanvasElement;
    });
  }

  function updateImage(id: ID, base64File: string) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "Image") return el;
      return { ...el, data: { base64File } } as CanvasElement;
    });
  }

  function updateAudio(id: ID, base64File: string) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "Audio") return el;
      return { ...el, data: { base64File } } as CanvasElement;
    });
  }

  function updateVideo(id: ID, url: string) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "Video") return el;
      return { ...el, data: { url } } as CanvasElement;
    });
  }

  function updateDate(id: ID, date: string, data: string) {
    elements.value = elements.value.map((el) => {
      if (el.id !== id || el.type !== "Date") return el;
      return { ...el, data: { date, data } } as CanvasElement;
    });
  }

  function removeElement(id: ID) {
    elements.value = elements.value
      .filter((el) => el.id !== id)
      .map((el) => ({
        ...el,
        connections: el.connections.filter((c) => c.self !== id && c.target !== id),
      }));
  }

  function addConnection(self: ID, target: ID) {
    if (self === target) return;

    elements.value = elements.value.map((el) => {
      if (el.id !== self) return el;
      const existing = el.connections.some(
        (c: Connection) => c.self === self && c.target === target,
      );
      if (existing) return el;
      return {
        ...el,
        connections: [...el.connections, { self, target }],
      };
    });
  }

  function addElement(type: CanvasElement["type"], x: number, y: number) {
    const baseSize: Vector2Int = { x: 220, y: 100 };
    const size = clampSize(baseSize);
    const clampedX = Math.min(CANVAS_WIDTH - size.x, Math.max(0, x - size.x / 2));
    const clampedY = Math.min(CANVAS_HEIGHT - size.y, Math.max(0, y - size.y / 2));

    const id: ID = `el_${Math.random().toString(36).slice(2, 9)}`;
    const base = {
      id,
      position: { x: clampedX, y: clampedY, z: 0 } as Vector3Int,
      size,
      connections: [] as Connection[],
    };

    let element: CanvasElement;
    switch (type) {
      case "Text":
        element = { ...base, type: "Text", data: "New note" } as CanvasElement;
        break;
      case "List":
        element = { ...base, type: "List", data: { listData: ["Item 1", "Item 2"] } } as CanvasElement;
        break;
      case "Task":
        element = { ...base, type: "Task", data: { data: "New task", checked: false } } as CanvasElement;
        break;
      case "Image":
        element = { ...base, type: "Image", data: { base64File: "" } } as CanvasElement;
        break;
      case "Audio":
        element = { ...base, type: "Audio", data: { base64File: "" } } as CanvasElement;
        break;
      case "Video":
        element = { ...base, type: "Video", data: { url: "" } } as CanvasElement;
        break;
      case "Date":
        element = {
          ...base,
          type: "Date",
          data: { date: new Date().toISOString().slice(0, 10), data: "Goal" },
        } as CanvasElement;
        break;
      default:
        element = { ...base, type: "Text", data: "New note" } as CanvasElement;
    }

    elements.value = [...elements.value, element];
  }

  return {
    elements,
    updateElement,
    updatePosition,
    updateSize,
    updateText,
    updateList,
    updateTask,
    updateImage,
    updateAudio,
    updateVideo,
    updateDate,
    removeElement,
    addConnection,
    addElement,
  };
}

