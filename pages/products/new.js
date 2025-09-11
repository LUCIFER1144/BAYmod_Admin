// pages/products/new.js

import ProductForm from "@/components/ProductForm";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/pages/api/auth/[...nextauth]"; 
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
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    return {
        props: {
            initialLanguage,
        }, 
    };
}


export default function NewProduct({initialLanguage}) {
    const {t} = useTranslation();
    return (
        <>
            <h1>{t.NewProduct}</h1> 
            <ProductForm />
        </>
    );
}
