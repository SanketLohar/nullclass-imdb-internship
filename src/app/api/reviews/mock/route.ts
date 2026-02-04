import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log("Mock Server: Received Review ADD", body);
    return NextResponse.json({ success: true, id: body.review.id });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    console.log("Mock Server: Received Review UPDATE", body);
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    console.log("Mock Server: Received Review DELETE", id);
    return NextResponse.json({ success: true });
}
