import { awsinitialise } from '../../Services/awsInitialise'; 
import UserKYC1 from '../../Models/userKYCs';
// Function to handle file upload and AWS S3 upload

export const handleS1FileUpload = async (userId: string, originalName: string, buffer: Buffer) => {
    const { params, s3 } = await awsinitialise(originalName, buffer);
  
    return new Promise<void>((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            { user: userId },
            { $set: { aadharFileUrl: data.Location } }
          );
          resolve();
        }
      });
    });
  };

  export const handleS2FileUpload = async (userId: string, originalName: string, buffer: Buffer) => {
    const { params, s3 } = await awsinitialise(originalName, buffer);
  
    return new Promise<void>((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            { user: userId },
            { $set: { aadharBackUrl: data.Location } }
          );
          resolve();
        }
      });
    });
  }; 
  
  export const handlePanFileUpload = async (userId: string, originalName: string, buffer: Buffer) => {
    const { params, s3 } = await awsinitialise(originalName, buffer);
  
    return new Promise<void>((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            { user: userId },
            { $set: { PANFile: data.Location } }
          );
          resolve();
        }
      });
    });
  };   

  export const handleGSTFileUpload = async (userId: string, originalName: string, buffer: Buffer) => {
    const { params, s3 } = await awsinitialise(originalName, buffer);
  
    return new Promise<void>((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const updatedUserKYC1 = await UserKYC1.findOneAndUpdate(
            { user: userId },
            { $set: { GSTFILE: data.Location } }
          );
          resolve();
        }
      });
    });
  };
  
  