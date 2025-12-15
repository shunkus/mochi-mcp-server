import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const tools: Tool[] = [
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
