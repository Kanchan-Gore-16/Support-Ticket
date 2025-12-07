// src/pages/InboxPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchTickets } from "../api/tickets";
import TicketDrawer from "../components/TicketDrawer";

const STATUS_OPTIONS = [
    { label: "All statuses", value: "" },
    { label: "Open", value: "open" },
    { label: "Pending", value: "pending" },
    { label: "Resolved", value: "resolved" },
];

const PRIORITY_OPTIONS = [
    { label: "All priorities", value: "" },
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];

const PAGE_SIZE = 10;

const InboxPage = () => {
    const { user, logout } = useAuth();

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(id);
    }, [search]);

    const queryKey = useMemo(
        () => ["tickets", { page, statusFilter, priorityFilter, debouncedSearch }],
        [page, statusFilter, priorityFilter, debouncedSearch]
    );

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey,
        queryFn: () =>
            fetchTickets({
                page,
                limit: PAGE_SIZE,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                search: debouncedSearch || undefined,
            }),
        keepPreviousData: true,
        refetchInterval: 10000,
    });

    const tickets = data?.data ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        total: 0,
        totalPages: 1,
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handlePriorityChange = (e) => {
        setPriorityFilter(e.target.value);
        setPage(1);
    };

    const handlePrevPage = () => {
        setPage((p) => Math.max(1, p - 1));
    };

    const handleNextPage = () => {
        if (pagination.totalPages) {
            setPage((p) => Math.min(pagination.totalPages, p + 1));
        } else {
            setPage((p) => p + 1);
        }
    };

    const formatDateTime = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    const renderStatusBadge = (status) => {
        if (status === "open")
            return <span className="badge text-bg-primary">Open</span>;
        if (status === "pending")
            return <span className="badge text-bg-warning">Pending</span>;
        if (status === "resolved")
            return <span className="badge text-bg-success">Resolved</span>;
        return status;
    };

    const renderPriorityBadge = (priority) => {
        if (priority === "high")
            return <span className="badge text-bg-danger">High</span>;
        if (priority === "medium")
            return <span className="badge text-bg-info">Medium</span>;
        if (priority === "low")
            return <span className="badge text-bg-secondary">Low</span>;
        return priority;
    };

    const handleRowClick = (ticket) => {
        setSelectedTicketId(ticket.id);
    };

    return (
        <>
            <div className="page-container container my-4">
                {/* Header */}
                <header className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="mb-0">Support Inbox</h3>
                        <small className="text-muted">
                            Manage support tickets, statuses and priorities
                        </small>
                    </div>
                    <div>
                        {user && (
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">
                                    Logged in as <strong>{user.name}</strong>
                                </span>
                                <button
                                    onClick={logout}
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Toolbar */}
                <div className="card mb-3">
                    <div className="card-body py-2">
                        <div className="toolbar row g-2 align-items-center">
                            <div className="toolbar-left col-md-3 col-sm-6">
                                <select
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                    className="form-select form-select-sm"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value || "all-status"} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="toolbar-left col-md-3 col-sm-6">
                                <select
                                    value={priorityFilter}
                                    onChange={handlePriorityChange}
                                    className="form-select form-select-sm"
                                >
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <option key={opt.value || "all-priority"} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="toolbar-right col-md-6 mt-2 mt-md-0">
                                <input
                                    type="text"
                                    placeholder="Search by title or customer email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="form-control form-control-sm"
                                    style={{ minWidth: 240 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {isError && (
                    <div className="alert alert-danger py-2">
                        Failed to load tickets:{" "}
                        {error?.response?.data?.error || error.message}
                    </div>
                )}

                {/* Table */}
                <div className="card">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "28%" }}>Title</th>
                                        <th style={{ width: "22%" }}>Customer</th>
                                        <th style={{ width: "12%" }}>Status</th>
                                        <th style={{ width: "12%" }}>Priority</th>
                                        <th style={{ width: "26%" }}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        [...Array(6)].map((_, idx) => (
                                            <tr key={idx}>
                                                <td colSpan={5}>
                                                    <div className="placeholder-glow">
                                                        <span className="placeholder col-12"></span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : tickets.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                style={{ padding: 16 }}
                                                className="text-center text-muted"
                                            >
                                                No tickets found
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <tr
                                                key={ticket.id}
                                                className="ticket-row"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleRowClick(ticket)}
                                            >
                                                <td>{ticket.title}</td>
                                                <td>{ticket.customer_email}</td>
                                                <td>{renderStatusBadge(ticket.status)}</td>
                                                <td>{renderPriorityBadge(ticket.priority)}</td>
                                                <td>{formatDateTime(ticket.created_at)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="card-footer d-flex justify-content-between align-items-center py-2">
                        <div>
                            {isFetching && !isLoading && (
                                <small className="text-muted">Refreshing data...</small>
                            )}
                        </div>

                        <div className="pagination d-flex align-items-center gap-2 mb-0">
                            <button
                                onClick={handlePrevPage}
                                disabled={page <= 1}
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                            >
                                Prev
                            </button>
                            <span style={{ fontSize: 13 }} className="text-muted">
                                Page {pagination.page} of {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={pagination.totalPages && page >= pagination.totalPages}
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedTicketId && (
                <TicketDrawer
                    ticketId={selectedTicketId}
                    onClose={() => setSelectedTicketId(null)}
                />
            )}
        </>
    );
};

export default InboxPage;
