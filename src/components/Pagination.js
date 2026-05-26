function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages]);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  return Array.from(pages)
    .sort((a, b) => a - b)
    .reduce((items, page, index, sortedPages) => {
      const previousPage = sortedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        items.push(`ellipsis-${previousPage}-${page}`);
      }

      items.push(page);
      return items;
    }, []);
}

export default function Pagination({
  currentPage,
  limit,
  totalPages,
  onPageSelect,
  setLimit,
  loading = false,
}) {
  const safeTotalPages = Math.max(Number(totalPages) || 0, 0);
  const safeCurrentPage = Math.min(Math.max(Number(currentPage) || 1, 1), safeTotalPages || 1);
  const visiblePages = getVisiblePages(safeCurrentPage, safeTotalPages);

  const isFirstDisabled = loading || safeCurrentPage <= 1 || safeTotalPages <= 1;
  const isPrevDisabled = loading || safeCurrentPage <= 1 || safeTotalPages <= 1;
  const isNextDisabled = loading || safeCurrentPage >= safeTotalPages || safeTotalPages <= 1;
  const isLastDisabled = loading || safeCurrentPage >= safeTotalPages || safeTotalPages <= 1;

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    onPageSelect(1);
  };

  return (
    <nav className="pagination" aria-label="Pagination navigation">
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          disabled={isFirstDisabled}
          onClick={() => onPageSelect(1)}
        >
          First
        </button>

        <button
          type="button"
          className="pagination__button"
          disabled={isPrevDisabled}
          onClick={() => onPageSelect(safeCurrentPage - 1)}
        >
          Previous
        </button>

        {visiblePages.map((item) => {
          if (typeof item === 'string') {
            return (
              <span className="pagination__ellipsis" key={item} aria-hidden="true">
                …
              </span>
            );
          }

          const isActive = item === safeCurrentPage;

          return (
            <button
              type="button"
              className={`pagination__button ${isActive ? 'pagination__button--active' : ''}`}
              key={item}
              onClick={() => onPageSelect(item)}
              disabled={loading || isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          className="pagination__button"
          disabled={isNextDisabled}
          onClick={() => onPageSelect(safeCurrentPage + 1)}
        >
          Next
        </button>

        <button
          type="button"
          className="pagination__button"
          disabled={isLastDisabled}
          onClick={() => onPageSelect(safeTotalPages)}
        >
          Last
        </button>
      </div>

      <div className="pagination__limit">
        <label className="pagination__limit-label">
          Items per page:
          <select
            className="pagination__select"
            value={limit}
            onChange={handleLimitChange}
            disabled={loading}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
    </nav>
  );
}
