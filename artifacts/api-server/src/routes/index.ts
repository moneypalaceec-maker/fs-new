import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import walletRouter from "./wallet";
import transactionsRouter from "./transactions";
import kycRouter from "./kyc";
import gamesRouter from "./games";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(walletRouter);
router.use(transactionsRouter);
router.use(kycRouter);
router.use(gamesRouter);
router.use(adminRouter);

export default router;
