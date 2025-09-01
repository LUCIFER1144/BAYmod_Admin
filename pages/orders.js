import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getSession } from "next-auth/react";
import { mongooseConnect } from "@/lib/mongoose";

function OrdersPage() {
    const [orders, setOrders] = useState([]);
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
        <Layout>
            <div className="flex justify-between">
                <h2>Orders</h2>
            </div>
            <div className="overflow-x-auto mt-4 bg-white rounded-lg shadow">
                <table className="basic mt-4">
                    <thead>
                        <tr>
                            <td>Date</td>
                            <td>Paid</td>
                            <td>Recipient</td>
                            <td>Products</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 &&
                        orders.map((order) => (
                            <tr key={order._id}>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td className={order.paid ? "text-green-600" : "text-red-600"}>
                                    {order.paid ? "YES" : "NO"}
                                </td>
                                <td>
                                    {order.name} {order.email}
                                    <br />
                                    {order.city} {order.postalCode} {order.country}
                                    <br />
                                    {order.streetAddress}
                                </td>
                                <td>
                                    {order.line_items.map((l) => (
                                        <div key={l._id}>
                                            {l.price_data?.product_data.name} x{l.quantity}
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteClick(order)}
                                        className="btn-red"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg">
                        <h3 className="text-lg font-bold">Confirm Deletion</h3>
                        <p className="mt-2">
                            Are you sure you want to delete the order from
                            <span className="font-semibold"> {orderToDelete.name}</span>? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

// Retain getServerSideProps to handle initial auth and data fetching on page load
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
  // Data will be fetched client-side with useEffect, so we no longer need to pass it as props
    await mongooseConnect();
    return {
        props: {
      // We don't need to pass the orders here anymore
      // This is a minimal change to keep the authorization check
        },
    };
}

export default OrdersPage;
