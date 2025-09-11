// pages/products/edit/[...id].js
import ProductForm from "@/components/ProductForm";
import Spinner from "@/components/Spinner"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; 
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Setting } from "@/models/Setting";
import { useTranslation } from "@/lib/Translation";


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
            product: JSON.parse(JSON.stringify(product)), 
            initialLanguage,
        },
    };
}




export default function EditProductPage({ product, initialLanguage }) {

    const {t} = useTranslation();

    if (!product) {
        return (
            <>
                <div className="flex justify-center items-center min-h-screen">
                    {/* A simple message or a custom spinner/loader */}
                    <Spinner /> 
                    <p className="ml-2 text-gray-700">{t.LoadingProduct}</p> 
                </div>
            </>
        );
    }

    return (
        <>
            <h1>{t.EditProduct}</h1>
            {/* Pass all properties of the fetched product to the ProductForm component */}
            <ProductForm {...product} /> 
        </>
    );
}
