import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./core/middlewares/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  return res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
