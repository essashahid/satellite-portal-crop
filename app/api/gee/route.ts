import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json();

    const res = await fetch("http://127.0.0.1:8001/gee/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("❌ Flask error:", text);
      return NextResponse.json(
        { error: "Flask service failed", detail: text },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error(
        "❌ JSON parsing failed:",
        jsonErr,
        "\nRaw response:",
        text
      );
      return NextResponse.json(
        { error: "Invalid JSON from Flask", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ API Route Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: message },
      { status: 500 }
    );
  }

}
