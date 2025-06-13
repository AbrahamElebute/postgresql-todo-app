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
        email: true,
        createdAt: true,
      },
    });
    // Remove password from user data
    users.forEach((user) => {
      delete user.password;
    });
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

export default router;
