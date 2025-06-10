import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express'
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import cron from "node-cron";
import fs from "fs";

import { clerkClient, requireAuth, getAuth } from '@clerk/express'


import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user-Routes.js"
import adminRoutes from "./routes/admin-Routes.js"
import authRoutes from "./routes/auth-Routes.js"
import songRoutes from "./routes/song-Routers.js"
import albumRoutes from "./routes/album-Routes.js"
import statRoutes from "./routes/stat-Routes.js"


dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;


const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(clerkMiddleware());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname,"tmp"),
    createParentPath: true,
    limits:{
        fileSize: 10 * 1024 * 1024 // 10MB
    }
}));


const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});


app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("/*splat", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

app.use((error,req,res,next) => {
    res.status(500).json({message: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error"});
})

httpServer.listen(PORT, ()=>{
    console.log("Server is running on port 5000");
    connectDB();
})