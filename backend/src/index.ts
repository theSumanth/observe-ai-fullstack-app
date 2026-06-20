import "dotenv/config";
import { z } from "zod";
import { createApp } from "./app";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
  GROQ_API_KEY: z.string(),
});

const env = EnvSchema.parse(process.env);
const app = createApp(env.NODE_ENV);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
