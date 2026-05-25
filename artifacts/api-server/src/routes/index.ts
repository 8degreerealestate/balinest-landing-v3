import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import unitsRouter from "./units";
import blogRouter from "./blog";
import enquiriesRouter from "./enquiries";
import testimonialsRouter from "./testimonials";
import statsRouter from "./stats";
import guidesRouter from "./guides";
import contentRouter from "./content";
import inventoryRouter from "./inventory";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(unitsRouter);
router.use(blogRouter);
router.use(enquiriesRouter);
router.use(testimonialsRouter);
router.use(statsRouter);
router.use(guidesRouter);
router.use(contentRouter);
router.use(inventoryRouter);

export default router;
