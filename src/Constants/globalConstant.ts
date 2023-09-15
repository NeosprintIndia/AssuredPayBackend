import dotenv from 'dotenv';

dotenv.config();

export const OTP_LENGTH: number = 10;

export const OTP_CONFIG: {
  upperCaseAlphabets: boolean;
  specialChars: boolean;
} = {
  upperCaseAlphabets: false,
  specialChars: false,
};

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