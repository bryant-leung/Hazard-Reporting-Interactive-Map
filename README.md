Since the .env file located in the backend is git ignored please create one in your local device's backend when running the website locally
Contents for .env:

DATABASE_URL=postgresql://postgres.yoznamxexwdohzfwzdkl:futureframeworks123%21@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=futureframeworks
NODE_PORT = 3000
PYTHON_PORT = 8000

How to get this website running locally on your device:
-- Open 2 empty terminals first
1. Backend
- `cd backend`
- Install: `npm install express pg cors dotenv bcryptjs multer jsonwebtoken`
- Run: `node server.js`

2. Frontend
- `cd frontend`
- Install: `npm install`
- Run: `npm run dev`

***Ensure your `.env` file is created in the `/backend` directory before starting the server.*

Once both terminals are running, open your browser and go to: http://localhost:5173


Installations/ Packages required for the website to run:

Core packages:
Mapping: leaflet, leaflet.heat for geospatial visualisation
Security: bcrypt.js (Password Hashing), jsonwebtoken (Authentication)
File Handling (Image Uploading): multer

Sometimes code fails because of Node being in older versions,
Requirement: Node.js (v18 or higher)


Supabase was used as the external database for this project
Supabase ensures user accounts and hazard reports remain saved even if the local server is restarted.
A copy of the code we have in the SQL Editor inside Supabase is stored in backend/database/schema.sql

Even though the registration for new users does work on the login page, here are some account details you might find useful for testing:

Resident:
futureframeworkstest@gmail.com
password: futureframeworks

Staff:
staff@gmail.com
password: staffs


