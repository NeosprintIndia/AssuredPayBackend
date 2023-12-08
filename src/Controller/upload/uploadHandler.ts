import { awsinitialise } from '../../services/awsInitialise'; 
import UserKYC1 from '../../models/userKYCs';

  export const handledocsInternal = async (userId: string, originalName: string, buffer:Buffer,filename:any) => {
    const { params, s3 } = await awsinitialise(originalName, buffer);
    
  
    return new Promise<void>((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const updateData = { [filename]: data.Location }
          await UserKYC1.findOneAndUpdate(
            { user: userId },
             updateData,
            {new:true}
          );
          resolve();
        }
      });
    });
  };


  
  