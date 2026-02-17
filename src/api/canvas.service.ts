import { API_BASE_URL } from "@/config/api";
import { api, getAccessToken } from "./api-handler";
import type { CanvasMeta } from "@/types/canvas-meta";
import type { CanvasElement, Connection } from "@/types/canvas/canvas-element";

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isGuid(s: string): boolean {
  return GUID_REGEX.test(s);
}

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Normalize backend element (PascalCase or mixed) to frontend CanvasElement shape. */
function normalizeCanvasElement(raw: unknown): CanvasElement | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = (o.id ?? o.Id) != null ? String(o.id ?? o.Id) : null;
  const type = (o.type ?? o.Type) as string | undefined;
  if (!id || !type) return null;

  const pos = (o.position ?? o.Position) as Record<string, number> | undefined;
  const px = pos?.x ?? pos?.X ?? 0;
  const py = pos?.y ?? pos?.Y ?? 0;
  const pz = pos?.z ?? pos?.Z ?? 0;

  const sz = (o.size ?? o.Size) as Record<string, number> | undefined;
  const sx = sz?.x ?? sz?.X ?? 220;
  const sy = sz?.y ?? sz?.Y ?? 100;

  const connRaw = (o.connections ?? o.Connections) as Array<{ self?: string; target?: string; Self?: string; Target?: string }> | undefined;
  const connections: Connection[] = Array.isArray(connRaw)
    ? connRaw.map((c) => ({
        self: String(c.self ?? c.Self ?? ""),
        target: String(c.target ?? c.Target ?? ""),
      })).filter((c) => c.self && c.target)
    : [];

  const data = o.data ?? o.Data;
  const position = { x: px, y: py, z: pz };
  const size = { x: sx, y: sy };

  switch (type) {
    case "Text":
      return { id, type: "Text", data: typeof data === "string" ? data : "New note", position, size, connections } as CanvasElement;
    case "List":
      const listData = data && typeof data === "object" && "listData" in data
        ? (data as { listData?: string[] }).listData
        : (data as { ListData?: string[] })?.ListData;
      return { id, type: "List", data: { listData: Array.isArray(listData) ? listData : ["Item 1"] }, position, size, connections } as CanvasElement;
    case "Task":
      const t = data && typeof data === "object" ? data as { data?: string; checked?: boolean; Data?: string; Checked?: boolean } : {};
      return { id, type: "Task", data: { data: t.data ?? t.Data ?? "New task", checked: !!(t.checked ?? t.Checked ?? false) }, position, size, connections } as CanvasElement;
    case "Image":
      const img = data && typeof data === "object" ? data as { base64File?: string; Base64File?: string } : {};
      return { id, type: "Image", data: { base64File: img.base64File ?? img.Base64File ?? "" }, position, size, connections } as CanvasElement;
    case "Audio":
      const aud = data && typeof data === "object" ? data as { base64File?: string; Base64File?: string } : {};
      return { id, type: "Audio", data: { base64File: aud.base64File ?? aud.Base64File ?? "" }, position, size, connections } as CanvasElement;
    case "Video":
      const v = data && typeof data === "object" ? data as { url?: string; Url?: string } : {};
      return { id, type: "Video", data: { url: v.url ?? v.Url ?? "" }, position, size, connections } as CanvasElement;
    case "Date":
      const d = data && typeof data === "object" ? data as { date?: string; data?: string; Date?: string; Data?: string } : {};
      return { id, type: "Date", data: { date: d.date ?? d.Date ?? new Date().toISOString().slice(0, 10), data: d.data ?? d.Data ?? "Goal" }, position, size, connections } as CanvasElement;
    default:
      return { id, type: "Text", data: typeof data === "string" ? data : "New note", position, size, connections } as CanvasElement;
  }
}

/** Map frontend elements to backend shape: all ids and connection refs must be GUIDs. */
function elementsToBackendElements(elements: CanvasElement[]): unknown[] {
  const idMap = new Map<string, string>();
  for (const el of elements) {
    idMap.set(el.id, isGuid(el.id) ? el.id : uuidv4());
  }
  return elements.map((el) => {
    const newId = idMap.get(el.id) ?? uuidv4();
    const connections: Connection[] = (el.connections ?? []).map((c) => ({
      self: idMap.get(c.self) ?? c.self,
      target: idMap.get(c.target) ?? c.target,
    }));
    return { ...el, id: newId, connections };
  });
}

