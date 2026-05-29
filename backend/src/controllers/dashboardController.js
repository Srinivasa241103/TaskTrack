import DashboardService from "../services/dashboardService.js";
import { AppError } from "../utils/AppError.js";

export default class Dashboard {
    constructor() {
        this.dashboardService = new DashboardService();
    }

    getData = async (req, res) => {
        const userId = req.user.userId;
        try {
            const dashboardData = await this.dashboardService.getData(userId);
            if (!dashboardData) {
                throw new AppError("No data found", 404);
            }
            res.status(200).json({
                success: true,
                message: "Dashboard data fetched successfully",
                data: dashboardData,
            });
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500;
            res.status(status).json({
                success: false,
                message: "Failed to fetch dashboard data",
                error: error.message,
            });
        }
    };
}