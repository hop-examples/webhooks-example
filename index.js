import "dotenv/config";

import express from "express";
import { constructEvent } from "@onehop/js";

// generate yours at https://console.hop.io/project/settings/webhooks
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "whsec_xxxx";
const PORT = process.env.PORT ?? 3001;

const app = express();
app.use(
  express.json({
    // Add the rawBody string to the request object
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.get("/", (_req, res) => res.send("hello world"));
app.post("/webhook", async (req, res) => {
  try {
    // If you don't want to use our event constructor, you can always use verifyHmac utility function from @onehop/js.
    const event = await constructEvent(
      req.rawBody,
      req.headers["x-hop-hooks-signature"],
      WEBHOOK_SECRET
    );

    console.log(
      `Received event: ${event.id} from ${event.webhook_id}\n${
        event.event
      } with ${JSON.stringify(event.data)}`
    );

    switch (event.event) {
      case "ignite.deployment.build.created":
        console.log(event.data.started_at);
        // ^ Type safe data
        break;
      case "ignite.deployment.gateway.created":
        console.log(event.data.created_at);
        // ^ Type safe data
        break;
    }

    res.status(204);
  } catch (err) {
    console.log(err);
    return res.status(401).send("invalid hmac");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
