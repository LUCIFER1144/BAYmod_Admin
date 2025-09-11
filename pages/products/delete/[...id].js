// pages/products/delete/[...id].js
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import axios from "axios"; // Keep axios for the DELETE API call

// Removed useEffect and useState as product data is fetched server-side
// import { useEffect, useState } from "react"; 

// Import necessary modules for server-side session and data fetching
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Ensure this path is correct
import { mongooseConnect } from "@/lib/mongoose"; // Ensure this path is correct for your Mongoose connection
import { Product } from "@/models/Product"; // Ensure this path is correct for your Product model
import { useTranslation } from "@/lib/Translation";
import { Setting } from "@/models/Setting";

// --- getServerSideProps for server-side access control and data fetching ---
// This function runs exclusively on the server-side for every request to this page.
export async function getServerSideProps(context) {
    // 1. Server-side session check for admin access
    const session = await getServerSession(context.req, context.res, authOptions);

    // If there's no session (user is not logged in) OR the logged-in user is NOT an admin,
    // redirect them to the /access-denied page.
    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied', // Redirect to the custom access denied page
                permanent: false, // Not a permanent redirect (status 302)
            },
        };
    }

    // 2. Fetch the product ID from the URL context (e.g., /products/delete/123 -> id is '123')
    const { id } = context.query;

    // 3. Fetch the product data from the database (only if user is an admin)
    await mongooseConnect(); // Ensure Mongoose connection is established
    const product = await Product.findById(id); // Fetch the product using its ID
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    // If the product with the given ID is not found, you might want to redirect or show a 404 page.
    if (!product) {
        return {
            notFound: true, // This will render Next.js's default 404 page
            // Alternatively, you could redirect:
            // redirect: {
            //     destination: '/products', // Redirect back to the products list
            //     permanent: false,
            // },
        };
    }

    return {
        props: {
            // Pass the product's title and ID as props to the component for the confirmation message.
            // Mongoose documents need to be serialized.
            productTitle: product.title,
            initialLanguage, 
            productId: JSON.parse(JSON.stringify(product._id)), // Ensure ID is a plain string
        },
    };
}
// --- End getServerSideProps ---

// --- Your Delete Product Page component ---
// The 'productTitle' and 'productId' props are now available directly from getServerSideProps
export default function DeleteProductPage({ productTitle, productId ,initialLanguage }) {
    const router = useRouter();
    const {t} = useTranslation();

    // Function to navigate back to the products list
    function goBack() {
        router.push('/products');
    }

    // Function to handle the actual product deletion
    async function deleteProduct() {
        // Call your DELETE API endpoint, passing the productId
        await axios.delete('/api/products?id=' + productId);
        goBack(); // Go back to the products list after deletion
    }

    return (
        <Layout>
            <h1 className="text-center">{t.ConfirmDeletion}
                &nbsp;&quot;{productTitle}&quot;?
            </h1>
            <div className="flex gap-2 justify-center">
                <button
                    onClick={deleteProduct}
                    className="btn-red">{t.Yes}</button>
                <button
                    className="btn-default"
                    onClick={goBack}>
                    {t.No}
                </button>
            </div>
        </Layout>
    );
}
