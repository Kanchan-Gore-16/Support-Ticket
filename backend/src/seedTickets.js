// src/seedTickets.js
import { pool } from "./db.js";
import bcrypt from "bcryptjs";

const statuses = ["open", "pending", "resolved"];
const priorities = ["low", "medium", "high"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ✅ Random date: today OR yesterday, with random time
const randomRecentDate = () => {
  const now = new Date();
  const useYesterday = Math.random() < 0.5;

  const base = useYesterday
    ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
    : now;

  // random hour/min/sec in that day
  const d = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    randomInt(0, 23),
    randomInt(0, 59),
    randomInt(0, 59),
    0
  );

  return d;
};

// ✅ Indian customers
const customers = [
  { name: "Amit Sharma", email: "amit.sharma@gmail.com" },
  { name: "Priya Verma", email: "priya.verma@gmail.com" },
  { name: "Rahul Patil", email: "rahul.patil@gmail.com" },
  { name: "Sneha Joshi", email: "sneha.joshi@gmail.com" },
  { name: "Rohit Kulkarni", email: "rohit.kulkarni@gmail.com" },
  { name: "Neha Singh", email: "neha.singh@gmail.com" },
  { name: "Kunal Mehta", email: "kunal.mehta@gmail.com" },
  { name: "Anjali Deshmukh", email: "anjali.deshmukh@gmail.com" },
  { name: "Suresh Yadav", email: "suresh.yadav@gmail.com" },
  { name: "Pooja Nair", email: "pooja.nair@gmail.com" },
];

// ✅ Support agents (users table)
const agents = [
  { name: "Riya from Support", email: "riya.support@helpdesk.in" },
  { name: "Ankit from Support", email: "ankit.support@helpdesk.in" },
  { name: "Vikas from Support", email: "vikas.support@helpdesk.in" },
  { name: "Meera from Support", email: "meera.support@helpdesk.in" },
];

// ✅ Ticket titles & descriptions
const titles = [
  "Unable to login into my account",
  "Payment failed but money deducted",
  "App is crashing after update",
  "Need GST invoice urgently",
  "OTP not received on mobile",
  "Password reset link not working",
  "Account blocked without any reason",
  "Unable to upload documents",
  "Subscription not activated",
  "Email verification pending",
];

const descriptions = [
  "I have been trying to login since morning but it keeps showing invalid credentials.",
  "My money got deducted from UPI but the payment status still shows failed.",
  "After updating the app from Play Store, it crashes as soon as I open it.",
  "I need the GST invoice for my company accounts for last month.",
  "I am not receiving any OTP on my registered mobile number.",
  "The password reset email shows an invalid or expired link.",
  "My account got suspended suddenly without any email notification.",
  "The document upload gets stuck at 90% and never completes.",
  "I paid for the premium plan but it is still showing free plan.",
  "My email is verified but the app still asks for verification.",
];

// ✅ Typical support note responses
const noteTexts = [
  "Thank you for raising this issue. We are checking the logs and will update you shortly.",
  "We have forwarded this to our technical team. You will get an update soon.",
  "Please try logging out and logging in again and let us know if the issue persists.",
  "We have raised an internal ticket and are working on a fix.",
  "This seems to be affecting a few users. Our team is actively working on it.",
  "We apologize for the inconvenience. We will resolve this as soon as possible.",
  "Could you please share a screenshot of the error you are seeing?",
  "We have refreshed your account from our side. Please try again in a few minutes.",
];

// ✅ Create tables if not exist
const ensureSchema = async () => {
  console.log("🛠 Ensuring database schema exists...");

  // users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // tickets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      customer_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
  `);

  // notes table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("✅ Schema ready (users, tickets, notes)");
};

// ✅ Ensure agent users exist
const ensureAgentsExist = async () => {
  const agentIds = [];

  for (const agent of agents) {
    // simple default password for seeded agents
    const passwordHash = await bcrypt.hash("password123", 10);

    // ON CONFLICT to avoid duplicate inserts
    const res = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
      `,
      [agent.name, agent.email, passwordHash]
    );

    agentIds.push(res.rows[0].id);
  }

  return agentIds;
};

const main = async () => {
  try {
    console.log("🔄 Starting seed: creating schema + seeding data...");

    // 0️⃣ Ensure tables exist
    await ensureSchema();

    // 1️⃣ Ensure support agent users exist
    const agentIds = await ensureAgentsExist();
    console.log("✅ Agents ready:", agentIds);

    // 2️⃣ Seed tickets + notes
    for (let i = 0; i < 60; i++) {
      const customer = randomItem(customers);
      const title = randomItem(titles);
      const description = randomItem(descriptions);
      const status = randomItem(statuses);
      const priority = randomItem(priorities);
      const createdAt = randomRecentDate();

      // Insert ticket with created_at and updated_at (today or yesterday)
      const ticketResult = await pool.query(
        `
        INSERT INTO tickets 
          (title, description, customer_email, status, priority, created_at, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id;
        `,
        [title, description, customer.email, status, priority, createdAt]
      );

      const ticketId = ticketResult.rows[0].id;

      const noteCount = randomInt(0, 3);

      for (let j = 0; j < noteCount; j++) {
        const agentId = randomItem(agentIds);
        const noteText = randomItem(noteTexts);
        const noteCreatedAt = randomRecentDate();

        await pool.query(
          `
          INSERT INTO notes (ticket_id, user_id, text, created_at)
          VALUES ($1, $2, $3, $4);
          `,
          [ticketId, agentId, noteText, noteCreatedAt]
        );
      }
    }

    console.log("60 tickets (with random notes) seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

main();
