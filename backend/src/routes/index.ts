import { Router } from "express";
import {
  postCall,
  getCalls,
  getCallById,
  getCallMoments,
} from "../controllers/calls.controller";

const router = Router();

router.post("/calls", postCall);
router.get("/calls", getCalls);
router.get("/calls/:id", getCallById);
router.get("/calls/:id/moments", getCallMoments);

export default router;
