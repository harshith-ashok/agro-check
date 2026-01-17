import { Router } from "express";
import { pool } from "../db";
import { generateIdentityCode } from "../utils/identity";

const router = Router();

/**
 * Register a new user
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, name } = req.body;
    let identityCode = generateIdentityCode();

    // Ensure unique identity code
    let [existing]: any = await pool.query(
      "SELECT id FROM users WHERE identity_code = ?",
      [identityCode]
    );

    while (existing.length) {
      identityCode = generateIdentityCode();
      [existing] = await pool.query(
        "SELECT id FROM users WHERE identity_code = ?",
        [identityCode]
      );
    }

    const [result]: any = await pool.query(
      "INSERT INTO users (identity_code, email, name) VALUES (?, ?, ?)",
      [identityCode, email || null, name || null]
    );

    res.json({ user: identityCode });
  } catch (err) {
    next(err);
  }
});

/**
 * Login using identity code
 */
router.post("/login", async (req, res, next) => {
  try {
    const { identityCode, identity_code } = req.body;
    const code = identityCode || identity_code; // frontend sends identityCode

    if (!code) return res.status(400).json({ error: "Identity code required" });

    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE identity_code = ?",
      [code.toUpperCase()]
    );

    if (!rows.length) return res.status(401).json({ error: "Invalid code" });

    const user = rows[0];

    // Update last login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json(user); // frontend expects full user object
  } catch (err) {
    next(err);
  }
});

/**
 * Verify if identity code exists
 */
router.post("/verify", async (req, res, next) => {
  try {
    const { identityCode, identity_code } = req.body;
    const code = identityCode || identity_code;

    if (!code) return res.status(400).json({ error: "Identity code required" });

    const [rows]: any = await pool.query(
      "SELECT id FROM users WHERE identity_code = ?",
      [code.toUpperCase()]
    );

    res.json({ exists: rows.length > 0 });
  } catch (err) {
    next(err);
  }
});

export default router;
