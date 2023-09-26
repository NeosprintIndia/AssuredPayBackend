import * as otpGenerator from 'otp-generator';


//import { OTP_LENGTH, OTP_CONFIG } from '../constants/globalConstant';

// export function generateOTP(): string {
//   const OTP: string = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
//   return OTP;
// }

const OTP_LENGTH: number = 6;

export const generateOTP = (): string => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const numericOTP = Math.floor(Math.random() * (max - min + 1)) + min;
  return numericOTP.toString();
};