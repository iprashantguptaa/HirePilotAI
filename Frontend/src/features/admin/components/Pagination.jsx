const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null

    const { page, totalPages } = pagination

    return (
        <div className="admin-pagination">
            <button
                type="button" className="button ghost-button button-sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
                type="button" className="button ghost-button button-sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </button>
        </div>
    )
}

export default Pagination
