import { NextRequest, NextResponse } from "next/server";

// Simple in-memory emitter for demo purposes
// In production, this would use Redis Pub/Sub
const clients = new Set<ReadableStreamDefaultController>();

function sendEvent(data: any) {
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
        try {
            client.enqueue(encoder.encode(message));
        } catch (e) {
            clients.delete(client);
        }
    }
}

// Global emitter hook (simulated)
// This is a hacky way to expose the trigger to other API routes
// In a real app, use Redis/Pusher.
if (!(global as any).reviewEmitter) {
    (global as any).reviewEmitter = { emit: sendEvent };
}

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            clients.add(controller);

            // Send initial connection message
            controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

            // Keep-alive
            const interval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": keep-alive\n\n"));
                } catch (e) {
                    clearInterval(interval);
                    clients.delete(controller);
                }
            }, 15000);

            // Cleanup on close is handled by the catch block eventually
        },
        cancel(controller) {
            clients.delete(controller);
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
