import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import questRouter from "./routes/quest.route.js";
import userRouter from "./routes/user.route.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());

const port = process.env.PORT ?? 3000;

app.use("/api/auth", authRouter);
app.use("/api/quests", questRouter);
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
