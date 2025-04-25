import { Router } from "express";
import { addFeedback, getFeedback } from "../controllers/feedback.controller.js";
import auth from "../middleware/auth.middleware.js"

const feedbackRouter = Router()

feedbackRouter.post('/add-feedback',auth,addFeedback);
feedbackRouter.get('/get-feedback',auth,getFeedback);

export default feedbackRouter