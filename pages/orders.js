import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getSession } from "next-auth/react";
import { mongooseConnect } from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { useTranslation } from "@/lib/Translation";

function OrdersPage({initialLanguage}) {
    const [orders, setOrders] = useState([]);
    const {t} = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

    function handleDeleteClick(order) {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        if (orderToDelete) {
            try {
                const res = await fetch(`/api/orders?id=${orderToDelete._id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    console.log("Order deleted successfully");
                    await fetchOrders(); // Refresh the list
                } else {
                    console.error("Failed to delete order");
                }
            } catch (error) {
                console.error("Error deleting order:", error);
            }
            setShowDeleteModal(false);
            setOrderToDelete(null);
        }
    }

    function cancelDelete() {
        setShowDeleteModal(false);
        setOrderToDelete(null);
    }

    return (
        <Layout initialLanguage={initialLanguage}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t.Orders}</h2>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.Date}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.Paid}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.Recipient}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.Products}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.Actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${order.paid ? "text-green-600" : "text-red-600"}`}>{order.paid ? "YES" : "NO"}</td>
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                                        {order.name} <span className="block text-gray-500">{order.email}</span>
                                        <span className="block text-gray-500">{order.city} {order.postalCode} {order.country}</span>
                                        <span className="block text-gray-500">{order.streetAddress}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {order.line_items.map((l, index) => (
                                            <div key={index} className="flex items-center">
                                                <span className="block">{l.price_data?.product_data.name}</span>
                                                <span className="block ml-1 font-bold">x{l.quantity}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteClick(order)} className="text-red-600 hover:text-red-900 font-bold">
                                            {t.Delete}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">{t.NoOrdersFound}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">{t.OrderID}</span>
                                <span className="text-sm font-semibold truncate ml-2">{order._id}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium text-gray-500">{t.Date}</span>
                                <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium text-gray-500">{t.Paid}</span>
                                <span className={`text-sm font-semibold ${order.paid ? "text-green-600" : "text-red-600"}`}>{order.paid ? "YES" : "NO"}</span>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-700">{t.Recipient}</h4>
                                <p className="text-sm text-gray-600 mt-1">{order.name}</p>
                                <p className="text-sm text-gray-600">{order.email}</p>
                                <p className="text-sm text-gray-600">{order.streetAddress}, {order.city}, {order.country}</p>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-700">{t.Products}</h4>
                                {order.line_items.map((l, index) => (
                                    <div key={index} className="text-sm text-gray-600 mt-1">
                                        {l.price_data?.product_data.name} x{l.quantity}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-right">
                                <button
                                    onClick={() => handleDeleteClick(order)}
                                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"
                                >
                                    {t.Delete}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                        {t.NoOrdersFound}
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-bold">{t.ConfirmOrderDeletion}</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            
                            <span className="font-semibold"> {orderToDelete.name}</span>? This action cannot be undone.
                        </p>{t.AreYouSureDeleteOrder}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                {t.Cancel}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                {t.Delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

// Retain getServerSideProps to handle initial auth check
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        };
    }

    await mongooseConnect();
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';
    return {
        props: {
            initialLanguage,
        },
    };
}

export default OrdersPage;
