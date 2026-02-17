export type CanvasMeta = {
  id: string;
  name: string;
  owner?: string;
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
