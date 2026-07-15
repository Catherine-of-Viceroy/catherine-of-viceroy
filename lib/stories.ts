import { getStories } from "./data-utils";

export interface StoryImage {
  url: string;
  isVideo: boolean;
  alt?: string;
  description?: string;
  borderRadius?: string;
  width?: string | number;
  height?: string | number;
  padding?: string;
}

export interface LastItemHandle {
  autoReturn?: boolean;
  animation?: string;
  duration?: number;
  fadeDuration?: number;
}

export type StoryLayout = "half" | "full" | "column-cards";

export type ImagePosition = "left" | "right" | "center";

export interface Story {
  id: string | number;
  pageId: number;
  title: string;
  subtitle: string;
  content: string[];
  images: StoryImage[];
  layout: StoryLayout;
  imagePosition?: ImagePosition;
  isImageCarousel?: boolean;
  autoSlide?: boolean;
  isTwoImageWidth?: boolean;
  leftSize?: string;
  rightSize?: string;
  lastItemHandle?: LastItemHandle;
}

export function getAllStories(): Story[] {
  return getStories() as Story[];
}

export function getStoryById(id: string): Story | undefined {
  return (getStories() as Story[]).find((story) => story.id === Number(id));
}
