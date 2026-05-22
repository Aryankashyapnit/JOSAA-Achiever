import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import collegesRouter from "./colleges";
import cutoffsRouter from "./cutoffs";
import predictorRouter from "./predictor";
import counsellingRouter from "./counselling";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import aboutRouter from "./about";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(collegesRouter);
router.use(cutoffsRouter);
router.use(predictorRouter);
router.use(counsellingRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(aboutRouter);

export default router;
