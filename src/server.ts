import express from "express";
import { env } from "./env";
import { router } from "./routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(router);

app.listen(env.PORT, () => {
  console.log("Server running!");
});
