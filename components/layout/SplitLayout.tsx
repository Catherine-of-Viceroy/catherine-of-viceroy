import { ReactNode } from "react";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  leftSize?: string;
  rightSize?: string;
}

export default function SplitLayout({ left, right, leftSize = "w-1/2", rightSize = "w-1/2" }: SplitLayoutProps) {
  return (
    <section className="flex w-full">
      <div className={leftSize}>{left}</div>
      <div className={rightSize}>{right}</div>
    </section>
  );
}
