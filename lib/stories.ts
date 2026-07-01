import { getStories } from "./data-utils";

export interface StoryImage {
  url: string;
  isVideo: boolean;
  description?: string;
}

export type StoryLayout =
  | "half"
  | "full"
  | "two-column-cards"
  | "three-column-cards"
  | "single-card";

export type ImagePosition = "left" | "right";

export interface Story {
  id: number;
  pageId: number;
  title: string;
  subtitle: string;
  content: string[];
  images: StoryImage[];
  layout: StoryLayout;
  imagePosition?: ImagePosition;
  isImageCarousel: boolean;
}

export function getAllStories(): Story[] {
  return getStories() as Story[];
}

export function getStoryById(id: string): Story | undefined {
  return (getStories() as Story[]).find((story) => story.id === Number(id));
}
