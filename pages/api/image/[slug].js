import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const client = new S3Client({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export default async function handler(req, res) {
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).send('Filename not provided');
    }

    try {
        const command = new GetObjectCommand({
            Bucket: 'baymod-bucket',
            Key: slug,
        });

        const response = await client.send(command);

        res.setHeader('Content-Type', response.ContentType);
        res.setHeader('Content-Length', response.ContentLength);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        await pipeline(response.Body, res);

    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(404).send('Not Found');
    }
}