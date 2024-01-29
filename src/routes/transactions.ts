import {
  type Request,
  type Response,
  Router,
  type RequestHandler,
} from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

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

  let sessionId = request.cookies.sessionId;

  if (!sessionId) {
    sessionId = randomUUID();

    response.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  await knex("transactions").insert({
    id: randomUUID(),
    title,
    amount: type === "credit" ? amount : amount * -1,
    session_id: sessionId,
  });

  response.status(201).end();
}) as RequestHandler);

transactionsRouter.use(checkSessionIdExists);

transactionsRouter.get("/", (async (request: Request, response: Response) => {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    return response.status(401).json({
      error: "Unauthorized",
    });
  }

  const transactions = await knex("transactions")
    .where("session_id", sessionId)
    .select();

  response.status(200).json({ transactions });
}) as RequestHandler);

transactionsRouter.get("/summary", (async (
  request: Request,
  response: Response
) => {
  const { sessionId } = request.cookies;

  const summary = await knex("transactions")
    .where("session_id", sessionId)
    .sum("amount", { as: "amount" })
    .first();

  response.status(200).json({ summary });
}) as RequestHandler);

transactionsRouter.get("/:id", (async (
  request: Request,
  response: Response
) => {
  const getTransactionParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = getTransactionParamsSchema.parse(request.params);

  const { sessionId } = request.cookies;

  const transaction = await knex("transactions")
    .where({
      session_id: sessionId,
      id,
    })
    .first();

  response.status(200).json({ transaction });
}) as RequestHandler);

export { transactionsRouter };
