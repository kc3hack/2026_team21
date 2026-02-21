const TURN_CREDENTIALS_ENDPOINT_BASE = "https://rtc.live.cloudflare.com/v1/turn/keys";
export const DEFAULT_TURN_CREDENTIAL_TTL_SECONDS = 86_400;

export type CloudflareTurnIceServer = {
  urls: string | string[];
  username: string;
  credential: string;
};

export type CloudflareTurnCredentialResponse = {
  iceServers: CloudflareTurnIceServer;
};

type GenerateCloudflareTurnCredentialsOptions = {
  ttl?: number;
  fetchImpl?: typeof fetch;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

const isNonEmptyStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);

const normalizeIceServerUrls = (value: unknown): string | string[] | null => {
  if (isNonEmptyString(value)) {
    return value;
  }
  if (isNonEmptyStringArray(value)) {
    return [...value];
  }
  return null;
};

const parseCloudflareTurnCredentialResponse = (value: unknown): CloudflareTurnCredentialResponse | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const iceServers = (value as { iceServers?: unknown }).iceServers;
  if (typeof iceServers !== "object" || iceServers === null) {
    return null;
  }

  const record = iceServers as {
    urls?: unknown;
    username?: unknown;
    credential?: unknown;
  };

  const urls = normalizeIceServerUrls(record.urls);
  if (!urls || !isNonEmptyString(record.username) || !isNonEmptyString(record.credential)) {
    return null;
  }

  return {
    iceServers: {
      urls,
      username: record.username,
      credential: record.credential,
    },
  };
};

const toCredentialsEndpoint = (turnKeyId: string): string =>
  `${TURN_CREDENTIALS_ENDPOINT_BASE}/${encodeURIComponent(turnKeyId)}/credentials/generate`;

const normalizeTurnCredentialTtl = (ttl?: number): number => {
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
    body: JSON.stringify({ ttl: normalizeTurnCredentialTtl(options.ttl) }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to generate TURN credentials (${response.status}): ${body}`);
  }

  const payload = parseCloudflareTurnCredentialResponse((await response.json()) as unknown);
  if (!payload) {
    throw new Error("Invalid TURN credentials response from Cloudflare");
  }

  return payload;
};
