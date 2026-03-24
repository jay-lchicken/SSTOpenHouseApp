import pool from "@/lib/db";

export default async function RSVPPage() {
    const dynamic = "force-dynamic";
    const revalidate = 0;
    const RSVPResponses = await pool.query("SELECT email FROM openhouse_rsvp");
    const emails = RSVPResponses.rows.map(row => row.email);
    console.log("RSVP Emails:", emails);

  return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>
              <span>RSVP responses for Open House 2026</span>
          </h1>
          <div>
              {emails.map((email, i) => (
                  <div key={i}>
                      <p>{email}</p>
                  </div>
              ))}
          </div>


        </div>
      </div>
  );
}
