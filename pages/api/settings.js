import { mongooseConnect } from "@/lib/mongoose";
import { getSession } from "next-auth/react";
import { Setting } from "@/models/Setting";

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session || !session.user.isAdmin) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    await mongooseConnect();
    const userId = session.user.id;

    switch (req.method) {
        case "GET":
            try {
                const settings = await Setting.findOne({ userId });
                if (!settings) {
                    // Create default settings if none exist
                    const newSettings = await Setting.create({ userId, language: 'en', theme: 'light' });
                    return res.json(newSettings);
                }
                res.json(settings);
            } catch (error) {
                console.error("Error fetching settings:", error);
                res.status(500).json({ error: "Failed to fetch settings" });
            }
            break;

        case "PUT":
            const { language, theme } = req.body;
            try {
                const settings = await Setting.findOneAndUpdate(
                    { userId },
                    { language, theme },
                    { new: true, upsert: true } // Upsert: create if not found, update if found
                );
                res.status(200).json({ success: true, settings });
            } catch (error) {
                console.error("Error updating settings:", error);
                res.status(500).json({ error: "Failed to update settings" });
            }
            break;

        default:
            res.status(405).json({ error: "Method not allowed" });
    }
}