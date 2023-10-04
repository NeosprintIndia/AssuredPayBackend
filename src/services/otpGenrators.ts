import * as otpGenerator from 'otp-generator';

const OTP_LENGTH: number = 6;

export const generateOTP = (): string => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const numericOTP = Math.floor(Math.random() * (max - min + 1)) + min;
  return numericOTP.toString();
};