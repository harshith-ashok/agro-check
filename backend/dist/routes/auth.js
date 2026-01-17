"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const identity_1 = require("../utils/identity");
const router = (0, express_1.Router)();
router.post("/register", async (req, res, next) => {
    try {
        const { email, name } = req.body;
        let identityCode = (0, identity_1.generateIdentityCode)();
        const [existing] = await db_1.pool.query("SELECT id FROM users WHERE identity_code = ?", [identityCode]);
        if (existing.length)
            identityCode = (0, identity_1.generateIdentityCode)();
        await db_1.pool.query("INSERT INTO users (identity_code, email, name) VALUES (?, ?, ?)", [identityCode, email, name]);
        res.json({ identity_code: identityCode });
    }
    catch (err) {
        next(err);
    }
});
router.post("/login", async (req, res, next) => {
    try {
        const { identity_code } = req.body;
        const [rows] = await db_1.pool.query("SELECT * FROM users WHERE identity_code = ?", [identity_code]);
        if (!rows.length)
            return res.status(401).json({ error: "Invalid code" });
        await db_1.pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
            rows[0].id,
        ]);
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});
router.post("/verify", async (req, res, next) => {
    try {
        const { identity_code } = req.body;
        const [rows] = await db_1.pool.query("SELECT id FROM users WHERE identity_code = ?", [identity_code]);
        res.json({ exists: rows.length > 0 });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
