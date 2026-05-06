import { ReactNode } from "react";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  leftSize?: string;
  rightSize?: string;
  imagePosition: "left" | "right";
}

export default function SplitLayout({ left, right, leftSize = "w-1/2", rightSize = "w-1/2", imagePosition }: SplitLayoutProps) {
  // Mobile: text first (order-1), images second (order-2)
  // Desktop: images on the side specified by imagePosition
  const isImageLeft = imagePosition === "left";

  // Mobile order: when image is left, right (text) comes first; when image is right, left (text) comes first
  const leftMobileOrder = isImageLeft ? "order-2" : "order-1";
  const rightMobileOrder = isImageLeft ? "order-1" : "order-2";

  // Desktop order: always normal (left first, right second)
  const leftDesktopOrder = "md:order-1";
  const rightDesktopOrder = "md:order-2";

  return (
    <section className="flex flex-col md:flex-row w-full gap-4">
      <div className={`w-full ${leftSize} ${leftMobileOrder} ${leftDesktopOrder}`}>{left}</div>
      <div className={`w-full ${rightSize} ${rightMobileOrder} ${rightDesktopOrder}`}>{right}</div>
    </section>
  );
}
