// src/pages/StatsPage.jsx
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../api/stats";
import { useAuth } from "../context/useAuth";

const StatsPage = () => {
    const { user, logout } = useAuth();

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ["stats"],
        queryFn: fetchStats,
        refetchInterval: 60000,
    });

    const stats = data || {
        total: 0,
        open: 0,
        pending: 0,
        resolved: 0,
        highPriority: 0,
        last7Days: [],
    };

    const maxCount =
        stats.last7Days.length > 0
            ? Math.max(...stats.last7Days.map((d) => d.count))
            : 0;

    return (
        <div className="container my-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 className="mb-0">Ticket Stats</h3>
                    <small className="text-muted">
                        Overview of ticket volume and status
                    </small>
                </div>
                <div>
                    {user && (
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">
                                Logged in as <strong>{user.name}</strong>
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isError && (
                <div className="alert alert-danger py-2">
                    Failed to load stats: {error?.response?.data?.error || error.message}
                </div>
            )}

            {/* Stat cards */}
            <div className="row g-3 mb-3">
                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-primary h-100">
                        <div className="card-body py-2">
                            <div className="text-muted small">Total Tickets</div>
                            <div className="fs-4 fw-semibold">{stats.total}</div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-info h-100">
                        <div className="card-body py-2">
                            <div className="text-muted small">Open</div>
                            <div className="fs-4 fw-semibold text-primary">
                                {stats.open}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-warning h-100">
                        <div className="card-body py-2">
                            <div className="text-muted small">Pending</div>
                            <div className="fs-4 fw-semibold text-warning">
                                {stats.pending}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-success h-100">
                        <div className="card-body py-2">
                            <div className="text-muted small">Resolved</div>
                            <div className="fs-4 fw-semibold text-success">
                                {stats.resolved}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-danger h-100">
                        <div className="card-body py-2">
                            <div className="text-muted small">High Priority</div>
                            <div className="fs-4 fw-semibold text-danger">
                                {stats.highPriority}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isFetching && !isLoading && (
                <small className="text-muted d-block mb-2">Refreshing stats…</small>
            )}

            {/* Last 7 days chart */}
            <div className="card">
                <div className="card-body">
                    <h6 className="card-title mb-3">
                        Tickets created in last 7 days
                    </h6>
                    {stats.last7Days.length === 0 ? (
                        <p className="text-muted small mb-0">
                            No data available.
                        </p>
                    ) : (
                        <div
                            className="d-flex align-items-end gap-2"
                            style={{ height: 220 }}
                        >
                            {stats.last7Days.map((day) => {
                                const height =
                                    maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                return (
                                    <div
                                        key={day.date}
                                        className="d-flex flex-column align-items-center flex-fill"
                                    >
                                        <div
                                            className="rounded-top bg-primary d-flex justify-content-center align-items-end"
                                            style={{
                                                width: "60%",
                                                height: `${height || 3}%`,
                                                minHeight: day.count > 0 ? 24 : 3,
                                                transition: "height 0.2s ease",
                                            }}
                                            title={`${day.date}: ${day.count} tickets`}
                                        >
                                            {day.count > 0 && (
                                                <span className="text-white small">
                                                    {day.count}
                                                </span>
                                            )}
                                        </div>
                                        <small className="text-muted mt-1">
                                            {day.date.slice(5)}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
