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
import * as db from './db.js'
import { Profanity } from '@2toad/profanity';

const profanity = new Profanity();

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
        await db.register_user(email, hashedPassword, role || "resident");
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
        const result = await db.get_user(email);
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
        const result = await db.insert_hazard(reporter_user_id, hazard_category, severity, description, latitude, longitude, finalLocation, imageUrl);
        res.status(201).json({ message: "Hazard reported!", data: result.rows[0] });
    } catch (err) {
        console.error("Hazard Error:", err.message);
        res.status(500).send("Error logging hazard: " + err.message);
    }
});

app.get("/heatmap-data", async (req, res) => {
    const { start_time, end_time } = req.query;
    try {
        const result = await db.get_heatmap_data(start_time, end_time);
        res.json(result.rows.map(row => ({
            id: row.id,
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            cat: row.category,
            desc: row.description,
            status: row.status,
            value: row.severity,
            location: row.location_name,
            imageUrl: row.image_url
        })));
    } catch (err) {
        res.status(500).send("Collation Error: " + err.message);
    }
});

app.get("/notifications", verifyToken, async (req, res) => {
    try {
        const result = await db.get_notifications(req.user.id);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Error fetching notifications: " + err.message);
    }
});

app.get("/chat-messages", async (req, res) => {
    const { reportId, sort } = req.query;
    try {
        const result = await db.get_chat_messages(reportId,sort);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Error fetching chat messages: " + err.message);
    }
});

app.post("/send-messages", verifyToken, async (req, res) => {
    const { user_id, hazard_id, message } = req.body;
    try {
        const result = await db.send_messages(user_id, hazard_id, message);
        console.log("New chat message logged:", result.rows[0]);     
        const hazardInfo = await pool.query("SELECT reporter_user_id FROM hazards WHERE id = $1", [hazard_id]);
        if (hazardInfo.rows.length > 0 && hazardInfo.rows[0].reporter_user_id !== user_id) {
            await db.insert_notification(
                hazardInfo.rows[0].reporter_user_id,
                `New comment on your report: "${profanity.censor(message.substring(0, 20))}..."`,
                'new_comment'
            );
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Error posting chat message: " + err.message);
    }
});

app.post("/update-vote", verifyToken, async (req, res) => {
    const { message_id, user_id } = req.body;
    try {
        const voted = await db.check_voted(message_id, user_id);
        let updatedMessage;
        let voteRecord = null;
        let action;
        if (voted.rows.length > 0) {
            updatedMessage = await db.decrement_vote(message_id);
            await db.delete_vote(message_id, user_id);
            action = "removed";
        } else {
            updatedMessage = await db.increment_vote(message_id);
            voteRecord = await db.insert_vote(message_id, user_id);
            action = "added";

            const authorInfo = await db.get_message_author(message_id);
            if (authorInfo.rows.length > 0 && authorInfo.rows[0].user_id !== user_id) {
                await db.insert_notification(
                    authorInfo.rows[0].user_id,
                    `Someone liked your comment: "${authorInfo.rows[0].message.substring(0, 20)}..."`,
                    'comment_like'
                );
            }
        }
        res.status(200).json({
            action,
            updatedMessage: updatedMessage.rows[0],
            voteRecord: voteRecord ? voteRecord.rows[0] : null
        });

    } catch (err) {
        res.status(500).send("Error updating vote: " + err.message);
    }
});

// Allow admins to view all reported hazards with reporter info
app.get("/admin/view-hazards", verifyToken, async (req, res) => {
    try {
        const result = await db.get_all_hazards();
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
        const currentData = await db.get_hazard_by_id(id);
        if (currentData.rows.length === 0) return res.status(404).send("Hazard not found");
        const old_status = currentData.rows[0].status;
        const reporter_id = currentData.rows[0].reporter_user_id;
        const hazard_desc = currentData.rows[0].description;

        await db.update_hazard(status, description, severity, id);

        await db.log_status_update(id, staff_id, old_status, status, note || "Status updated via dashboard")
        if (old_status !== status) {
            await pool.query(
                "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
                [reporter_id, `Update: Your report "${hazard_desc.substring(0, 20)}..." is now ${status}.`, 'status_change']
            );
        }

        res.json({ message: "Update successful and logged" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete("/admin/delete-hazard/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete_hazard(id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/my-reports', verifyToken, async (req, res) => {
  try {
    const result = await db.get_my_reports(req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error("My Reports Error:", err.message);
    res.status(500).send("Server Error");
  }
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
}