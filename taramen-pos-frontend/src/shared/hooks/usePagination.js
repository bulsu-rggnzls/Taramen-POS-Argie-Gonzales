import { useEffect, useMemo, useState } from "react";

export function usePagination(totalPages = 1, initialPage = 1) {
  const normalizedTotalPages = useMemo(
    () => Math.max(1, Number(totalPages) || 1),
    [totalPages]
  );
  const normalizedInitialPage = useMemo(
    () => Math.min(Math.max(1, Number(initialPage) || 1), normalizedTotalPages),
    [initialPage, normalizedTotalPages]
  );

  const [currentPage, setCurrentPage] = useState(normalizedInitialPage);
  const [inputPage, setInputPage] = useState(normalizedInitialPage.toString());

  useEffect(() => {
    setCurrentPage((page) => {
      const nextPage = Math.min(Math.max(1, page), normalizedTotalPages);
      setInputPage(nextPage.toString());
      return nextPage;
    });
  }, [normalizedTotalPages]);

  useEffect(() => {
    setCurrentPage(normalizedInitialPage);
    setInputPage(normalizedInitialPage.toString());
  }, [normalizedInitialPage]);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    setInputPage(page.toString());
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage);
    if (page >= 1 && page <= normalizedTotalPages) {
      setCurrentPage(page);
    }
  };

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < normalizedTotalPages) {
      handlePageClick(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    
    if (normalizedTotalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= normalizedTotalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      // Show first 5 pages when near the beginning (but don't exceed totalPages)
      const showCount = Math.min(5, normalizedTotalPages);
      for (let i = 1; i <= showCount; i++) {
        pages.push(i);
      }
      if (normalizedTotalPages > showCount) {
        pages.push('...');
        pages.push(normalizedTotalPages);
      }
    } else if (currentPage >= normalizedTotalPages - 2) {
      // Show last 5 pages when near the end (but don't go below 1)
      pages.push(1);
      pages.push('...');
      const showCount = Math.min(5, normalizedTotalPages);
      const start = Math.max(normalizedTotalPages - showCount + 1, 1);
      for (let i = start; i <= normalizedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page (3 pages in middle)
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(normalizedTotalPages);
    }
    
    return pages;
  };

  const getPageButtonClass = (page, baseClass = "w-8 h-8 text-sm rounded-md") => {
    return currentPage === page 
      ? `${baseClass} text-white bg-primary`
      : `${baseClass} text-gray-700 bg-white hover:bg-gray-50`;
  };

  return {
    currentPage,
    inputPage,
    totalPages: normalizedTotalPages,
    visiblePages: getVisiblePages(),
    handlePageClick,
    handleGoToPage,
    handleInputChange,
    handlePrevPage,
    handleNextPage,
    getPageButtonClass,
    setCurrentPage,
    setInputPage,
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < normalizedTotalPages,
  };
}
