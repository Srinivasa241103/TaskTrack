import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


import healthRoutes from "./src/routes/healthRoutes.js";
import userRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import usersRoutes from "./src/routes/usersRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/tasks", taskRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
    const frontendDist = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendDist));
    
    app.get("*", (req, res) => {
        if (req.originalUrl.startsWith("/api")) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }
        res.sendFile(path.join(frontendDist, "index.html"));
    });
}

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

export default app;
