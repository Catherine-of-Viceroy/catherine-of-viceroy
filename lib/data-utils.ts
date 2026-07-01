import landingItemsRaw from "@/data/landing.json";
import storiesRaw from "@/data/stories.json";

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL || "https://pub-782ad05e2fa6419ab14996b34b3da192.r2.dev";

function replaceUrls(obj: any): any {
  if (typeof obj === "string" && obj.startsWith("BUCKET_URL_PLACEHOLDER/")) {
    return obj.replace("BUCKET_URL_PLACEHOLDER", BUCKET_URL);
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceUrls);
  }
  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceUrls(value);
    }
    return result;
  }
  return obj;
}

export function getLandingItems() {
  return replaceUrls(landingItemsRaw);
}

export function getStories() {
  return replaceUrls(storiesRaw);
}
