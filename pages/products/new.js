// pages/products/new.js
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import { getServerSession } from "next-auth"; // For server-side session check
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Import authOptions
import { Setting } from "@/models/Setting";
import { useTranslation } from "@/lib/Translation";

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
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    return {
        props: {
            initialLanguage,
        }, // No specific data needed for a new product form
    };
}
// --- End getServerSideProps ---

export default function NewProduct({initialLanguage}) {
    const {t} = useTranslation();
    return (
        <Layout initialLanguage={initialLanguage}>
            <h1>{t.NewProduct}</h1> 
            <ProductForm />
        </Layout>
    );
}
