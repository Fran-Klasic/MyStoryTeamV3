export type CanvasMeta = {
  id: string;
  name: string;
  owner?: string;
  /** Username of the owner when provided by the API (e.g. for public canvases) */
  ownerUsername?: string;
  isFavorite: boolean;
  isPublic: boolean;
  updatedAt: string;
  createdAt?: string;
  previewImage?: string;
  backgroundColor?: string;
  stats?: {
    elementsCount?: number;
    lastOpenedAt?: string;
  };
};
