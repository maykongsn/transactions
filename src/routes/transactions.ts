import {
  type Request,
  type Response,
  Router,
  type RequestHandler,
} from "express";
import { knex } from "../database";

const routes = Router();

routes.get("/hello", (async (request: Request, response: Response) => {
  const transactions = await knex("transactions")
    .where("amount", 1000)
    .select("*");
  response.json(transactions).end();
}) as RequestHandler);

export default routes;
