import AWS from 'aws-sdk';

// Function to initialize AWS and return S3 parameters
export async function awsinitialise(Key: string, Body: Buffer) {
  AWS.config.update({
    accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
  });

  const s3 = new AWS.S3();
  const params: AWS.S3.PutObjectRequest = {
    Bucket: 'testbucketassurepay',
    Key: Key,
    Body: Body,
  };

  return { params, s3 };
}


