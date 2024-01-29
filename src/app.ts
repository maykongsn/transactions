import express from "express";

import { router } from "./routes";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(router);
