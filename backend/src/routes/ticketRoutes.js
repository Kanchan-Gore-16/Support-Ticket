// src/routes/ticketRoutes.js
import express from "express";
import {
  listTickets,
  getTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import {
  listNotes,
  addNote,
} from "../controllers/noteController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// List tickets (public or protected – depending on spec you can wrap with authMiddleware)
router.get("/", authMiddleware, listTickets);

// Single ticket details
router.get("/:id", authMiddleware, getTicket);

// Update status/priority
router.patch("/:id", authMiddleware, updateTicket);

// Soft delete
router.delete("/:id", authMiddleware, deleteTicket);

// Notes for a ticket
router.get("/:id/notes", authMiddleware, listNotes);
router.post("/:id/notes", authMiddleware, addNote);


export default router;
