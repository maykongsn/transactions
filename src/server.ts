import express from "express";
import { env } from "./env";
import routes from "./routes/transactions";

const app = express();

app.use(express.json());

app.use(routes);

app.listen(env.PORT, () => {
  console.log("Server running!");
});
