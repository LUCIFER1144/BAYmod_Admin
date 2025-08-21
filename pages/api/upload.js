// pages/api/upload.js
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multiparty from 'multiparty';
import fs from 'fs';
import mime from 'mime-types';
// mongooseConnect is imported but not used in this specific file if it's only for R2 upload.
// If you need database interaction for upload (e.g., logging uploads), keep it.
// If not, it can be removed to reduce unnecessary connections. For now, assuming it's not needed here.
// import { mongooseConnect } from '@/lib/mongoose'; 

import { isAdminRequest } from "@/pages/api/auth/[...nextauth]"; // Import the admin check function

// Use the bucket name from environment variables for better flexibility,
// falling back to the hardcoded name if the env var isn't set.
const bucketName = process.env.R2_BUCKET_NAME || 'baymod-bucket'; 

export default async function handle(req,res) {
    // --- CRITICAL PROTECTION: ONLY ADMINS CAN ACCESS THIS API ROUTE ---
    // This try-catch block correctly handles the isAdminRequest,
    // preventing the API from crashing if the user is not an admin.
    try {
        // Only one call to isAdminRequest, and it must be awaited inside a try-catch.
        await isAdminRequest(req, res); 
    } catch (e) {
        // If isAdminRequest throws, it already handled sending the 401/403 response.
        // We just return here to stop further execution in this handler.
        return; 
    }
    // --- END PROTECTION ---

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

    console.log('length:', files.file.length); // Log file count for debugging

    // Configure the S3Client for Cloudflare R2
    const client = new S3Client({
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto', // Cloudflare R2 typically uses 'auto' region
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
        
        // Construct the public URL for the uploaded file.
        // Keeping your existing pattern, assuming you have a /api/image/[filename] route
        // for serving or proxying these images. If you intend to serve directly from R2,
        // this URL would be different, e.g., `https://{your_r2_domain}/${newFilename}`
        const link = `https://baymod-admin.vercel.app/api/image/${newFilename}`; 
        links.push(link);
    }
    
    // Return the list of public links for the uploaded files
    return res.json({links});
}

// Next.js specific configuration for API routes to handle file uploads
export const config = {
    api: {bodyParser: false}, // Disable Next.js's default body parser to handle file uploads
};
