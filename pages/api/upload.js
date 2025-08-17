import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multiparty from 'multiparty';
import fs from 'fs';
import mime from 'mime-types';
const bucketName = 'baymod-bucket';
export default async function handle(req,res) {
    const form = new multiparty.Form();
    const {fields,files} = await new Promise((resolve,reject) => 
        {
            form.parse(req, (err, fields, files) =>{
            if (err) reject(err);
            resolve({fields,files});
            
        });
    });
    console.log('length:', files.file.length);
    
    const client = new S3Client({
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto',
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
    const links = [];
    for(const file of files.file){
        const ext = file.originalFilename.split('.').pop();
        const newFilename = Date.now() + '.' + ext;
        console.log({ext,file});
        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: newFilename,
            Body: fs.readFileSync(file.path),
            
            ContentType: mime.lookup(file.path),
            
        }));
        const link = `https://baymod-admin.vercel.app/${newFilename}`;
        links.push(link);
    }
    
    return res.json({links});
}
export const config = {
    api: {bodyParser: false},
};