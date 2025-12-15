#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { MochiClient } from "./mochi-client.js";

const API_KEY = process.env.MOCHI_API_KEY;

if (!API_KEY) {
  console.error("Error: MOCHI_API_KEY environment variable is required");
  process.exit(1);
}

const client = new MochiClient(API_KEY);

const tools: Tool[] = [
  // Card tools
  {
    name: "create_card",
    description:
      "Create a new flashcard in Mochi. The content supports Markdown formatting. Use '---' to separate front and back of the card.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description:
            "The card content in Markdown. Use '---' to separate front and back.",
        },
        deck_id: {
          type: "string",
          description: "The ID of the deck to add the card to",
        },
        template_id: {
          type: "string",
          description: "Optional template ID to use for this card",
        },
        archived: {
          type: "boolean",
          description: "Whether the card is archived",
        },
        review_reverse: {
          type: "boolean",
          description: "Whether to review the card in reverse",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Manual tags for the card",
        },
      },
      required: ["content", "deck_id"],
    },
  },
  {
    name: "get_card",
    description: "Get details of a specific card by ID",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "The ID of the card to retrieve",
        },
      },
      required: ["card_id"],
    },
  },
  {
    name: "list_cards",
    description: "List cards, optionally filtered by deck",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "Filter cards by deck ID",
        },
        limit: {
          type: "number",
          description: "Number of cards to return (1-100)",
          minimum: 1,
          maximum: 100,
        },
        bookmark: {
          type: "string",
          description: "Pagination bookmark from previous response",
        },
      },
    },
  },
  {
    name: "update_card",
    description: "Update an existing card",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "The ID of the card to update",
        },
        content: {
          type: "string",
          description: "New content for the card",
        },
        deck_id: {
          type: "string",
          description: "Move card to a different deck",
        },
        archived: {
          type: "boolean",
          description: "Archive or unarchive the card",
        },
        review_reverse: {
          type: "boolean",
          description: "Enable or disable reverse review",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Update manual tags",
        },
        trashed: {
          type: "boolean",
          description: "Soft delete the card (set to true to trash)",
        },
      },
      required: ["card_id"],
    },
  },
  {
    name: "delete_card",
    description: "Permanently delete a card. This cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "The ID of the card to delete",
        },
      },
      required: ["card_id"],
    },
  },
  {
    name: "add_attachment",
    description: "Add an attachment to a card using a URL",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "The ID of the card",
        },
        filename: {
          type: "string",
          description: "The filename for the attachment",
        },
        url: {
          type: "string",
          description: "URL of the file to attach",
        },
      },
      required: ["card_id", "filename", "url"],
    },
  },
  {
    name: "delete_attachment",
    description: "Delete an attachment from a card",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "The ID of the card",
        },
        filename: {
          type: "string",
          description: "The filename of the attachment to delete",
        },
      },
      required: ["card_id", "filename"],
    },
  },
  // Deck tools
  {
    name: "create_deck",
    description: "Create a new deck for organizing flashcards",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the deck",
        },
        parent_id: {
          type: "string",
          description: "Parent deck ID for nested decks",
        },
        archived: {
          type: "boolean",
          description: "Whether the deck is archived",
        },
        sort_by: {
          type: "string",
          enum: ["none", "name", "created-at", "updated-at"],
          description: "How to sort cards in this deck",
        },
        cards_view: {
          type: "string",
          enum: ["list", "grid", "column"],
          description: "Display view for cards",
        },
        show_sides: {
          type: "boolean",
          description: "Show both sides of cards",
        },
        review_reverse: {
          type: "boolean",
          description: "Review cards in reverse by default",
        },
        cards_per_day: {
          type: "number",
          description: "Limit new cards per day (null for unlimited)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_deck",
    description: "Get details of a specific deck",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "The ID of the deck to retrieve",
        },
      },
      required: ["deck_id"],
    },
  },
  {
    name: "list_decks",
    description: "List all decks",
    inputSchema: {
      type: "object",
      properties: {
        bookmark: {
          type: "string",
          description: "Pagination bookmark from previous response",
        },
      },
    },
  },
  {
    name: "update_deck",
    description: "Update an existing deck",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "The ID of the deck to update",
        },
        name: {
          type: "string",
          description: "New name for the deck",
        },
        parent_id: {
          type: "string",
          description: "Move deck under a different parent",
        },
        archived: {
          type: "boolean",
          description: "Archive or unarchive the deck",
        },
        sort_by: {
          type: "string",
          enum: ["none", "name", "created-at", "updated-at"],
          description: "How to sort cards",
        },
        cards_view: {
          type: "string",
          enum: ["list", "grid", "column"],
          description: "Display view for cards",
        },
        trashed: {
          type: "boolean",
          description: "Soft delete the deck (set to true to trash)",
        },
      },
      required: ["deck_id"],
    },
  },
  {
    name: "delete_deck",
    description:
      "Permanently delete a deck and all its cards. This cannot be undone!",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "The ID of the deck to delete",
        },
      },
      required: ["deck_id"],
    },
  },
  // Template tools
  {
    name: "create_template",
    description:
      "Create a new card template with custom fields. Field types: text, boolean, number, draw, ai",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the template",
        },
        content: {
          type: "string",
          description:
            "Template content using {{field-name}} placeholders for fields",
        },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: {
                type: "string",
                enum: ["text", "boolean", "number", "draw", "ai"],
              },
            },
            required: ["id", "name", "type"],
          },
          description: "Field definitions for the template",
        },
      },
      required: ["name", "content", "fields"],
    },
  },
  {
    name: "get_template",
    description: "Get details of a specific template",
    inputSchema: {
      type: "object",
      properties: {
        template_id: {
          type: "string",
          description: "The ID of the template to retrieve",
        },
      },
      required: ["template_id"],
    },
  },
  {
    name: "list_templates",
    description: "List all templates",
    inputSchema: {
      type: "object",
      properties: {
        bookmark: {
          type: "string",
          description: "Pagination bookmark from previous response",
        },
      },
    },
  },
  // Due cards
  {
    name: "get_due_cards",
    description: "Get cards that are due for review",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "Filter by deck ID",
        },
        date: {
          type: "string",
          description: "Date in ISO 8601 format (defaults to today)",
        },
      },
    },
  },
  // Bulk operations
  {
    name: "create_cards_bulk",
    description:
      "Create multiple flashcards at once. Each card should have content separated by '---' for front/back.",
    inputSchema: {
      type: "object",
      properties: {
        deck_id: {
          type: "string",
          description: "The ID of the deck to add cards to",
        },
        cards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "Card content (use --- to separate front/back)",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Tags for this card",
              },
            },
            required: ["content"],
          },
          description: "Array of cards to create",
        },
        template_id: {
          type: "string",
          description: "Optional template ID to use for all cards",
        },
      },
      required: ["deck_id", "cards"],
    },
  },
];

