import { DurableObject } from "cloudflare:workers";
import type { Env } from "hono";
import * as v from "valibot";

export const clientId = v.pipe(v.string(), v.brand("ClientID"));
export type ClientID = v.InferOutput<typeof clientId>;

export interface Sample {
  timestamp: number;
  decibels: number;
}

export interface Client {
  id: ClientID;
  name: string;
  decibels: {
    current: number;
    max: number;
    average3s: number;
  };
  timestamp: number;
}

export class VoiceManager extends DurableObject<Env> {
  private clients: Map<ClientID, Client> = new Map();

  async addClient(client: Client) {
    this.clients.set(client.id, client);
  }

  async removeClient(clientId: ClientID) {
    this.clients.delete(clientId);
  }
}
