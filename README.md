# Mochi MCP Server

An MCP server for creating and managing Mochi Cards flashcards via AI.

## Features

### Card Operations
- `create_card` - Create a new card
- `get_card` - Get card details
- `list_cards` - List cards
- `update_card` - Update a card
- `delete_card` - Delete a card
- `add_attachment` - Add attachment to a card
- `delete_attachment` - Delete attachment
- `create_cards_bulk` - Create multiple cards at once

### Deck Operations
- `create_deck` - Create a new deck
- `get_deck` - Get deck details
- `list_decks` - List all decks
- `update_deck` - Update a deck
- `delete_deck` - Delete a deck

### Template Operations
- `create_template` - Create a new template
- `get_template` - Get template details
- `list_templates` - List all templates

### Review
- `get_due_cards` - Get cards due for review

## Installation

```bash
npm install
npm run build
```

## Configuration

### 1. Get Mochi API Key

1. Log in to [Mochi Cards](https://mochi.cards)
2. Go to Account Settings → API to get your API key

### 2. Claude Desktop Configuration

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mochi": {
      "command": "node",
      "args": ["/path/to/mochi-mcp-server/dist/index.js"],
      "env": {
        "MOCHI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Claude Code Configuration

Add the following to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "mochi": {
      "command": "node",
      "args": ["/path/to/mochi-mcp-server/dist/index.js"],
      "env": {
        "MOCHI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Usage

### Creating Cards

Card content is in Markdown format. Use `---` to separate front and back:

```
What is the capital of France?
---
Paris
```

### Bulk Card Creation

```
create_cards_bulk({
  deck_id: "deck-id",
  cards: [
    { content: "Question 1\n---\nAnswer 1" },
    { content: "Question 2\n---\nAnswer 2", tags: ["tag1", "tag2"] }
  ]
})
```

## Notes

- Mochi API only accepts one concurrent request per account
- Be aware of rate limits (429 error)
- Deck deletion cannot be undone

## License

ISC
