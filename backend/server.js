import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3)",
            [email, password, role || "resident"]
        );

        res.status(201).send("User registered in Supabase!");
    } catch (err) {
        console.error("DEBUG Error:", err.message);
        res.status(500).send("Database Error: " + err.message);
    }
});
// Login function that checks email and password against the database and returns user data (including role) if successful
// In a nutshell authenticates users and provides role for RBAC.
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Query the database for the user
        const result = await pool.query(
            "SELECT id, email, role FROM users WHERE email = $1 AND password_hash = $2",
            [email, password]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]); // Send back the user data (id, email, role)
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Link complaint to a specific user using foreign keys
// Allows users to report hazards
app.post("/hazards", async (req, res) => {
    const { reporter_user_id, category, description } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO hazards (reporter_user_id, category, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [reporter_user_id, category, description, "Pending"]
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