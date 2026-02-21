import app from "@/pages";
import { AnimationTestPage } from "./pages/test";

app.route("/test", AnimationTestPage);

export { DoorMan } from "@/durable-objects/DoorMan";
export default app;
