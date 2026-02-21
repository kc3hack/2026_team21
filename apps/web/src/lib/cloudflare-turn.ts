import type { TurnIceServerConfig } from "@/lib/realtime/peer-connection";

const TURN_CREDENTIALS_ENDPOINT_BASE = "https://rtc.live.cloudflare.com/v1/turn/keys";
const DEFAULT_TURN_CREDENTIAL_TTL_SECONDS = 86_400;

type CloudflareTurnCredentialResponse = {
  iceServers: TurnIceServerConfig;
};

type GenerateCloudflareTurnCredentialsOptions = {
  ttl?: number;
  fetchImpl?: typeof fetch;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isCloudflareTurnCredentialResponse = (value: unknown): value is CloudflareTurnCredentialResponse => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const iceServers = (value as { iceServers?: unknown }).iceServers;
  if (typeof iceServers !== "object" || iceServers === null) {
    return false;
  }

  const record = iceServers as {
    urls?: unknown;
    username?: unknown;
    credential?: unknown;
  };

  return isStringArray(record.urls) && typeof record.username === "string" && typeof record.credential === "string";
};

const toCredentialsEndpoint = (turnKeyId: string): string =>
  `${TURN_CREDENTIALS_ENDPOINT_BASE}/${encodeURIComponent(turnKeyId)}/credentials/generate`;

const resolveTtl = (ttl?: number): number => {
  if (typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0) {
    return Math.floor(ttl);
  }
  return DEFAULT_TURN_CREDENTIAL_TTL_SECONDS;
};

export const generateCloudflareTurnCredentials = async (
  env: Pick<CloudflareBindings, "CF_TURN_KEY_ID" | "CF_TURN_TOKEN">,
  options: GenerateCloudflareTurnCredentialsOptions = {},
): Promise<CloudflareTurnCredentialResponse> => {
  const turnKeyId = env.CF_TURN_KEY_ID?.trim();
  const turnApiToken = env.CF_TURN_TOKEN?.trim();

  if (!turnKeyId || !turnApiToken) {
    throw new Error("Missing required TURN bindings: CF_TURN_KEY_ID / CF_TURN_TOKEN");
  }

  const response = await (options.fetchImpl ?? fetch)(toCredentialsEndpoint(turnKeyId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${turnApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: resolveTtl(options.ttl) }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to generate TURN credentials (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as unknown;
  if (!isCloudflareTurnCredentialResponse(payload)) {
    throw new Error("Invalid TURN credentials response from Cloudflare");
  }

  return {
    iceServers: {
      urls: [...payload.iceServers.urls],
      username: payload.iceServers.username,
      credential: payload.iceServers.credential,
    },
  };
};
