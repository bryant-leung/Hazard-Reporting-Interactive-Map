Since the .env file located in the backend is git ignored please create one in your local device's backend when running the website locally
Contents for .env:
DATABASE_URL=postgresql://postgres.yoznamxexwdohzfwzdkl:futureframeworks123%21@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=futureframeworks
NODE_PORT = 3000
PYTHON_PORT = 8000

How to run the website:
1. Make a new terminal and cd to backend
2. Run "node server.js" on backend terminal
3. Create another new terminal after backend has started running and cd to frontend on the new terminal
4. Run "npm run dev"


Installations/ Packages required for the website to run:
leaflet.heat/ node/ npm 


Supabase was used as the external database for this project