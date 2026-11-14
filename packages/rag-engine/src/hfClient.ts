/**
 * Hugging Face S3-compatible storage (hf.co buckets).
 * Credentials and endpoint come from env — never hardcode secrets.
 *
 * Env:
 *   HF_S3_ACCESS_KEY
 *   HF_S3_SECRET_KEY
 *   HF_S3_ENDPOINT   (default https://s3.hf.co/<org-or-namespace>)
 *   HF_S3_BUCKET     (default from HF_S3_BUCKET or 'courtlistner')
 *   HF_S3_REGION     (default us-east-1)
 */
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

let hfS3Client: S3Client | null = null;

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`${name} is required for Hugging Face S3 access`);
  }
  return v;
}

function getS3Client(): S3Client {
  if (!hfS3Client) {
    const accessKeyId = requireEnv('HF_S3_ACCESS_KEY');
    const secretAccessKey = requireEnv('HF_S3_SECRET_KEY');
    const endpoint =
      process.env.HF_S3_ENDPOINT?.trim() ||
      process.env.HF_ENDPOINT?.trim() ||
      'https://s3.hf.co';
    const region = process.env.HF_S3_REGION?.trim() || 'us-east-1';

    hfS3Client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return hfS3Client;
}

function bucketName(): string {
  return process.env.HF_S3_BUCKET?.trim() || 'courtlistner';
}

export async function getRawCourtFile(fileKey: string): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName(),
    Key: fileKey,
  });
  const response = await client.send(command);
  return (await response.Body?.transformToString()) ?? '';
}

/** Upload JSONL / report blob to HF bucket (training exports, research packets). */
export async function putHfObject(
  fileKey: string,
  body: string | Uint8Array,
  contentType = 'application/octet-stream',
): Promise<{ bucket: string; key: string }> {
  const client = getS3Client();
  const bucket = bucketName();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: body,
      ContentType: contentType,
    }),
  );
  return { bucket, key: fileKey };
}

export async function listHfPrefix(prefix: string, maxKeys = 100): Promise<string[]> {
  const client = getS3Client();
  const out = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName(),
      Prefix: prefix,
      MaxKeys: maxKeys,
    }),
  );
  return (out.Contents ?? []).map((o) => o.Key!).filter(Boolean);
}
