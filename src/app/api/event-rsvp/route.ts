import pool from "@/lib/db";
import { NextResponse } from "next/server";
import booths from "@/app/booths.json";
import {useMemo} from "react";

interface Booth {
  id: number;
  name: string;
  venue: string;
  description: string;
  image: string;
  events?: Record<string, BoothEvent>;
}
interface BoothEvent {
  name: string;
  time: string;
}
function findEvent(eventId: string){
  for (const booth of booths as Booth[]) {
    if (booth.events && booth.events[eventId]) {
      return {
        boothName: booth.name,
        boothVenue: booth.venue,
        event: booth.events[eventId],
      };
    }
  }
  return null;
}
export async function POST(req: Request) {
  const { email, eventId } = await req.json();
  if (!eventId){
    return NextResponse.json({ error: "No event id provided" }, {status: 400});
  }
  const eventInfo = findEvent(eventId)
  if (!eventInfo) {
    return NextResponse.json({
      error: "No event id provided",
    }, {status: 400})
  }

  if (!email) {
    return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
        "INSERT INTO event_rsvp (email, event_id) VALUES ($1, $2)",
        [email, eventId],
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