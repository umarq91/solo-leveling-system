import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.route.js";
import questRouter from "./routes/quest.route.js";
import userRouter from "./routes/user.route.js";

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 3000;

app.use("/api/auth", authRouter);
app.use("/api/quests", questRouter);
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
