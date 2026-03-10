import express from "express";
import pg from "pg";
import fs from "fs";
import cors from "cors";

// This part was prompted using generative AI using:
// I want userList to be a list that updates automatically from the website when a user is created, as well as have a seperate log for developer userLists

const app = express();
app.use(express.json()); 
app.use(cors());        

// 1. Connect to the database future_frameworks I initialised just now
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'future_frameworks',
    password: '', // Empty now 
    port: 5432,
});

// 2. The "Auto-Update" Function
const updateCSVFiles = async () => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        
        // Public List 
        const publicHeader = "id,email,role,created_at\n";
        const publicRows = result.rows.map(u => `${u.id},${u.email},${u.role},${u.created_at}`).join("\n");
        fs.writeFileSync("./userList.csv", publicHeader + publicRows);

        // Developer Log 
        const devHeader = "id,email,password_hash,role,created_at\n";
        const devRows = result.rows.map(u => `${u.id},${u.email},${u.password_hash},${u.role},${u.created_at}`).join("\n");
        fs.writeFileSync("./developer_log.csv", devHeader + devRows);
        
        console.log("CSV Files updated successfully!");
    } catch (err) {
        console.error("Error updating CSVs:", err);
    }
};

// 3. The "Register" Route -> the seperate route when someone signs up
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Save to Database
        await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
            [email, password, role]
        );

        // auto update function
        await updateCSVFiles();

        res.status(201).send("User registered and logs updated!");
    } catch (err) {
        res.status(500).send("Error saving user");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
