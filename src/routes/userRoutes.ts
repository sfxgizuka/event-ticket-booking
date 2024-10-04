// src/routes/userRoutes.ts
import express from 'express';
import { login, signup } from '../controllers/userController';
import { validateSignup } from '../middlewares/validation/validateRequest';

const router = express.Router();

// Signup route
router.post('/signup', validateSignup, signup);

// Login route
router.post('/login', login);

export default router;
