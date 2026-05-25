import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  const getPages = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        pages.push("...");
      }
    }

    // Remove consecutive "..." duplicates only
    return pages.filter((v, i, a) => !(v === "..." && a[i - 1] === "..."));
  };

  if (totalPages <= 1) return null;

  const pages = getPages();

  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        {/* Pages */}
        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-gray-400 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={`${page}-${idx}`}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg border text-sm transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
};

export default Pagination;
