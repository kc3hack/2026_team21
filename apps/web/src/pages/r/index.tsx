import { Hono } from "hono";
import { Layout } from "@/pages/layout";
import { RoomClient } from "./RoomClient";

const app = new Hono();

app.post("/:roomId", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const backTo = formData.get("back_to");

  console.log(file);

  return c.redirect(backTo?.toString() || c.req.path || "/");
});

app.get("/:roomId", (c) => {
  const currentPath = c.req.path;

  return c.render(
    <Layout>
      <RoomClient currentPath={currentPath} />
    </Layout>,
  );
});

export const RoomPage = app;
