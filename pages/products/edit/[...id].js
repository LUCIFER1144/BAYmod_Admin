// pages/products/edit/[...id].js
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
// Removed useRouter, useEffect, useState as product data is fetched server-side
// import { useRouter } from "next/router"; 
// import { useEffect, useState } from "react";
// Removed axios as server-side fetching uses Mongoose directly
// import axios from "axios"; 
import Spinner from "@/components/Spinner"; // Assuming you have a Spinner component

// Import necessary modules for server-side session and data fetching
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Ensure this path is correct
import { mongooseConnect } from "@/lib/mongoose"; // Ensure this path is correct for your Mongoose connection
import { Product } from "@/models/Product"; // Ensure this path is correct for your Product model

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

    // 2. Fetch the product ID from the URL context (e.g., /products/edit/123 -> id is '123')
    const { id } = context.query;

    // 3. Fetch the product data from the database (only if user is an admin)
    await mongooseConnect(); // Ensure Mongoose connection is established
    const product = await Product.findById(id); // Fetch the product using its ID

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
            // Pass the fetched product data as props to the component.
            // Mongoose documents need to be serialized (converted to plain JavaScript objects/JSON strings)
            // before being passed as props from getServerSideProps.
            product: JSON.parse(JSON.stringify(product)), 
        },
    };
}
// --- End getServerSideProps ---


// --- Your Edit Product Page component ---
// The 'product' prop is now available directly from getServerSideProps
export default function EditProductPage({ product }) {
    // The product data is guaranteed to be available here because getServerSideProps
    // already handled the loading, admin check, and product existence.

    // If for some reason 'product' is null here (e.g., if you changed getServerSideProps logic),
    // you could add a fallback UI, though 'notFound: true' from getServerSideProps is preferred.
    if (!product) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    {/* A simple message or a custom spinner/loader */}
                    <Spinner /> 
                    <p className="ml-2 text-gray-700">Loading product...</p> 
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <h1>Edit Product</h1>
            {/* Pass all properties of the fetched product to the ProductForm component */}
            <ProductForm {...product} /> 
        </Layout>
    );
}
