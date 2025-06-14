import express from "express";
import prisma from "../prismaClient.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // const query = "SELECT * FROM users";
    // const stmt = db.prepare(query);
    // const users = stmt.all();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      error: "Failed to fetch users.",
      detail: error.message,
    });
  }
});

export default router;
