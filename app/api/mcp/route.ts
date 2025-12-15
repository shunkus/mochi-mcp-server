import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MochiClient } from "@/src/mochi-client";
import { tools } from "@/src/mcp-tools";
import { handleToolCall } from "@/src/mcp-handler";

function createServer(apiKey: string) {
  const client = new MochiClient(apiKey);

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
    return handleToolCall(client, name, args);
  });

  return server;
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-mochi-api-key") || process.env.MOCHI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "MOCHI_API_KEY is required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const server = createServer(apiKey);

    // Handle the MCP request directly
    const result = await handleMcpRequest(server, body);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handleMcpRequest(server: Server, body: { method: string; params?: Record<string, unknown>; id?: string | number }) {
  const { method, params, id } = body;

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: { tools },
    };
  }

  if (method === "tools/call") {
    const toolName = params?.name as string;
    const toolArgs = params?.arguments as Record<string, unknown> | undefined;

    const apiKey = process.env.MOCHI_API_KEY;
    if (!apiKey) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: "MOCHI_API_KEY not configured" },
      };
    }

    const client = new MochiClient(apiKey);
    const result = await handleToolCall(client, toolName, toolArgs);

    return {
      jsonrpc: "2.0",
      id,
      result,
    };
  }

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "mochi-mcp-server", version: "1.0.0" },
      },
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "mochi-mcp-server",
      version: "1.0.0",
      description: "MCP Server for Mochi Cards",
      endpoints: {
        "/api/mcp": "POST - MCP JSON-RPC endpoint",
        "/api/mcp/sse": "GET - SSE endpoint for streaming",
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
