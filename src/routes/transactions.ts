import {
  type Request,
  type Response,
  Router,
  type RequestHandler,
} from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

const transactionsRouter = Router();

transactionsRouter.post("/", (async (request: Request, response: Response) => {
  const createTransactionBodySchema = z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(["credit", "debit"]),
  });

  const { title, amount, type } = createTransactionBodySchema.parse(
    request.body
  );

  await knex("transactions").insert({
    id: randomUUID(),
    title,
    amount: type === "credit" ? amount : amount * -1,
  });

  response.status(201).end();
}) as RequestHandler);

export { transactionsRouter };
