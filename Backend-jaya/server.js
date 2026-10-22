// ✅ CRITICAL: Load environment variables FIRST (static imports run in order,
// so this must be the first import, before cloudinary / models / app)
import "dotenv/config";
import dns from "node:dns";


import { connectDB } from "./config/db.js";
import app from "./app.js";
import { seedDefaultUsers } from "./controller/userController.js";


dns.setServers(["8.8.8.8", "1.1.1.1"]);
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await seedDefaultUsers(); // default admin + demo user

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
};

startServer();
