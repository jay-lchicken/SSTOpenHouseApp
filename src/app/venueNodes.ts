// Maps venue/location names to graph node IDs.
// Not all graph nodes correspond to a venue — some are just pathway nodes.
// Update this mapping as needed to match actual school layout.

export const venueToNode: Record<string, string> = {
  "Entrance": "1",
  "Auditorium": "37",
  "Atrium": "23",
  "LO1": "47",
  "LO2": "44",
  "ADMT Studio": "32",
  "Maker Lab": "29",
  "Physics Lab 2": "32",
  "Chem Lab 2": "12",
  "Biotech Lab 1": "10",
  "Engineering Lab": "33",
  "Bio Lab 1": "11",
  "Physics Lab 1": "33",
  "SST Inc": "46",
  "Robotics Room": "43",
  "MPR3": "45",
};

// Reverse mapping: node ID -> venue name
export const nodeToVenue: Record<string, string> = Object.fromEntries(
  Object.entries(venueToNode).map(([venue, node]) => [node, venue])
);
