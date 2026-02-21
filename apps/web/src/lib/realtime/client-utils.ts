import type { TurnIceServerConfig } from "./peer-connection";

type TurnCredentialResponse = {
  iceServers: TurnIceServerConfig;
};

export const getSignalUrl = (roomId: string): string => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/api/ws/${encodeURIComponent(roomId)}`;
};

const isTurnCredentialResponse = (value: unknown): value is TurnCredentialResponse => {
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

  const urlsValid =
    (typeof record.urls === "string" && record.urls.length > 0) ||
    (Array.isArray(record.urls) && record.urls.every((url) => typeof url === "string"));

  return urlsValid && typeof record.username === "string" && typeof record.credential === "string";
};

export const fetchTurnIceServer = async (): Promise<TurnIceServerConfig> => {
  const response = await fetch("/api/turn/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: 86_400 }),
  });

  if (!response.ok) {
    throw new Error(`TURN credentials request failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  if (!isTurnCredentialResponse(payload)) {
    throw new Error("TURN credentials response is invalid");
  }

  return payload.iceServers;
};
