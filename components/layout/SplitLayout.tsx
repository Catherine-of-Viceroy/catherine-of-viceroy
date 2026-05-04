import { ReactNode } from "react";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export default function SplitLayout({ left, right }: SplitLayoutProps) {
  return (
    <section className="flex w-full">
      <div className="w-1/2">{left}</div>
      <div className="w-1/2">{right}</div>
    </section>
  );
}
