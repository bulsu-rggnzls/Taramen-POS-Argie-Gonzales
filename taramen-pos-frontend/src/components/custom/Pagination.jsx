import { StepBack, StepForward } from "lucide-react";
import { usePagination } from "@/shared/hooks/usePagination";
import { Input } from "@/components/ui/input";

export default function Pagination({ currentPage: propCurrentPage, totalPages: propTotalPages, onPageChange }) {
  const {
    currentPage,
    inputPage,
    totalPages,
    visiblePages,
    handlePageClick,
    handleInputChange,
    getPageButtonClass,
    canGoPrev,
    canGoNext,
  } = usePagination(propTotalPages, propCurrentPage || 1);

  const changePage = (page) => {
    const nextPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    handlePageClick(nextPage);

    if (nextPage !== currentPage && typeof onPageChange === 'function') {
      onPageChange(nextPage);
    }
  };

  const handleGoToPage = () => {
    changePage(inputPage);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGoToPage();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-b-xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => changePage(currentPage - 1)}
          className="flex items-center justify-center w-8 h-8 text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50"
          disabled={!canGoPrev}
        >
          <StepBack className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1 justify-center">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-500">
                  ...
                </span>
              );
            }
            return (
              <button 
                key={page}
                onClick={() => changePage(page)}
                className={getPageButtonClass(page)}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => changePage(currentPage + 1)}
          className="flex items-center justify-center w-8 h-8 text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50"
          disabled={!canGoNext}
        >
          <StepForward className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Go to</span>
        <Input 
          type="number" 
          className="w-16 px-2 py-1 text-sm text-center border border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleGoToPage}
          onKeyDown={handleInputKeyDown}
        />
        <span className="text-sm text-gray-700">Page</span>
      </div>
    </div>
  );
}
