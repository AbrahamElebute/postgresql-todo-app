import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const router = express.Router();
// const getUserQuery = "SELECT * FROM users WHERE username = ?";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // const InsertUser = db.prepare(
    //   "INSERT INTO users (username, password) VALUES (?, ?)"
    // );

    // const result = InsertUser.run(username, hashedPassword);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const defaultTodo = `Hello :) ${username}, Add your first TODO!`;

    // const InsertToDo = db.prepare(
    //   "INSERT INTO todos (task, user_id) VALUES (?, ?)"
    // );
    // InsertToDo.run(defaultTodo, result.lastInsertRowid);

    const newTodo = await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id,
      },
    });
    //Create token

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // const newUser = db.prepare(getUserQuery).get(username);
    // delete newUser.password;
    const { password: _, ...userSafe } = user;

    res.status(201).json({
      message: "User registered successfully",
      data: {
        user: userSafe,
        todo: newTodo,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username or password is required" });
  }

  try {
    // const stmt = db.prepare(getUserQuery);
    // const user = stmt.get(username);
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invaild username." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    delete user.password;
    res.status(200).json({ data: user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

export default router;
