import stories from "@/data/stories.json";

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
  return stories as Story[];
}

export function getStoryById(id: string): Story | undefined {
  return (stories as Story[]).find((story) => story.id === Number(id));
}
