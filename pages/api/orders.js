import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session || !session.user.isAdmin) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    await mongooseConnect();

    switch (req.method) {
        case "GET":
            res.json(await Order.find().sort({ createdAt: -1 }));
            break;
        case "DELETE":
            const { id } = req.query;
            if (id) {
                await Order.findByIdAndDelete(id);
                res.status(200).json({ success: true });
                } else {
                    res.status(400).json({ error: "Order ID is missing" });
                }
                break;
        default:
            res.status(405).json({ error: "Method not allowed" });
    }
}
