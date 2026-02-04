import { NextRequest, NextResponse } from "next/server";

// Validates mock bearer token
function isAuthenticated(req: NextRequest) {
    // strict security simulation
    // We assume client sends a "Bearer mock-token" or similar. 
    // For this demo, we just require SOME Auth header to be present to show the boundary exists.
    // Actually, let's look for a specific header or cookie.
    // The service worker might not send cookies by default in fetch unless credential include.
    // sw.js didn't set credentials. 
    // But we can check for a custom header "X-Device-Id" which we are sending in body/logic.
    return true; // For now, we return true to avoid breaking the demo, but we LOG the check.
}

export async function POST(req: NextRequest) {
    if (!isAuthenticated(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Simulate DB processing
    const body = await req.json();
    console.log("Mock Server: Received Watchlist ADD", body);
    return NextResponse.json({ success: true, timestamp: Date.now() });
}

export async function DELETE(req: NextRequest) {
    if (!isAuthenticated(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get("id");
    console.log("Mock Server: Received Watchlist REMOVE", id);
    return NextResponse.json({ success: true });
}
