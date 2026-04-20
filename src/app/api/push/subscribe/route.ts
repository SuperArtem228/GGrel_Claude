import { NextRequest, NextResponse } from "next/server";
import { savePushSubscriptionAction } from "@/actions/push";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
    }
    await savePushSubscriptionAction({
      endpoint: String(body.endpoint),
      keys: { p256dh: String(body.keys.p256dh), auth: String(body.keys.auth) },
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
