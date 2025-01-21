"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  totalPages: providedTotalPages,
  hasNextPage: providedHasNext,
  hasPrevPage: providedHasPrev,
}) => {
  const totalPages = providedTotalPages ?? Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = providedHasNext ?? currentPage < totalPages;
  const hasPrevPage = providedHasPrev ?? currentPage > 1;
 console.log("total pages:",totalPages)
  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };
  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <Button
        key={page}
        variant={page === currentPage ? "default" : "outline"}
        size="sm"
        aria-current={page === currentPage ? "page" : undefined}
        onClick={() => onPageChange(page)}
        className={page === currentPage ? "bg-primary text-black" : ""}
      >
        {page}
      </Button>
    ));
  };
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 space-y-4 md:space-y-0 text-black">
      {/* Navigation buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(1)}
          aria-label="First Page"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {renderPageNumbers()}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last Page"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {/* Jump to Page Input */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Jump to page:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={handlePageInputChange}
          className="w-16 p-1 border border-gray-300 rounded-md text-center"
        />
      </div>
    </div>
  );
};
export default Pagination;