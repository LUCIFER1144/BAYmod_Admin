import { mongooseConnect } from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  // Get the session on the server side using your auth options.
  const session = await getServerSession(req, res, authOptions);

  // Check for both session and admin status in a single conditional.
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ message: "Unauthorized: Not an admin" });
  }

  await mongooseConnect();
  const userId = session.user.id;

  try {
    if (req.method === "PUT") {
      const { language, theme } = req.body;

      // Handle language setting
      if (language) {
        await Setting.findOneAndUpdate(
          { userId, name: "language" },
          { value: language },
          { upsert: true, new: true }
        );
      }

      // Handle theme setting
      if (theme) {
        await Setting.findOneAndUpdate(
          { userId, name: "theme" },
          { value: theme },
          { upsert: true, new: true }
        );
      }

      return res.json({ success: true });
    }

    if (req.method === "GET") {
      const settings = await Setting.find({ userId });
      return res.json(settings);
    }
  } catch (error) {
    console.error("Error saving/fetching settings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