// Backend DTOs (shapes inferred from ASP.NET code + JSON camel/pascal casing)
type BackendCanvasSummary = {
  ID_Canvas?: number;
  iD_Canvas?: number;
  ID_User?: number;
  iD_User?: number;
  Canvas_Name?: string | null;
  canvas_Name?: string | null;
  Created_At?: string;
  created_At?: string;
  Updated_At?: string;
  updated_At?: string;
  Visibility?: boolean;
  visibility?: boolean;
  Favorite?: boolean;
  favorite?: boolean;
  Background_Image?: string | null;
  background_Image?: string | null;
  Background_Color?: string | null;
  background_Color?: string | null;
};

type BackendCanvasDetails = {
  ID_Canvas?: number;
  iD_Canvas?: number;
  ID_User?: number;
  iD_User?: number;
  Canvas_Name?: string | null;
  canvas_Name?: string | null;
  Created_At?: string;
  created_At?: string;
  Updated_At?: string;
  updated_At?: string;
  Visibility?: boolean;
  visibility?: boolean;
  Favorite?: boolean;
  favorite?: boolean;
  Background_Image?: string | null;
  background_Image?: string | null;
  Background_Color?: string | null;
  background_Color?: string | null;
  /** Backend may send canvas data as JSON string or object */
  Canvas_Data?:
    | string
    | {
        Version?: string;
        ExportedAt?: string;
        Elements?: unknown[];
        elements?: unknown[];
      }
    | null;
  canvas_Data?:
    | string
    | {
        Version?: string;
        ExportedAt?: string;
        Elements?: unknown[];
        elements?: unknown[];
      }
    | null;
  /** Parsed canvas data when backend provides it (e.g. camelCase elements) */
  canvasDataDetails?: {
    version?: string;
    exportedAt?: string;
    elements?: unknown[];
  };
};

export async function getCanvases(): Promise<CanvasMeta[]> {
  try {
    const backend = await api<BackendCanvasSummary[]>("/api/auth/canvas", {
      method: "GET",
    });
    return backend.map(mapBackendSummaryToMeta);
  } catch {
    return getMockCanvases();
  }
}

/** Map backend summary to CanvasMeta (shared by getCanvases and getPublicCanvases). */
function mapBackendSummaryToMeta(c: BackendCanvasSummary): CanvasMeta {
  const id = c.ID_Canvas ?? c.iD_Canvas;
  const ownerId = c.ID_User ?? c.iD_User;
  const name = (c.Canvas_Name ?? c.canvas_Name) || "Untitled";
  const createdAt = c.Created_At ?? c.created_At ?? new Date().toISOString();
  const updatedAt = c.Updated_At ?? c.updated_At ?? createdAt;
  const isPublic = c.Visibility ?? c.visibility ?? false;
  const isFavorite = c.Favorite ?? c.favorite ?? false;
  const bgImageRaw = c.Background_Image ?? c.background_Image ?? undefined;
  const bgColorRaw = c.Background_Color ?? c.background_Color ?? undefined;
  const bgImage =
    typeof bgImageRaw === "string" && bgImageRaw.trim().length === 0
      ? undefined
      : bgImageRaw ?? undefined;
  const bgColor =
    typeof bgColorRaw === "string" && bgColorRaw.trim().length === 0
      ? undefined
      : bgColorRaw ?? undefined;
  return {
    id: String(id),
    name,
    owner: ownerId != null ? String(ownerId) : undefined,
    isFavorite: !!isFavorite,
    isPublic: !!isPublic,
    createdAt,
    updatedAt,
    previewImage: bgImage,
    backgroundColor: bgColor,
    stats: { elementsCount: undefined, lastOpenedAt: undefined },
  } as CanvasMeta;
}

export async function getPublicCanvases(): Promise<CanvasMeta[]> {
  try {
    const backend = await api<BackendCanvasSummary[]>("/api/auth/canvas/public", {
      method: "GET",
    });
    return backend.map(mapBackendSummaryToMeta);
  } catch {
    return [];
  }
}

