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

      <h3>
        Styling the Modern Centenarian Woman
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
