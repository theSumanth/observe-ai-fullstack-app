import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
  GROQ_API_KEY: z.string(),
});

const env = EnvSchema.parse(process.env);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

if (env.NODE_ENV !== "production") {
  app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
}

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", router);

if (env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
