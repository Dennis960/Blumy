import cors from "cors";
import { json, Router } from "express";

const router = Router();
router.use(json());
router.use(cors());

// default 404 error page
router.use((req, res) => {
  res.status(404).send({ message: "This page does not exists", data: {} });
});

export default router;
