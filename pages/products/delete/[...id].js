// pages/products/delete/[...id].js
import { useRouter } from "next/router";
import axios from "axios"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; 
import { mongooseConnect } from "@/lib/mongoose"; 
import { Product } from "@/models/Product"; 
import { useTranslation } from "@/lib/Translation";
import { Setting } from "@/models/Setting";


export async function getServerSideProps(context) {
    // 1. Server-side session check for admin access
    const session = await getServerSession(context.req, context.res, authOptions);

    
    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied', 
                permanent: false, 
            },
        };
    }

    // 2. Fetch the product ID from the URL context 
    const { id } = context.query;

    // 3. Fetch the product data from the database (only if user is an admin)
    await mongooseConnect(); 
    const product = await Product.findById(id); // Fetch the product using its ID
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    
    if (!product) {
        return {
            notFound: true, 
            
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
        <>
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
        </>
    );
}
