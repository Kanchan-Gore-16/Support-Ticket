// src/components/TicketDrawer.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchTicket,
    fetchNotes,
    updateTicket,
    addNote,
} from "../api/tickets";

const STATUS_OPTIONS = ["open", "pending", "resolved"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const TicketDrawer = ({ ticketId, onClose }) => {
    const queryClient = useQueryClient();
    const [noteText, setNoteText] = useState("");
    const [noteError, setNoteError] = useState("");

    // Ticket details
    const {
        data: ticket,
        isLoading: ticketLoading,
        isError: ticketError,
    } = useQuery({
        queryKey: ["ticket", ticketId],
        queryFn: () => fetchTicket(ticketId),
        enabled: !!ticketId,
    });

    // Notes
    const {
        data: notes,
        isLoading: notesLoading,
        isError: notesError,
    } = useQuery({
        queryKey: ["notes", ticketId],
        queryFn: () => fetchNotes(ticketId),
        enabled: !!ticketId,
    });

    // ✅ Optimistic update for status/priority
    const updateMutation = useMutation({
        mutationFn: updateTicket,
        // vars: { id, status? , priority? }
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });
            await queryClient.cancelQueries({ queryKey: ["tickets"] });

            const prevTicket = queryClient.getQueryData(["ticket", ticketId]);
            const prevTicketsQueries = queryClient.getQueriesData({
                queryKey: ["tickets"],
            });

            // Optimistically update single ticket cache
            if (prevTicket) {
                const nextTicket = { ...prevTicket, ...vars };
                nextTicket.updated_at = new Date().toISOString();
                queryClient.setQueryData(["ticket", ticketId], nextTicket);
            }

            // Optimistically update any ticket list containing this id
            prevTicketsQueries.forEach(([key, data]) => {
                if (!data?.data) return;
                const updatedList = data.data.map((t) =>
                    t.id === vars.id
                        ? { ...t, ...vars, updated_at: new Date().toISOString() }
                        : t
                );
                queryClient.setQueryData(key, { ...data, data: updatedList });
            });

            return { prevTicket, prevTicketsQueries };
        },
        onError: (_err, _vars, context) => {
            // Rollback ticket details
            if (context?.prevTicket) {
                queryClient.setQueryData(["ticket", ticketId], context.prevTicket);
            }
            // Rollback ticket lists
            if (context?.prevTicketsQueries) {
                context.prevTicketsQueries.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
        },
        onSettled: (_data, _error, vars) => {
            // Ensure we are in sync with server
            queryClient.invalidateQueries({ queryKey: ["ticket", vars.id] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });

    // ✅ Optimistic note addition
    const addNoteMutation = useMutation({
        mutationFn: addNote, // vars: { id, text }
        onMutate: async (vars) => {
            setNoteError("");
            await queryClient.cancelQueries({ queryKey: ["notes", ticketId] });

            const prevNotes = queryClient.getQueryData(["notes", ticketId]) || [];

            const tempId = `temp-${Date.now()}`;
            const newNote = {
                id: tempId,
                text: vars.text,
                created_at: new Date().toISOString(),
                user_name: "You",
            };

            queryClient.setQueryData(["notes", ticketId], [newNote, ...prevNotes]);

            setNoteText("");

            return { prevNotes };
        },
        onError: (err, _vars, context) => {
            setNoteError(
                err?.response?.data?.error ||
                err?.response?.data?.details?.[0] ||
                "Failed to add note. Try again."
            );
            // rollback notes
            if (context?.prevNotes) {
                queryClient.setQueryData(["notes", ticketId], context.prevNotes);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", ticketId] });
        },
    });

    const handleStatusChange = (e) => {
        const status = e.target.value;
        if (!ticket) return;
        updateMutation.mutate({ id: ticket.id, status });
    };

    const handlePriorityChange = (e) => {
        const priority = e.target.value;
        if (!ticket) return;
        updateMutation.mutate({ id: ticket.id, priority });
    };

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!noteText.trim()) {
            setNoteError("Note text is required");
            return;
        }
        addNoteMutation.mutate({ id: ticketId, text: noteText.trim() });
    };

    const formatDateTime = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString();
    };

    return (
        <div className="drawer-backdrop" onClick={onClose}>
            <div
                className="drawer border-start"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="drawer-header d-flex justify-content-between align-items-center border-bottom px-3 py-2">
                    <div>
                        <div className="drawer-title fw-semibold">
                            {ticketLoading ? "Loading..." : ticket?.title}
                        </div>
                        <div className="drawer-subtitle text-muted small">
                            {ticket && ticket.customer_email}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="drawer-body p-3">
                    {ticketError && (
                        <div className="alert alert-danger py-2">
                            Failed to load ticket details
                        </div>
                    )}

                    {/* Description */}
                    <section className="drawer-section mb-3">
                        <h6 className="mb-1">Description</h6>
                        {ticketLoading ? (
                            <p className="text-muted small mb-0">Loading...</p>
                        ) : (
                            <p style={{ whiteSpace: "pre-wrap" }} className="small mb-0">
                                {ticket?.description}
                            </p>
                        )}
                    </section>

                    {/* Status & Priority */}
                    <section className="drawer-section inline d-flex gap-3 mb-3">
                        <div className="flex-fill">
                            <h6 className="mb-1">Status</h6>
                            <select
                                className="form-select form-select-sm"
                                value={ticket?.status || ""}
                                disabled={ticketLoading || updateMutation.isPending}
                                onChange={handleStatusChange}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-fill">
                            <h6 className="mb-1">Priority</h6>
                            <select
                                className="form-select form-select-sm"
                                value={ticket?.priority || ""}
                                disabled={ticketLoading || updateMutation.isPending}
                                onChange={handlePriorityChange}
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Meta */}
                    {ticket && (
                        <section className="drawer-section meta mb-3 small text-muted">
                            <div>
                                <span className="meta-label fw-semibold">Created:</span>{" "}
                                {formatDateTime(ticket.created_at)}
                            </div>
                            <div>
                                <span className="meta-label fw-semibold">Updated:</span>{" "}
                                {formatDateTime(ticket.updated_at)}
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    <section className="drawer-section">
                        <h6 className="mb-2">Notes</h6>

                        {notesError && (
                            <div className="alert alert-danger py-2">
                                Failed to load notes
                            </div>
                        )}

                        {notesLoading ? (
                            <p className="text-muted small">Loading notes...</p>
                        ) : notes && notes.length > 0 ? (
                            <ul className="notes-list list-unstyled mb-2">
                                {notes.map((note) => (
                                    <li
                                        key={note.id}
                                        className="note-item mb-2 p-2 rounded border bg-light"
                                    >
                                        <div className="note-header d-flex justify-content-between mb-1">
                                            <span className="note-author small fw-semibold">
                                                {note.user_name || "Support Agent"}
                                            </span>
                                            <span className="note-date small text-muted">
                                                {formatDateTime(note.created_at)}
                                            </span>
                                        </div>
                                        <div className="note-text small">{note.text}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted small mb-2">No notes yet.</p>
                        )}

                        {/* Add note */}
                        <form onSubmit={handleAddNote} className="note-form">
                            <textarea
                                rows={3}
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="form-control form-control-sm"
                            />
                            {noteError && (
                                <div className="alert alert-danger py-1 mt-2 small mb-0">
                                    {noteError}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm mt-2"
                                disabled={addNoteMutation.isPending || !ticketId}
                            >
                                {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TicketDrawer;
