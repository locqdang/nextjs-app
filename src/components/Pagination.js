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
  const btnClasses = 'btn--sm border border-gray-500 rounded-lg hover:cursor-pointer';

  const handleLimitChange = (e) => {
    setLimit(e.target.value);
    onPageSelect(1);
  };

  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {/* First Btn */}
      <button
        className={btnClasses}
        disabled={loading}
        onClick={() => {
          onPageSelect(1);
        }}
      >
        First
      </button>
      {/* Prev Btn */}
      <button
        className={btnClasses}
        disabled={isPrevDisabled}
        onClick={() => {
          onPageSelect(currentPage - 1);
        }}
      >
        previous
      </button>

      {/* Middle Btns */}
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNo = i + 1;
        const isActive = pageNo === currentPage;
        if (pageNo < currentPage - 2 || pageNo > currentPage + 2) {
          return '.';
        }
        return (
          <button
            className={`${isActive ? 'btn' : ''} ${btnClasses} `}
            key={pageNo}
            onClick={() => {
              onPageSelect(pageNo);
            }}
          >
            {pageNo}
          </button>
        );
      })}

      {/* Next Btn */}
      <button
        className={btnClasses}
        disabled={isNextDisabled}
        onClick={() => onPageSelect(currentPage + 1)}
      >
        next
      </button>

      {/* Last Btn */}
      {/* First Btn */}
      <button
        className={btnClasses}
        disabled={loading}
        onClick={() => {
          onPageSelect(totalPages);
        }}
      >
        Last
      </button>

      {/* Set no items per page */}
      <div className="w-full mt-4 flex justify-center">
        <label>
          Items per page:
          <select value={limit} onChange={handleLimitChange} disabled={loading}>
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
