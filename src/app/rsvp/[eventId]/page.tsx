import RSVPClient from './RSVPClient';
import booths from '../../booths.json';

interface Booth {
  id: number;
  name: string;
  venue: string;
  description: string;
  image: string;
  events?: Record<string, { name: string; time: string }>;
}

function findEvent(eventId: string) {
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

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { eventId } = await params;
  const eventInfo = findEvent(eventId);

  return <RSVPClient eventId={eventId} eventInfo={eventInfo} />;
}
