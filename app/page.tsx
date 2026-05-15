import Header from "@/components/ui/Header";
import LandingCarousel from "@/components/ui/LandingCarousel";
import Pagination from "@/components/ui/Pagination";
import landingItems from "@/data/landing.json";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center font-sans dark:bg-black px-4 md:px-[60px] w-full max-w-[1440px] mx-auto">
      <Header />
      <div className="flex justify-center items-center pb-8">
        <LandingCarousel items={landingItems} interval={6000} />
      </div>
      <div className="flex justify-center items-center p-8">
        <Image
          src="/images/accent.svg"
          alt="Divider accent"
          width={146}
          height={20}
        />
      </div>
      <Pagination currentPage={1} totalPages={11} />
    </div>
  );
}
