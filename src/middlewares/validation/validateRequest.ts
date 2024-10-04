import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
    } else {
      next(); // Proceed to the next middleware/controller
    }
  };
};

export const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};
