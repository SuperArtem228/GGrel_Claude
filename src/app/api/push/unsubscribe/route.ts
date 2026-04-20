import { NextRequest, NextResponse } from "next/server";
import { removePushSubscriptionAction } from "@/actions/push";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    await removePushSubscriptionAction(String(body.endpoint));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
