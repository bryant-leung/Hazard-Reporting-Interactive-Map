import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const register_user = (email, hashedPassword, role) => {
    return pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
        [email, hashedPassword, role || "resident"]
    );
}

export const get_user = (email) => {
    return pool.query("SELECT * FROM users WHERE email = $1", [email]);
}

export const insert_hazard = (reporter_user_id, category, severity, description, latitude, longitude, location_name, imageUrl) => {
    return pool.query(
        "INSERT INTO hazards (reporter_user_id, category, severity, description, status, latitude, longitude, location_name, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [reporter_user_id, category, severity, description, "Reported", latitude, longitude, location_name, imageUrl]
    );
}

export const get_heatmap_data = (start_time, end_time) => {
    let queryText = "SELECT id, latitude, longitude, category, description, status, severity, location_name, image_url FROM hazards WHERE status != 'Fixed'";
    let params = [];
    if (start_time && end_time) {
        queryText += " AND created_at BETWEEN $1 AND $2";
        params = [start_time, end_time];
    }
    return pool.query(queryText, params);
}

export const get_chat_messages = (reportId, sort) => {
    let queryText = "SELECT c.message_id, c.created_at, c.message, u.email, c.vote FROM chat_message c, users u WHERE c.hazard_id = $1 AND c.user_id = u.id";
    if (sort === "newest") {
        queryText += " ORDER BY c.created_at DESC";
    } else if (sort === "oldest") {
        queryText += " ORDER BY c.created_at ASC";
    } else if (sort === "hot") {
        queryText += " ORDER BY c.vote DESC";
    }
    return pool.query(queryText, [reportId]);
}

export const send_messages = (user_id, hazard_id, message) => {
    return pool.query(
        "INSERT INTO chat_message (user_id, hazard_id, message) VALUES ($1, $2, $3) RETURNING *",
        [user_id, hazard_id, message]
    );
}

export const check_voted = (message_id, user_id) => {
    return pool.query(
        "SELECT * FROM voted WHERE message_id = $1 AND user_id = $2",
        [message_id, user_id]
    );
}

export const decrement_vote = (message_id) => {
    return pool.query(
        "UPDATE chat_message SET vote = vote - 1 WHERE message_id = $1 RETURNING *",
        [message_id]
    );
}

export const delete_vote = (message_id, user_id) => {
    return pool.query(
        "DELETE FROM voted WHERE message_id = $1 AND user_id = $2 RETURNING *",
        [message_id, user_id]
    );
}

export const increment_vote = (message_id) => {
    return pool.query(
        "UPDATE chat_message SET vote = vote + 1 WHERE message_id = $1 RETURNING *",
        [message_id]
    );
}

export const insert_vote = (message_id, user_id) => {
    return pool.query(
        "INSERT INTO voted (message_id, user_id) VALUES ($1, $2) RETURNING *",
        [message_id, user_id]
    );
}

export const get_all_hazards = () => {
    return pool.query(`
        SELECT
            h.id,
            h.category,
            h.description,
            h.severity,
            h.status,
            h.latitude,
            h.longitude,
            h.location_name,
            h.image_url,
            u.email as reporter_email
        FROM hazards h
        LEFT JOIN users u ON h.reporter_user_id = u.id
        ORDER BY h.created_at DESC
    `);
}

export const get_hazard_by_id = (id) => {
    return pool.query(
        "SELECT status, reporter_user_id, description FROM hazards WHERE id = $1",
        [id]
    );
}

export const update_hazard = (status, description, severity, id) => {
    return pool.query(
        "UPDATE hazards SET status = $1, description = $2, severity = $3 WHERE id = $4",
        [status, description, severity, id]
    );
}

export const log_status_update = (hazard_id, staff_id, old_status, new_status, note) => {
    return pool.query(
        "INSERT INTO status_updates (hazard_id, staff_user_id, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5)",
        [hazard_id, staff_id, old_status, new_status, note]
    );
}

export const delete_hazard = (id) => {
    return pool.query("DELETE FROM hazards WHERE id = $1", [id]);
}

export const get_my_reports = (user_id) => {
    return pool.query(
        "SELECT * FROM hazards WHERE reporter_user_id = $1 ORDER BY created_at DESC",
        [user_id]
    );
}

export const get_notifications = (user_id) => {
    return pool.query(
        `SELECT n.*, h.location_name, h.category as hazard_cat
         FROM notifications n 
         LEFT JOIN hazards h ON n.hazard_id = h.id 
         WHERE n.user_id = $1 
         ORDER BY n.created_at DESC`,
        [user_id]
    );
}

export const insert_notification = async (user_id, message, type, hazard_id = null) => {
    return await pool.query(
        "INSERT INTO notifications (user_id, message, type, hazard_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, message, type, hazard_id]
    );
};

export const get_hazard_reporter = (hazard_id) => {
    return pool.query(
        "SELECT reporter_user_id FROM hazards WHERE id = $1",
        [hazard_id]
    );
}

export const get_message_author = (message_id) => {
    return pool.query(
        "SELECT user_id, message FROM chat_message WHERE message_id = $1",
        [message_id]
    );
}









