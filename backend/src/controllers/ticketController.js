import { pool } from "../db.js";

const VALID_STATUS = ["open", "pending", "resolved"];
const VALID_PRIORITY = ["low", "medium", "high"];

// GET /tickets?page=&limit=&status=&priority=&search=
export const listTickets = async (req, res) => {
  try {
    let { page = 1, limit = 20, status, priority, search } = req.query;

    page = parseInt(page, 10);
    limit = Math.min(parseInt(limit, 10) || 20, 100); 

    const offset = (page - 1) * limit;

    const where = ["deleted_at IS NULL"];
    const params = [];
    let idx = 1;

    if (status && VALID_STATUS.includes(status)) {
      where.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (priority && VALID_PRIORITY.includes(priority)) {
      where.push(`priority = $${idx}`);
      params.push(priority);
      idx++;
    }

    if (search) {
      where.push(`(title ILIKE $${idx} OR customer_email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) AS total FROM tickets ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataQuery = `
      SELECT id, title, description, customer_email,
             status, priority, created_at, updated_at
      FROM tickets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const dataParams = [...params, limit, offset];

    const dataResult = await pool.query(dataQuery, dataParams);

    return res.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /tickets/:id
export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, title, description, customer_email,
              status, priority, created_at, updated_at
       FROM tickets
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /tickets/:id
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status)) {
        return res.status(400).json({
          error: "Validation error",
          details: ["Invalid status"],
        });
      }
      updates.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITY.includes(priority)) {
        return res.status(400).json({
          error: "Validation error",
          details: ["Invalid priority"],
        });
      }
      updates.push(`priority = $${idx}`);
      params.push(priority);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "Validation error",
        details: ["Nothing to update"],
      });
    }

    // updated_at
    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE tickets
      SET ${updates.join(", ")}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING id, title, description, customer_email,
                status, priority, created_at, updated_at
    `;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /tickets/:id (soft delete)
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE tickets
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(204).send(); // no content
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
