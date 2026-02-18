import { createRoute } from "honox/factory";
import AudioProvider from "../islands/audio";

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Voice</title>
      <AudioProvider />
    </div>
  );
});
