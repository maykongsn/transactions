import request from "supertest";
import { app } from "../src/app";
import { env } from "../src/env";
import { type Server } from "http";
import { knex } from "../src/database";

describe("Transactions route", () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(env.PORT);
  });

  afterAll(async () => {
    server.close();
    await knex.destroy();
  });

  test("should be able to create a new transaction", async () => {
    await request(app)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  test("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });
    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    ]);
  });
});
