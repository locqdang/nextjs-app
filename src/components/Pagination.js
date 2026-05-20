export default function Pagination({
  currentPage,
  limit,
  totalPages,
  onPageSelect,
  setLimit,
  loading = false,
}) {
  // if (totalPages <= 1) return null;

  const isPrevDisabled = loading || currentPage <= 1;
  const isNextDisabled = loading || currentPage >= totalPages;

  const handleLimitChange = (e) => {
    setLimit(e.target.value);
    onPageSelect(1);
  };

  return (
    <div className="pagination">
      <button
        className="pagination__button"
        disabled={loading}
        onClick={() => {
          onPageSelect(1);
        }}
      >
        First
      </button>
      <button
        className="pagination__button"
        disabled={isPrevDisabled}
        onClick={() => {
          onPageSelect(currentPage - 1);
        }}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => {
        const pageNo = i + 1;
        const isActive = pageNo === currentPage;
        if (pageNo < currentPage - 2 || pageNo > currentPage + 2) {
          return (
            <span className="pagination__ellipsis" key={`ellipsis-${pageNo}`}>
              ...
            </span>
          );
        }
        return (
          <button
            className={`pagination__button ${isActive ? 'pagination__button--active' : ''}`}
            key={pageNo}
            onClick={() => {
              onPageSelect(pageNo);
            }}
          >
            {pageNo}
          </button>
        );
      })}

      <button
        className="pagination__button"
        disabled={isNextDisabled}
        onClick={() => onPageSelect(currentPage + 1)}
      >
        Next
      </button>

      <button
        className="pagination__button"
        disabled={loading}
        onClick={() => {
          onPageSelect(totalPages);
        }}
      >
        Last
      </button>

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
    </div>
  );
}
