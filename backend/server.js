import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from './authentication/authMiddleware.js';

dotenv.config();


const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Change this to your actual Frontend URL
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to Supabase postgresql database using connection string
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// checks to verify backend is connected to supabase cloud
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Supabase Connection Error:", err.message);
    } else {
        console.log("Connected to Supabase at:", res.rows[0].now);
    }
});

// allow residents and admins to create accounts
// Added password hashing as well
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // password scrambling encryption
        await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
            [email, hashedPassword, role || "resident"]
        );
        res.status(201).send("User registered!");
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// Login function that checks email and password against the database and returns user data (including role) if successful
// In a nutshell authenticates users and provides role for RBAC.
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        // text pw vs encrypted pw comparison
        if (user && await bcrypt.compare(password, user.password_hash)) {
            
            // jwt token generation
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            // Return user alongside token
            res.json({
                token: token,
                id: user.id,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Link complaint to a specific user using foreign keys
// Allows users to report hazards
app.post("/report-hazard", verifyToken, async (req, res) => {
    const { reporter_user_id, category, description, latitude, longitude } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO hazards (reporter_user_id, category, description, status, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [reporter_user_id, category, description, "Reported"]
        );
        res.status(201).json({ message: "Hazard reported!", data: result.rows[0] });
    } catch (err) {
        console.error("Hazard Error:", err.message);
        res.status(500).send("Error logging hazard: " + err.message);
    }
});

// Allow admins to view all reported hazards with reporter info
app.get("/admin/view-hazards", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.id, h.category, h.description, h.status, u.email as reporter_email
            FROM hazards h
            JOIN users u ON h.reporter_user_id = u.id
            ORDER BY h.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Collation Error: " + err.message);
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});