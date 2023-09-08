import * as otpGenerator from 'otp-generator';
import { OTP_LENGTH, OTP_CONFIG } from '../Constants/Constants';

export function generateOTP(): string {
  const OTP: string = otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
  return OTP;
}