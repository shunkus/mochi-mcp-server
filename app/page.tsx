export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Mochi MCP Server</h1>
      <p>MCP Server for Mochi Cards - Create and manage flashcards via AI</p>

      <h2>Endpoints</h2>
      <ul>
        <li>
          <code>POST /api/mcp</code> - MCP JSON-RPC endpoint
        </li>
        <li>
          <code>GET /api/mcp/sse</code> - SSE endpoint for streaming
        </li>
        <li>
          <code>POST /api/mcp/sse</code> - SSE message endpoint
        </li>
      </ul>

      <h2>Configuration</h2>
      <p>Set the <code>MOCHI_API_KEY</code> environment variable or pass it via the <code>x-mochi-api-key</code> header.</p>

      <h2>Available Tools</h2>
      <ul>
        <li><strong>Cards:</strong> create_card, get_card, list_cards, update_card, delete_card, add_attachment, delete_attachment, create_cards_bulk</li>
        <li><strong>Decks:</strong> create_deck, get_deck, list_decks, update_deck, delete_deck</li>
        <li><strong>Templates:</strong> create_template, get_template, list_templates</li>
        <li><strong>Review:</strong> get_due_cards</li>
      </ul>

      <h2>Example Request</h2>
      <pre style={{ background: "#f4f4f4", padding: "1rem", overflow: "auto" }}>
{`curl -X POST https://your-domain.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "x-mochi-api-key: YOUR_API_KEY" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'`}
      </pre>
    </main>
  );
}
