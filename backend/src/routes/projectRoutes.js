import { Router } from "express";
import Projects from "../controllers/projectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const projects = new Projects();
const router = Router();

router.get("/", authMiddleware, projects.getProjects);
router.post("/", authMiddleware, projects.createProject);
router.post("/:id/members", authMiddleware, projects.addMember);

export default router;
