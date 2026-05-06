"use client";

import { useRouter } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
}

export default function Pagination({
  currentPage,
  totalPages = 10,
}: PaginationProps) {
  const router = useRouter();

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (page === 1) {
      router.push("/");
    } else {
      router.push(`/stories/${page}`);
    }
  };

  return (
    <nav className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={() => goTo(currentPage - 1)}
        aria-label="Previous page"
        className={`flex items-center justify-center text-white transition-colors hover:bg-white/10 mr-[50px] ${currentPage === 1 ? "invisible" : ""}`}
      >
        Previous page
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => goTo(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
          className={`flex h-5 w-5 items-center justify-center rounded-full border-white/20 text-sm font-medium transition-colors
            ${
              page === currentPage
                ? "border-white bg-white text-black"
                : "border-white/20 bg-white/20 text-white/20 hover:border-white/30 hover:bg-white/30"
            }`}
        >
        </button>
      ))}

      <button
        onClick={() => goTo(currentPage + 1)}
        aria-label="Next page"
        className={`flex items-center justify-center text-white transition-colors hover:bg-white/10 ml-[50px] ${currentPage === totalPages ? "invisible" : ""}`}
      >
        Next page
      </button>
    </nav>
  );
}
