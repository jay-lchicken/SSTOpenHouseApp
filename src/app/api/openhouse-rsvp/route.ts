import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
        "INSERT INTO openhouse_rsvp (email) VALUES ($1)",
        [email]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'code' in error && error.code === "23505") {
      return NextResponse.json({ success: true });
    }

    console.error("Error adding RSVP:", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }finally {
    client.release();
  }
}