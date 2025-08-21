// pages/products/new.js
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import { getServerSession } from "next-auth"; // For server-side session check
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Import authOptions

// --- getServerSideProps for server-side access control ---
export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        };
    }
    return {
        props: {}, // No specific data needed for a new product form
    };
}
// --- End getServerSideProps ---

export default function NewProduct() {
    return (
        <Layout>
            <h1>New Product</h1>
            <ProductForm />
        </Layout>
    );
}
