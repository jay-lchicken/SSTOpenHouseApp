import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, responses } = await req.json();

  if (!email) {
    return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
    );
  }
  if (!responses || typeof responses !== "object") {
    return NextResponse.json(
        { error: "Responses are required" },
        { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
        "INSERT INTO openhouse_rsvp (email, responses) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET responses = EXCLUDED.responses",
        [email, responses]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding RSVP:", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }finally {
    client.release();
  }
}