const server = new Server(
  {
    name: "mochi-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Card operations
      case "create_card": {
        const result = await client.createCard({
          content: args?.content as string,
          "deck-id": args?.deck_id as string,
          "template-id": args?.template_id as string | undefined,
          "archived?": args?.archived as boolean | undefined,
          "review-reverse?": args?.review_reverse as boolean | undefined,
          "manual-tags": args?.tags as string[] | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_card": {
        const result = await client.getCard(args?.card_id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_cards": {
        const result = await client.listCards({
          deckId: args?.deck_id as string | undefined,
          limit: args?.limit as number | undefined,
          bookmark: args?.bookmark as string | undefined,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_card": {
        const updateParams: Record<string, unknown> = {};
        if (args?.content) updateParams.content = args.content;
        if (args?.deck_id) updateParams["deck-id"] = args.deck_id;
        if (args?.archived !== undefined)
          updateParams["archived?"] = args.archived;
        if (args?.review_reverse !== undefined)
          updateParams["review-reverse?"] = args.review_reverse;
        if (args?.tags) updateParams["manual-tags"] = args.tags;
        if (args?.trashed) updateParams["trashed?"] = new Date().toISOString();

        const result = await client.updateCard(
          args?.card_id as string,
          updateParams
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "delete_card": {
        await client.deleteCard(args?.card_id as string);
        return {
          content: [{ type: "text", text: "Card deleted successfully" }],
        };
      }

      case "add_attachment": {
        const response = await fetch(args?.url as string);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const buffer = new Uint8Array(await response.arrayBuffer());
        const contentType =
          response.headers.get("content-type") || "application/octet-stream";

        await client.addAttachment(
          args?.card_id as string,
          args?.filename as string,
          buffer,
          contentType
        );
        return {
          content: [{ type: "text", text: "Attachment added successfully" }],
        };
      }

      case "delete_attachment": {
        await client.deleteAttachment(
          args?.card_id as string,
          args?.filename as string
        );
        return {
          content: [{ type: "text", text: "Attachment deleted successfully" }],
        };
      }

      // Deck operations
      case "create_deck": {
        const result = await client.createDeck({
          name: args?.name as string,
          "parent-id": args?.parent_id as string | undefined,
          "archived?": args?.archived as boolean | undefined,
          "sort-by": args?.sort_by as
            | "none"
            | "name"
            | "created-at"
            | "updated-at"
            | undefined,
          "cards-view": args?.cards_view as
            | "list"
            | "grid"
            | "column"
            | undefined,
          "show-sides?": args?.show_sides as boolean | undefined,
          "review-reverse?": args?.review_reverse as boolean | undefined,
          "cards-per-day": args?.cards_per_day as number | undefined,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_deck": {
        const result = await client.getDeck(args?.deck_id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_decks": {
        const result = await client.listDecks(args?.bookmark as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_deck": {
        const deckParams: Record<string, unknown> = {};
        if (args?.name) deckParams.name = args.name;
        if (args?.parent_id) deckParams["parent-id"] = args.parent_id;
        if (args?.archived !== undefined)
          deckParams["archived?"] = args.archived;
        if (args?.sort_by) deckParams["sort-by"] = args.sort_by;
        if (args?.cards_view) deckParams["cards-view"] = args.cards_view;
        if (args?.trashed) deckParams["trashed?"] = new Date().toISOString();

        const result = await client.updateDeck(
          args?.deck_id as string,
          deckParams
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "delete_deck": {
        await client.deleteDeck(args?.deck_id as string);
        return {
          content: [{ type: "text", text: "Deck deleted successfully" }],
        };
      }

      // Template operations
      case "create_template": {
        const fields: Record<
          string,
          { id: string; name: string; type: string }
        > = {};
        const fieldArray = args?.fields as Array<{
          id: string;
          name: string;
          type: string;
        }>;
        for (const field of fieldArray) {
          fields[field.id] = field;
        }

        const result = await client.createTemplate({
          name: args?.name as string,
          content: args?.content as string,
          fields,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_template": {
        const result = await client.getTemplate(args?.template_id as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_templates": {
        const result = await client.listTemplates(args?.bookmark as string);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // Due cards
      case "get_due_cards": {
        const result = await client.getDueCards({
          deckId: args?.deck_id as string | undefined,
          date: args?.date as string | undefined,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // Bulk operations
      case "create_cards_bulk": {
        const deckId = args?.deck_id as string;
        const cards = args?.cards as Array<{ content: string; tags?: string[] }>;
        const templateId = args?.template_id as string | undefined;

        const results: unknown[] = [];
        for (const card of cards) {
          const result = await client.createCard({
            content: card.content,
            "deck-id": deckId,
            "template-id": templateId,
            "manual-tags": card.tags,
          });
          results.push(result);
        }

        return {
          content: [
            {
              type: "text",
              text: `Created ${results.length} cards:\n${JSON.stringify(results, null, 2)}`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mochi MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
