import { Hono } from "hono";
import { Page } from "@/pages/router";

const app = new Hono();

app.get("/", (c) => {
  return c.render(<Page id="/counter" />);
});

export const CounterPageRoute = app;
