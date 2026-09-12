import { rm } from "node:fs/promises";

// A previous Worker-style build can leave a redirect to dist/server/wrangler.json.
// Static Pages deployments do not use that server bundle.
await rm(new URL("../.wrangler/deploy/", import.meta.url), {
  recursive: true,
  force: true,
});
