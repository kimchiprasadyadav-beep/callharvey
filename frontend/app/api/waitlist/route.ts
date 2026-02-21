import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, source: "landing_page" }, { onConflict: "email" });

    if (error) {
      console.error("Supabase waitlist error:", error);
      return NextResponse.json({ success: true, fallback: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ success: true, fallback: true });
  }
}
