<script setup lang="ts">
import type { CanvasElement } from "@/types/canvas/canvas-element";
import CanvasTextElement from "./elements/CanvasTextElement.vue";
import CanvasListElement from "./elements/CanvasListElement.vue";
import CanvasTaskElement from "./elements/CanvasTaskElement.vue";
import CanvasImageElement from "./elements/CanvasImageElement.vue";
import CanvasAudioElement from "./elements/CanvasAudioElement.vue";
import CanvasVideoElement from "./elements/CanvasVideoElement.vue";
import CanvasDateElement from "./elements/CanvasDateElement.vue";

const props = defineProps<{
  element: CanvasElement;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:text", value: string): void;
  (e: "update:list", listData: string[]): void;
  (e: "update:task", data: string, checked: boolean): void;
  (e: "update:image", base64File: string): void;
  (e: "update:audio", base64File: string): void;
  (e: "update:video", url: string): void;
  (e: "update:date", date: string, data: string): void;
  (e: "blur"): void;
}>();

function resolveComponent(element: CanvasElement) {
  switch (element.type) {
    case "Text":
      return CanvasTextElement;
    case "List":
      return CanvasListElement;
    case "Task":
      return CanvasTaskElement;
    case "Image":
      return CanvasImageElement;
    case "Audio":
      return CanvasAudioElement;
    case "Video":
      return CanvasVideoElement;
    case "Date":
      return CanvasDateElement;
    default:
      return CanvasTextElement;
  }
}

function getProps(element: CanvasElement) {
  switch (element.type) {
    case "Text":
      return {
        text: element.data as string,
        editing: props.editing,
        "onUpdate:text": (value: string) => emit("update:text", value),
        onBlur: () => emit("blur"),
      };
    case "List":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:list": (listData: string[]) => emit("update:list", listData),
        onBlur: () => emit("blur"),
      };
    case "Task":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:task": (data: string, checked: boolean) => emit("update:task", data, checked),
        onBlur: () => emit("blur"),
      };
    case "Image":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:image": (base64File: string) => emit("update:image", base64File),
        onBlur: () => emit("blur"),
      };
    case "Audio":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:audio": (base64File: string) => emit("update:audio", base64File),
        onBlur: () => emit("blur"),
      };
    case "Video":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:video": (url: string) => emit("update:video", url),
        onBlur: () => emit("blur"),
      };
    case "Date":
      return {
        data: element.data,
        editing: props.editing,
        "onUpdate:date": (date: string, data: string) => emit("update:date", date, data),
        onBlur: () => emit("blur"),
      };
    default:
      return { text: "", editing: false };
  }
}
</script>

<template>
  <component
    :is="resolveComponent(props.element)"
    v-bind="getProps(props.element)"
  />
</template>
