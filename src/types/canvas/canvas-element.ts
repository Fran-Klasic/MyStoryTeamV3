import type { Vector2Int } from "./vector2int";
import type { Vector3Int } from "./vector3int";

export type ID = string;

/** position.x and position.y are in canvas space (e.g. 0..2000). They do not depend on viewport pan/zoom; saving them persists the element’s place on the canvas. */

export type CanvasElement =
  | {
      readonly id: ID;
      readonly type: "Text";
      data: string;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "List";
      data: ListData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "Image";
      data: ImageData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "Audio";
      data: AudioData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "Task";
      data: TaskData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "Date";
      data: DateData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    }
  | {
      readonly id: ID;
      readonly type: "Video";
      data: VideoData;
      position: Vector3Int;
      size: Vector2Int;
      connections: Connection[];
    };

export type VideoData = {
  url: string;
};
export type ListData = {
  listData: string[];
};
export type ImageData = {
  base64File: string;
};
export type AudioData = {
  base64File: string;
};
export type TaskData = {
  data: string;
  checked: boolean;
};
export type DateData = {
  date: string;
  data: string;
};
export type Connection = {
  self: ID;
  target: ID;
};

