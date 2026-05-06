import Image from "next/image";

export default function Header() {
  return (
    <header className="flex flex-col items-center gap-4 py-10">
      <Image
        src="/images/logo.svg"
        alt="Catherine of Victory logo"
        width={509}
        height={160}
        priority
      />

      <h3 className="text-sm tracking-widest uppercase text-white">
        Styling for the modern centenarian woman
      </h3>

      <Image
        src="/images/accent.svg"
        alt="Divider accent"
        width={146}
        height={20}
      />
    </header>
  );
}