export async function getCanvas(
  id: string,
): Promise<{ meta: CanvasMeta; elements: CanvasElement[] } | null> {
  try {
    const backend = await api<BackendCanvasDetails>(`/api/auth/canvas/${id}`, {
      method: "GET",
    });

    const backendId = backend.ID_Canvas ?? backend.iD_Canvas ?? Number(id);
    const ownerId = backend.ID_User ?? backend.iD_User;
    const name = (backend.Canvas_Name ?? backend.canvas_Name) || "Untitled";
    const createdAt = backend.Created_At ?? backend.created_At ?? new Date().toISOString();
    const updatedAt =
      backend.Updated_At ?? backend.updated_At ?? createdAt;
    const isPublic = backend.Visibility ?? backend.visibility ?? false;
    const isFavorite = backend.Favorite ?? backend.favorite ?? false;

    const bgImageRaw = backend.Background_Image ?? backend.background_Image ?? undefined;
    const bgColorRaw = backend.Background_Color ?? backend.background_Color ?? undefined;
    const bgImage =
      typeof bgImageRaw === "string" && bgImageRaw.trim().length === 0
        ? undefined
        : bgImageRaw ?? undefined;
    const bgColor =
      typeof bgColorRaw === "string" && bgColorRaw.trim().length === 0
        ? undefined
        : bgColorRaw ?? undefined;

    const meta: CanvasMeta = {
      id: String(backendId),
      name,
      owner: ownerId != null ? String(ownerId) : undefined,
      isFavorite: !!isFavorite,
      isPublic: !!isPublic,
      createdAt,
      updatedAt,
      previewImage: bgImage,
      backgroundColor: bgColor,
      stats: {},
    };

    // Backend may send canvas_Data as JSON string, or provide parsed canvasDataDetails
    const rawData = backend.Canvas_Data ?? backend.canvas_Data;
    let doc: { Elements?: unknown[]; elements?: unknown[] } | undefined;

    if (backend.canvasDataDetails?.elements != null) {
      doc = { elements: backend.canvasDataDetails.elements };
    } else if (typeof rawData === "string") {
      try {
        doc = JSON.parse(rawData) as { Elements?: unknown[]; elements?: unknown[] };
      } catch {
        doc = undefined;
      }
    } else if (rawData && typeof rawData === "object") {
      doc = rawData as { Elements?: unknown[]; elements?: unknown[] };
    }

    const rawElements =
      (doc?.Elements ?? doc?.elements) ?? [];
    const elements = (Array.isArray(rawElements) ? rawElements : [])
      .map((raw) => normalizeCanvasElement(raw))
      .filter((el): el is CanvasElement => el != null);

    return { meta, elements };
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
    const payload = {
      ID_Canvas: Number(id),
      Canvas_Name: meta.name,
      Canvas_Data: {
        Version: "1",
        ExportedAt: new Date().toISOString(),
        Elements: elementsToBackendElements(elements),
      },
      Visibility: meta.isPublic,
      Favorite: meta.isFavorite,
      Background_Image: meta.previewImage ?? null,
      Background_Color: meta.backgroundColor ?? null,
    };
    const updatedId = await api<number>("/api/auth/canvas", {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
    // Reflect minimal changes in meta; full meta will be re-fetched when needed
    return {
      ...(meta as CanvasMeta),
      id: String(updatedId || id),
    };
  } catch {
    return { ...mockCanvasMeta(id, meta.name ?? "Untitled"), ...meta };
  }
}

/**
 * Create a new canvas via POST /api/auth/canvas.
 * Request matches CreateCanvasRequest; response is the new canvas ID — we use only that id.
 * Uses Bearer token (no credentials) so CORS allows it when server sends Access-Control-Allow-Origin: *.
 */
export async function createCanvas(name: string): Promise<CanvasMeta> {
  const payload = {
    Canvas_Name: name || "Untitled",
    Background_Image: null as string | null,
    Background_Color: null as string | null,
    Created_At: new Date().toISOString(),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/auth/canvas`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const raw = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(raw || response.statusText);
  }

  // Backend returns the ID of the new canvas — use only this value, never reuse another canvas's id
  let newId: number | null = null;
  try {
    const parsed = JSON.parse(raw) as { id?: number; ID_Canvas?: number };
    const fromJson = parsed?.id ?? parsed?.ID_Canvas;
    if (fromJson != null && Number.isFinite(Number(fromJson))) {
      newId = Number(fromJson);
    }
  } catch {
    /* not JSON */
  }
  if (newId == null) {
    const asNum = Number(raw);
    if (Number.isFinite(asNum)) newId = asNum;
  }

  if (newId == null || !Number.isFinite(newId)) {
    throw new Error(`Create canvas returned invalid id: '${raw}'`);
  }

  return mockCanvasMeta(String(newId), name || "Untitled");
}

export async function deleteCanvas(id: string): Promise<void> {
  try {
    const payload = {
      ID_Canvas: Number(id),
    };
    await api("/api/auth/canvas", {
      method: "DELETE",
      body: payload as unknown as Record<string, unknown>,
    });
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
