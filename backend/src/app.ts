import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(nodeEnv = "development") {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));

  if (nodeEnv !== "production") {
    app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
  }

  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", router);

  if (nodeEnv === "production") {
    const distPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
