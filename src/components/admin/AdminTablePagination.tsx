'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  showPageSizeSelector?: boolean;
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
  // eslint-disable-next-line no-unused-vars
  onPageSizeChange: (pageSize: number) => void;
}

const navigationButtonClass =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors duration-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-40';

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const middleStart = Math.max(2, currentPage - 1);
  const middleEnd = Math.min(totalPages - 1, currentPage + 1);

  if (middleStart > 2) {
    items.push('ellipsis-left');
  }

  for (let page = middleStart; page <= middleEnd; page += 1) {
    items.push(page);
  }

  if (middleEnd < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);

  return items;
}

export default function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  showPageSizeSelector = true,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: AdminTablePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const visibleItems = buildPaginationItems(currentPage, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const isPreviousDisabled = disabled || currentPage === 1;
  const isNextDisabled = disabled || currentPage === totalPages;

  return (
    <footer className="flex flex-col gap-4 border-t border-[var(--color-border-medium)] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-text-secondary">
          총 {totalItems}개 중 {startItem}-{endItem}개 표시
        </p>

        {showPageSizeSelector ? (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            페이지당
            <select
              className="h-9 cursor-pointer rounded-md border border-[var(--color-border-medium)] bg-bg-surface px-3 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-btn-focus"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}개
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="테이블 페이지 이동"
          className="flex items-center justify-between gap-2 sm:justify-end"
        >
          <button
            type="button"
            aria-label="이전 페이지"
            aria-disabled={isPreviousDisabled}
            className={cn(
              navigationButtonClass,
              'cursor-pointer border-[var(--color-border-medium)] bg-bg-surface text-btn-text hover:bg-btn-basic',
            )}
            onClick={() => {
              if (isPreviousDisabled) {
                return;
              }

              onPageChange(currentPage - 1);
            }}
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            {visibleItems.map((item) => {
              if (typeof item !== 'number') {
                return (
                  <span
                    key={item}
                    className="inline-flex h-9 min-w-9 items-center justify-center text-[color:var(--color-text-disabled)]"
                  >
                    <MoreHorizontal className="size-4" />
                  </span>
                );
              }

              const isActive = item === currentPage;

              return (
                <button
                  key={item}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={disabled}
                  className={cn(
                    navigationButtonClass,
                    'cursor-pointer',
                    isActive
                      ? 'border-btn-focus bg-btn-focus text-btn-focus-text'
                      : 'border-[var(--color-border-medium)] bg-bg-surface text-btn-text hover:bg-btn-basic',
                  )}
                  onClick={() => {
                    if (disabled) {
                      return;
                    }

                    onPageChange(item);
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="다음 페이지"
            aria-disabled={isNextDisabled}
            className={cn(
              navigationButtonClass,
              'cursor-pointer border-[var(--color-border-medium)] bg-bg-surface text-btn-text hover:bg-btn-basic',
            )}
            onClick={() => {
              if (isNextDisabled) {
                return;
              }

              onPageChange(currentPage + 1);
            }}
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </footer>
  );
}
