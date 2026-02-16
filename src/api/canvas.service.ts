import { api } from "./api-handler";
import type { CanvasMeta } from "@/types/canvas-meta";
import type { CanvasElement } from "@/types/canvas/canvas-element";

export async function getCanvases(): Promise<CanvasMeta[]> {
  try {
    return await api<CanvasMeta[]>("/api/canvas", { method: "GET" });
  } catch {
    return getMockCanvases();
  }
}

export async function getCanvas(id: string): Promise<{ meta: CanvasMeta; elements: CanvasElement[] } | null> {
  try {
    return await api<{ meta: CanvasMeta; elements: CanvasElement[] }>(`/api/canvas/${id}`, { method: "GET" });
  } catch {
    return getMockCanvasById(id);
  }
}

export async function saveCanvas(
  id: string,
  meta: Partial<CanvasMeta>,
  elements: CanvasElement[],
): Promise<CanvasMeta> {
  try {
    const payload = { meta, elements };
    return await api<CanvasMeta>(`/api/canvas/${id}`, {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
  } catch {
    return { ...mockCanvasMeta(id, meta.name ?? "Untitled"), ...meta };
  }
}

export async function createCanvas(name: string): Promise<CanvasMeta> {
  try {
    return await api<CanvasMeta>("/api/canvas", {
      method: "POST",
      body: { name } as unknown as Record<string, unknown>,
    });
  } catch {
    const id = "c-" + Math.random().toString(36).slice(2, 11);
    return mockCanvasMeta(id, name);
  }
}

export async function deleteCanvas(id: string): Promise<void> {
  try {
    await api(`/api/canvas/${id}`, { method: "DELETE" });
  } catch {
    /* mock: no-op */
  }
}

function mockCanvasMeta(id: string, name: string): CanvasMeta {
  const now = new Date().toISOString();
  return {
    id,
    name,
    isFavorite: false,
    isPublic: false,
    updatedAt: now,
    createdAt: now,
    stats: { elementsCount: 0 },
  };
}

function getMockCanvases(): CanvasMeta[] {
  const now = new Date().toISOString();
  return [
    {
      id: "c-demo-1",
      name: "My First Board",
      isFavorite: true,
      isPublic: false,
      updatedAt: now,
      createdAt: now,
      previewImage: undefined,
      stats: { elementsCount: 4, lastOpenedAt: now },
    },
    {
      id: "c-demo-2",
      name: "Study Plan",
      isFavorite: false,
      isPublic: true,
      updatedAt: now,
      createdAt: now,
      stats: { elementsCount: 8 },
    },
    {
      id: "c-demo-3",
      name: "Career Goals",
      isFavorite: true,
      isPublic: false,
      updatedAt: now,
      createdAt: now,
      stats: { elementsCount: 6 },
    },
  ];
}

function getMockCanvasById(id: string): { meta: CanvasMeta; elements: CanvasElement[] } | null {
  const list = getMockCanvases();
  const meta = list.find((c) => c.id === id) ?? {
    ...mockCanvasMeta(id, "Untitled"),
    id,
  };
  return {
    meta: { ...meta, id },
    elements: [],
  };
}
