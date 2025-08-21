// pages/products.js
import Layout from "@/components/Layout";
import Link from "next/link";
// Removed useEffect and useState as products will be fetched via getServerSideProps
// import {useEffect, useState} from "react"; 
// Removed axios as server-side fetching will use Mongoose directly
// import axios from "axios"; 

// Import necessary modules for server-side session and data fetching
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Ensure this path is correct

// Import your Mongoose Product model and connection utility
import { mongooseConnect } from "@/lib/mongoose"; 
import { Product } from "@/models/Product"; // Assuming you have this Product model

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

    // 2. Fetch product data from the database (only if user is an admin)
    await mongooseConnect(); // Ensure Mongoose connection is established
    const products = await Product.find({}); // Fetch all products using your Product model

    return {
        props: {
            // Pass the fetched products data as props to the component.
            // Mongoose documents need to be serialized (converted to plain JavaScript objects/JSON strings)
            // before being passed as props from getServerSideProps.
            products: JSON.parse(JSON.stringify(products)), 
        },
    };
}
// --- End getServerSideProps ---


// --- Your Products page component ---
// The 'products' prop is now available directly from getServerSideProps
export default function Products({ products }) { 
    // No need for client-side useEffect to fetch initial products here anymore,
    // as they are already provided via props from the server.

    return (
        <Layout>
            <Link className="bg-blue-900 text-white rounded-md py-1 px-2" href={'/products/new'}>Add new product</Link>
            <table className="basic mt-2">
                <thead>
                    <tr>
                        <td>Product name</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {/* Display a message if no products are found */}
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="text-center py-4 text-gray-500">No products found.</td>
                        </tr>
                    ) : (
                        products.map(product => (
                            <tr key={product._id}>
                                <td>{product.title}</td>
                                <td>
                                    <Link className="btn-default" href={'/products/edit/'+product._id}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                        Edit
                                    </Link>
                                    <Link className="btn-red" href={'/products/delete/'+product._id}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Delete
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </Layout>
    );
}
