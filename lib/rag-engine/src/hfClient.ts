import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Delay the client initialization so it doesn't throw if env variables are missing at startup
let hfS3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!hfS3Client) {
    const accessKeyId = process.env.HF_S3_ACCESS_KEY;
    const secretAccessKey = process.env.HF_S3_SECRET_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Hugging Face S3 configuration is missing. Ensure HF_S3_ACCESS_KEY and HF_S3_SECRET_KEY are set.');
    }

    hfS3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'https://s3.hf.co/sudoai317',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return hfS3Client;
}

export async function getRawCourtFile(fileKey: string): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: 'courtlistner',
    Key: fileKey,
  });

  const response = await client.send(command);
  return (await response.body?.transformToString()) ?? '';
}
