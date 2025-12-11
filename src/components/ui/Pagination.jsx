import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  // Simple pagination logic: show all pages if <= 7, otherwise show range
  // For simplicity in this iteration, we'll just show a sliding window or all if small
  // Let's implement a simple version first: Prev, [1, 2, ...], Next

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Helper to render page numbers with ellipsis if needed could be added later
  // For now, let's render a max of 5 visible pages around current
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-stroke px-4 py-3 dark:border-strokedark sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-stroke bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-stroke bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-black dark:text-white">
            Páginas <span className="font-medium">{currentPage}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-stroke hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-strokedark dark:hover:bg-meta-4"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${page === currentPage
                  ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  : 'text-black ring-1 ring-inset ring-stroke hover:bg-gray-50 dark:text-white dark:ring-strokedark dark:hover:bg-meta-4'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-stroke hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-strokedark dark:hover:bg-meta-4"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
