import dotenv from 'dotenv';

dotenv.config();
export const MAIL_SETTINGS: {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
} = {
  service: 'gmail',
  auth: {
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
};