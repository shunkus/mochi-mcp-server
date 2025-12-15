#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MochiClient } from "./mochi-client.js";
import { tools } from "./mcp-tools.js";
import { handleToolCall } from "./mcp-handler.js";

const API_KEY = process.env.MOCHI_API_KEY;

if (!API_KEY) {
  console.error("Error: MOCHI_API_KEY environment variable is required");
  process.exit(1);
}

const client = new MochiClient(API_KEY);

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mochi MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
