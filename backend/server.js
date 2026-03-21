import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import verifyToken from './authentication/authMiddleware.js';

dotenv.config();

const PORT = process.env.NODE_PORT || 3000;


const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// For image uploading
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

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
// Combined logic: This now supports both the Manual Form and the Python-style Map Pins
app.post("/report-hazard", verifyToken, upload.single('hazard_image'), async (req, res) => {
    const { reporter_user_id, hazard_category, severity, description, latitude, longitude, location_name } = req.body;
    
    // Safety check: if location_name is missing (common with map pins), give it a default
    const finalLocation = location_name || "Map Pin Location";
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = await pool.query(
            "INSERT INTO hazards (reporter_user_id, category, severity, description, status, latitude, longitude, location_name, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [reporter_user_id, hazard_category, severity, description, "Reported", latitude, longitude, finalLocation, imageUrl]
        );
        res.status(201).json({ message: "Hazard reported!", data: result.rows[0] });
    } catch (err) {
        console.error("Hazard Error:", err.message);
        res.status(500).send("Error logging hazard: " + err.message);
    }
});

app.get("/heatmap-data", async (req, res) => {
    const { start_time, end_time } = req.query;
    try {
        let queryText = "SELECT latitude, longitude, category, description, status, severity FROM hazards";
        let params = [];
        if (start_time && end_time) {
            queryText += " WHERE created_at BETWEEN $1 AND $2";
            params = [start_time, end_time];
        }
        const result = await pool.query(queryText, params);
        res.json(result.rows.map(row => ({
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            cat: row.category,
            desc: row.description,
            status: row.status,
            value: row.severity
        })));
    } catch (err) {
        res.status(500).send("Collation Error: " + err.message);
    }
});

// Allow admins to view all reported hazards with reporter info
app.get("/admin/view-hazards", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                h.id, 
                h.category, 
                h.description,
                h.severity, 
                h.status, 
                h.latitude, 
                h.longitude, 
                h.location_name, 
                h.image_url, -- THIS WAS MISSING
                u.email as reporter_email
            FROM hazards h
            LEFT JOIN users u ON h.reporter_user_id = u.id
            ORDER BY h.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Collation Error: " + err.message);
    }
});

// Update hazard status and log the change in status_updates for audit trail
app.put("/admin/update-hazard/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status, description, note, severity } = req.body;
    const staff_id = req.user.id; 

    try {
        const currentData = await pool.query("SELECT status FROM hazards WHERE id = $1", [id]);
        if (currentData.rows.length === 0) return res.status(404).send("Hazard not found");
        const old_status = currentData.rows[0].status;

        await pool.query(
            "UPDATE hazards SET status = $1, description = $2, severity = $4 WHERE id = $3",
            [status, description, severity, id]
        );

        await pool.query(
            "INSERT INTO status_updates (hazard_id, staff_user_id, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5)",
            [id, staff_id, old_status, status, note || "Status updated via dashboard"]
        );

        res.json({ message: "Update successful and logged" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete("/admin/delete-hazard/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM hazards WHERE id = $1", [id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});