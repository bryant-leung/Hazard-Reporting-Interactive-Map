# CivicTrace 
CivicTrace is a web based public space safety platform enabling Birmingham residents to report hazards, visualise risk hotspots on an interactive heatmap, and track resolution progress, while giving council staff the tools to prioritise and manage issues effectively. The system directly addresses SDG 11 by promoting inclusive, safe, and resilient urban communities through civic transparency and data driven decision making.

---

## Tech Stack & Requirements
To run this project locally, ensure you have the following installed:

* **Node.js** (v18 or higher)
* **PostgreSQL 16** (Managed via Supabase)
* **Frontend:** React.js, Leaflet.js (Mapping), CSS
* **Backend:** Node.js, Express.js
* **Security:** JSON Web Tokens (JWT), Bcrypt.js (Hashing)
* **Storage:** Multer (Image Handling), Supabase Storage

---

## 🚀 Getting Started

### 1. Database Setup
CivicTrace uses **Supabase** for cloud storage.
* The database schema and initial table setup can be found in: `backend/database/schema.sql`.
* Ensure your `.env` file points to a valid PostgreSQL instance.

### 2. Environment Configuration
Create a file named `.env` in the `/backend` directory and add the following:

```properties
DATABASE_URL=postgresql://postgres.yoznamxexwdohzfwzdkl:futureframeworks123%21@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=futureframeworks
NODE_PORT=3000
```

### 3. Installation & Local Execution
You will need **two terminals** running simultaneously to start the full stack.

**Terminal 1: Backend Server**
```bash
# Navigate to the backend directory
cd backend

# Install necessary dependencies
npm install express pg cors dotenv bcryptjs multer jsonwebtoken

# Start the Node.js server
node server.js
```

**Terminal 2: Frontend Server**
```bash
# Navigate to the frontend directory
cd frontend

# Install frontend packages
npm install

# Start the development server
npm run dev
``` 
Once both are running, access the app at: http://localhost:5173

Ensure your .env file is created in the /backend directory before starting the server.