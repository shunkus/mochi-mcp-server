const BASE_URL = "https://app.mochi.cards/api";

export interface PaginatedResponse<T> {
  docs: T[];
  bookmark?: string;
}

export interface Card {
  id: string;
  content: string;
  "deck-id": string;
  "template-id"?: string;
  "archived?"?: boolean;
  "review-reverse?"?: boolean;
  pos?: string;
  "manual-tags"?: string[];
  fields?: Record<string, { id: string; value: string }>;
  "created-at"?: { date: string };
  "updated-at"?: { date: string };
  "trashed?"?: string;
  attachments?: Array<{ "file-name": string; "content-type": string }>;
}

export interface CreateCardParams {
  content: string;
  "deck-id": string;
  "template-id"?: string;
  "archived?"?: boolean;
  "review-reverse?"?: boolean;
  pos?: string;
  "manual-tags"?: string[];
  fields?: Record<string, { id: string; value: string }>;
}

export interface UpdateCardParams {
  content?: string;
  "deck-id"?: string;
  "template-id"?: string;
  "archived?"?: boolean;
  "review-reverse?"?: boolean;
  pos?: string;
  "manual-tags"?: string[];
  fields?: Record<string, { id: string; value: string }>;
  "trashed?"?: string;
}

export interface Deck {
  id: string;
  name: string;
  "parent-id"?: string;
  sort?: number;
  "archived?"?: boolean;
  "sort-by"?: "none" | "name" | "created-at" | "updated-at";
  "cards-view"?: "list" | "grid" | "column";
  "show-sides?"?: boolean;
  "review-reverse?"?: boolean;
  "cards-per-day"?: number | null;
  "created-at"?: { date: string };
  "updated-at"?: { date: string };
  "trashed?"?: string;
}

export interface CreateDeckParams {
  name: string;
  "parent-id"?: string;
  sort?: number;
  "archived?"?: boolean;
  "sort-by"?: "none" | "name" | "created-at" | "updated-at";
  "cards-view"?: "list" | "grid" | "column";
  "show-sides?"?: boolean;
  "review-reverse?"?: boolean;
  "cards-per-day"?: number | null;
}

export interface UpdateDeckParams {
  name?: string;
  "parent-id"?: string;
  sort?: number;
  "archived?"?: boolean;
  "sort-by"?: "none" | "name" | "created-at" | "updated-at";
  "cards-view"?: "list" | "grid" | "column";
  "show-sides?"?: boolean;
  "review-reverse?"?: boolean;
  "cards-per-day"?: number | null;
  "trashed?"?: string;
}

export interface TemplateField {
  id: string;
  name: string;
  type: "text" | "boolean" | "number" | "draw" | "ai";
  pos?: string;
  options?: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  fields: Record<string, TemplateField>;
  pos?: string;
  "created-at"?: { date: string };
  "updated-at"?: { date: string };
}

export interface CreateTemplateParams {
  name: string;
  content: string;
  fields: Record<string, { id: string; name: string; type: string; pos?: string; options?: Record<string, unknown> }>;
  pos?: string;
}

export interface DueCard {
  id: string;
  "deck-id": string;
  "due-at": { date: string };
}

export class MochiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(this.apiKey + ":").toString("base64");
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: this.getAuthHeader(),
      "Content-Type": "application/json",
    };

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mochi API error (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Cards
  async createCard(params: CreateCardParams): Promise<Card> {
    return this.request<Card>("POST", "/cards", params);
  }

  async getCard(cardId: string): Promise<Card> {
    return this.request<Card>("GET", `/cards/${cardId}`);
  }

  async listCards(options?: {
    deckId?: string;
    limit?: number;
    bookmark?: string;
  }): Promise<PaginatedResponse<Card>> {
    const params = new URLSearchParams();
    if (options?.deckId) params.set("deck-id", options.deckId);
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.bookmark) params.set("bookmark", options.bookmark);
    const query = params.toString();
    return this.request<PaginatedResponse<Card>>(
      "GET",
      `/cards${query ? `?${query}` : ""}`
    );
  }

  async updateCard(cardId: string, params: UpdateCardParams): Promise<Card> {
    return this.request<Card>("POST", `/cards/${cardId}`, params);
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.request<void>("DELETE", `/cards/${cardId}`);
  }

  async addAttachment(
    cardId: string,
    filename: string,
    fileData: Uint8Array,
    contentType: string
  ): Promise<void> {
    const formData = new FormData();
    const blob = new Blob([fileData as BlobPart], { type: contentType });
    formData.append("file", blob, filename);

    const response = await fetch(
      `${BASE_URL}/cards/${cardId}/attachments/${encodeURIComponent(filename)}`,
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mochi API error (${response.status}): ${errorText}`);
    }
  }

  async deleteAttachment(cardId: string, filename: string): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/cards/${cardId}/attachments/${encodeURIComponent(filename)}`
    );
  }

  // Decks
  async createDeck(params: CreateDeckParams): Promise<Deck> {
    return this.request<Deck>("POST", "/decks", params);
  }

  async getDeck(deckId: string): Promise<Deck> {
    return this.request<Deck>("GET", `/decks/${deckId}`);
  }

  async listDecks(bookmark?: string): Promise<PaginatedResponse<Deck>> {
    const query = bookmark ? `?bookmark=${bookmark}` : "";
    return this.request<PaginatedResponse<Deck>>("GET", `/decks${query}`);
  }

  async updateDeck(deckId: string, params: UpdateDeckParams): Promise<Deck> {
    return this.request<Deck>("POST", `/decks/${deckId}`, params);
  }

  async deleteDeck(deckId: string): Promise<void> {
    await this.request<void>("DELETE", `/decks/${deckId}`);
  }

  // Templates
  async createTemplate(params: CreateTemplateParams): Promise<Template> {
    return this.request<Template>("POST", "/templates", params);
  }

  async getTemplate(templateId: string): Promise<Template> {
    return this.request<Template>("GET", `/templates/${templateId}`);
  }

  async listTemplates(bookmark?: string): Promise<PaginatedResponse<Template>> {
    const query = bookmark ? `?bookmark=${bookmark}` : "";
    return this.request<PaginatedResponse<Template>>(`GET`, `/templates${query}`);
  }

  // Due
  async getDueCards(options?: {
    deckId?: string;
    date?: string;
  }): Promise<PaginatedResponse<DueCard>> {
    const path = options?.deckId ? `/due/${options.deckId}` : "/due";
    const query = options?.date ? `?date=${options.date}` : "";
    return this.request<PaginatedResponse<DueCard>>("GET", `${path}${query}`);
  }
}
