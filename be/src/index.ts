import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 3000;

app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
