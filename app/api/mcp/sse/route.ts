import { MochiClient } from "@/src/mochi-client";
import { tools } from "@/src/mcp-tools";
import { handleToolCall } from "@/src/mcp-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-mochi-api-key") || process.env.MOCHI_API_KEY;

  if (!apiKey) {
    return new Response("MOCHI_API_KEY is required", { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const initEvent = `event: open\ndata: {"status":"connected"}\n\n`;
      controller.enqueue(encoder.encode(initEvent));

      // Send server info
      const serverInfo = {
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "mochi-mcp-server", version: "1.0.0" },
        },
      };
      const infoEvent = `event: message\ndata: ${JSON.stringify(serverInfo)}\n\n`;
      controller.enqueue(encoder.encode(infoEvent));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
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
    const { method, params, id } = body;

    let result;

    if (method === "initialize") {
      result = {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "mochi-mcp-server", version: "1.0.0" },
      };
    } else if (method === "tools/list") {
      result = { tools };
    } else if (method === "tools/call") {
      const toolName = params?.name as string;
      const toolArgs = params?.arguments as Record<string, unknown> | undefined;
      const client = new MochiClient(apiKey);
      result = await handleToolCall(client, toolName, toolArgs);
    } else if (method === "notifications/initialized") {
      return new Response(null, { status: 204 });
    } else {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id, result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
