import { MochiClient } from "./mochi-client";

export async function handleToolCall(
  client: MochiClient,
  name: string,
  args: Record<string, unknown> | undefined
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
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
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
}
