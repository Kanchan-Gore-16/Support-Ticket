import { pool } from "../db.js";

// GET /tickets/:id/notes
export const listNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(
      "SELECT id FROM tickets WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const notesResult = await pool.query(
      `SELECT n.id, n.text, n.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM notes n
       JOIN users u ON u.id = n.user_id
       WHERE n.ticket_id = $1
       ORDER BY n.created_at DESC`,
      [id]
    );

    return res.json(notesResult.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /tickets/:id/notes
export const addNote = async (req, res) => {
  try {
    const { id } = req.params; // ticket id
    let { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Validation error",
        details: ["Note text is required"],
      });
    }

    text = text.trim();

    // Ensure ticket exists and not deleted
    const ticketResult = await pool.query(
      "SELECT id FROM tickets WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const userId = req.user.id;

    const insertResult = await pool.query(
      `INSERT INTO notes (ticket_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
      [id, userId, text]
    );

    const note = insertResult.rows[0];

    return res.status(201).json({
      id: note.id,
      text: note.text,
      created_at: note.created_at,
      user: {
        id: userId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
