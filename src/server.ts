import express from "express";
import { knex } from "./database";

const app = express();

app.get("/hello", async () => {
  const tables = await knex('sqlite_schema').select('*');
  return tables;
});

app.listen(3333, () => {
  console.log("Server running!");
});
