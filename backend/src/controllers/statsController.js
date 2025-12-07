import { pool } from "../db.js";

export const getStats = async (req, res) => {
  try {
    // Summary counts in one query
    const summaryResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'open' AND deleted_at IS NULL) AS open,
        COUNT(*) FILTER (WHERE status = 'pending' AND deleted_at IS NULL) AS pending,
        COUNT(*) FILTER (WHERE status = 'resolved' AND deleted_at IS NULL) AS resolved,
        COUNT(*) FILTER (WHERE priority = 'high' AND deleted_at IS NULL) AS high_priority
      FROM tickets
      WHERE deleted_at IS NULL;
      `
    );

    const summary = summaryResult.rows[0];

    // Last 7 days ticket creation counts (including today)
    const last7Result = await pool.query(
      `
      WITH days AS (
        SELECT generate_series::date AS date
        FROM generate_series(
          current_date - INTERVAL '6 days',
          current_date,
          INTERVAL '1 day'
        )
      )
      SELECT 
        d.date,
        COALESCE(COUNT(t.id), 0) AS count
      FROM days d
      LEFT JOIN tickets t
        ON t.deleted_at IS NULL
       AND t.created_at::date = d.date
      GROUP BY d.date
      ORDER BY d.date;
      `
    );

    const last7Days = last7Result.rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      count: Number(row.count),
    }));

    return res.json({
      total: Number(summary.total),
      open: Number(summary.open),
      pending: Number(summary.pending),
      resolved: Number(summary.resolved),
      highPriority: Number(summary.high_priority),
      last7Days,
    });
  } catch (err) {
    console.error("Error in GET /stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
