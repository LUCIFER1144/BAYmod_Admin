import Layout from "@/components/Layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Category } from "@/models/Category";
import { Setting } from "@/models/Setting"; // Import the Setting model
import { useTranslation } from "@/lib/Translation";

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    if (!session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        };
    }

    await mongooseConnect();
    
    // Fetch the user's language setting
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';

    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const categoriesCount = await Category.countDocuments();

    return {
        props: {
            session: JSON.parse(JSON.stringify(session)),
            initialLanguage, // Pass the fetched language to the component
            productsCount,
            ordersCount,
            categoriesCount,
        },
    };
}

export default function Dashboard({ initialLanguage, productsCount, ordersCount, categoriesCount }) {
    const { data: session } = useSession();
    const {t} = useTranslation();
    
    return (
        <Layout initialLanguage={initialLanguage}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t.adminDashboard}</h1>
            <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">{t.hello} {session?.user?.name || 'Admin'}</h2>
                <div className="flex items-center gap-2">
                    {session?.user?.image && <img src={session.user.image} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">{t.totalProducts}</h3>
                    <p className="text-3xl">{productsCount}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">{t.totalOrders}</h3>
                    <p className="text-3xl">{ordersCount}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">{t.totalCategories}</h3>
                    <p className="text-3xl">{categoriesCount}</p>
                </div>
            </div>
        </Layout>
    );
}
