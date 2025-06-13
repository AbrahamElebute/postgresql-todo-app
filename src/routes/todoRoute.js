import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user_id;

    // const todos = db
    //   .prepare("SELECT * FROM todos WHERE user_id = ?")
    //   .all(userId);
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
    });

    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({
      message: "Error fetching todos",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const { task } = req.body;
  const userId = req.user_id;
  if (!task) {
    return res.status(400).json({ error: "Task is required" }); // added return
  }

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    // const InsertToDo = db.prepare(
    //   "INSERT INTO todos (task, user_id) VALUES (?, ?)"
    // );

    // const result = InsertToDo.run(task, userId);
    const todo = await prisma.todo.create({
      data: {
        task,
        userId,
      },
    });

    res.status(201).json({
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    console.log("error:", error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed, task } = req.body;

  if (!id) {
    return res.status(400).json({ message: "return id" });
  }
  try {
    // const updateTodo = db.prepare(
    //   "UPDATE todos SET task = ?, completed = ? WHERE id = ?"
    // );

    // updateTodo.run(task, completed, id);
    await prisma.todo.update({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
      data: {
        completed: !!completed,
      },
    });
    return res.status(200).json({ message: "Todo Completed" });
  } catch (error) {
    console.log("error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    // const deleteTodo = db.prepare("DELETE FROM todos WHERE id = ?");
    // const info = deleteTodo.run(id);

    // if (info.changes === 0) {
    //   return res.status(404).json({ message: "Todo not found" });
    // }

    await prisma.todo.delete({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
