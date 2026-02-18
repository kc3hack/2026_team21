import { Hono } from "hono";
import { Layout } from "@/pages/layout";

const app = new Hono();

app.post("/", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const backTo = formData.get("back_to");

  // do something
  // biome-ignore lint/suspicious/noConsole: for debugging
  console.log(file);

  return c.redirect(backTo?.toString() || "/");
});

app.get("/", (c) => {
  return c.render(
    <Layout>
      <h1>Room Page</h1>
      <div>
        <form action="/room" method="post" encType="multipart/form-data">
          <input type="file" name="file" id="file" />
          <input type="hidden" name="back_to" value="/room" />
          <button type="submit">Upload</button>
        </form>
      </div>
    </Layout>,
  );
});

export const RoomPage = app;
