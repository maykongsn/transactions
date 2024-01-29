import request from "supertest";
import { execSync } from "node:child_process";
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

  beforeEach(() => {
    execSync("npm run knex -- migrate:latest");
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

  test("should be able to get a specific transaction", async () => {
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

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      })
    );
  });

  test("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    await request(app).post("/transactions").set("Cookie", cookies).send({
      title: "Debit Transaction",
      amount: 2000,
      type: "debit",
    });

    const summaryResponse = await request(app)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});
