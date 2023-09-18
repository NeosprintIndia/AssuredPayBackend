import { Request, Response, NextFunction } from 'express';
import { validationResult, check } from 'express-validator';

// Create a custom validation middleware for registration
const registrationValidator = [
  check('business_email')
    .isEmail()
    .withMessage('Please provide a valid business email address.'),

  check('username')
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters long.'),

  check('business_mobile')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid mobile phone number.'),

    check('password')
    .isLength({ min: 8 }) // At least 8 characters long
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) // Contains at least one uppercase letter, one lowercase letter, one digit, and one special character
    .withMessage('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'),

  check('refferal_code')
    .optional()
    .isAlphanumeric()
    .withMessage('Referral code must be alphanumeric.')
];

// Middleware to handle validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware to check for unexpected properties in the request body
const checkForUnexpectedProperties = (allowedProperties: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const unexpectedProperties = Object.keys(req.body).filter(property => !allowedProperties.includes(property));
  
      if (unexpectedProperties.length > 0) {
        return res.status(400).json({ error: `Unexpected properties in the request body: ${unexpectedProperties.join(', ')}` });
      }
  
      next();
    };
  };




export {
  registrationValidator,
  handleValidationErrors,
  checkForUnexpectedProperties 
};
