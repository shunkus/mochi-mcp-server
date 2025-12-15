# Mochi MCP Server

An MCP server for creating and managing Mochi Cards flashcards via AI.

Supports both **HTTP/SSE** (for Vercel deployment) and **stdio** (for local use with Claude Desktop).

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

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shunkus/mochi-mcp-server&env=MOCHI_API_KEY&envDescription=Your%20Mochi%20Cards%20API%20key)

1. Click the deploy button above
2. Set the `MOCHI_API_KEY` environment variable
3. Deploy

### API Endpoints

- `GET /` - Server info page
- `POST /api/mcp` - MCP JSON-RPC endpoint
- `GET /api/mcp/sse` - SSE endpoint for streaming connections
- `POST /api/mcp/sse` - SSE message endpoint

### Example Request

```bash
curl -X POST https://your-domain.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-mochi-api-key: YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

## Local Development

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Stdio Mode (Claude Desktop)

For local use with Claude Desktop, use the stdio transport:

### Build stdio version

```bash
npm run build:stdio
```

### Claude Desktop Configuration

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mochi": {
      "command": "node",
      "args": ["/path/to/mochi-mcp-server/dist/stdio.js"],
      "env": {
        "MOCHI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Getting Mochi API Key

1. Log in to [Mochi Cards](https://mochi.cards)
2. Go to Account Settings → API to get your API key

## Usage

### Creating Cards

Card content is in Markdown format. Use `---` to separate front and back:

```
What is the capital of France?
---
Paris
```

### Bulk Card Creation

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_cards_bulk",
    "arguments": {
      "deck_id": "deck-id",
      "cards": [
        { "content": "Question 1\n---\nAnswer 1" },
        { "content": "Question 2\n---\nAnswer 2", "tags": ["tag1", "tag2"] }
      ]
    }
  }
}
```

## Notes

- Mochi API only accepts one concurrent request per account
- Be aware of rate limits (429 error)
- Deck deletion cannot be undone

## License

ISC
