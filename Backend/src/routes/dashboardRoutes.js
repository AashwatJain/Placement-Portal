
import express from "express";
import * as dashboard from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard/stats",     dashboard.getStats);
router.get("/dashboard/funnel",    dashboard.getFunnel);
router.get("/dashboard/branch",    dashboard.getBranchBreakdown);
router.get("/dashboard/trend",     dashboard.getMonthlyTrend);
router.get("/dashboard/packages",  dashboard.getPackageDistribution);
router.get("/dashboard/companies", dashboard.getTopCompanies);
router.get("/activity",            dashboard.getActivityFeed);

export default router;
