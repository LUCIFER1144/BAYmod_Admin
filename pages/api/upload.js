// pages/api/upload.js
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multiparty from 'multiparty';
import fs from 'fs';
import mime from 'mime-types';
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]"; 
const bucketName = process.env.R2_BUCKET_NAME || 'baymod-bucket'; 

export default async function handle(req,res) {
    
    try {
        
        await isAdminRequest(req, res); 
    } catch (e) {
        
        return; 
    }
    

    // Parse the incoming form data (for file uploads)
    const form = new multiparty.Form();
    const {fields,files} = await new Promise((resolve,reject) => {
        form.parse(req, (err, fields, files) =>{
            if (err) {
                console.error("Multiparty parse error:", err);
                return reject(err);
            }
            resolve({fields,files});
        });
    });

    console.log('length:', files.file.length); 

    // Configure the S3Client for Cloudflare R2
    const client = new S3Client({
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto', 
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });

    const links = [];
    // Loop through each uploaded file
    for(const file of files.file){
        const ext = file.originalFilename.split('.').pop(); // Get file extension
        const newFilename = Date.now() + '-' + file.originalFilename.replace(/[^a-z0-9.]/gi, '_') + '.' + ext; // More robust unique filename

        // Upload the file to R2
        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: newFilename,
            Body: fs.readFileSync(file.path),
            ACL: 'public-read', // Make the uploaded file publicly readable
            ContentType: mime.lookup(file.path), // Determine content type
        }));
        
        
        const link = `https://baymod-admin.vercel.app/api/image/${newFilename}`; 
        links.push(link);
    }
    
    // Return the list of public links for the uploaded files
    return res.json({links});
}


export const config = {
    api: {bodyParser: false},
};
