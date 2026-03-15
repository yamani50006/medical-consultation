import { Router } from "express";
import symptomsController from "./symptoms.controller.js";
import { analyzeSymptomsSchema, validate } from "./symptoms.validator.js";

const router = Router();

router.post("/analyze", validate(analyzeSymptomsSchema), symptomsController.analyzeSymptoms);

export default router;
