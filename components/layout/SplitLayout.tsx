import { ReactNode } from "react";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  leftSize?: string;
  rightSize?: string;
  imagePosition: "left" | "right";
}

export default function SplitLayout({ left, right, leftSize = "lg:w-1/2", rightSize = "lg:w-1/2", imagePosition }: SplitLayoutProps) {
  const isImageLeft = imagePosition === "left";

  const leftMobileOrder = isImageLeft ? "order-2" : "order-1";
  const rightMobileOrder = isImageLeft ? "order-1" : "order-2";

  return (
    <section className="flex flex-col md:flex-row w-full gap-4">
      <div className={`w-full md:w-1/2 ${leftSize} ${leftMobileOrder} md:order-1`}>{left}</div>
      <div className={`w-full md:w-1/2 ${rightSize} ${rightMobileOrder} md:order-2`}>{right}</div>
    </section>
  );
}
