// Maps venue/location names to graph node IDs.
// Not all graph nodes correspond to a venue — some are just pathway nodes.
// Update this mapping as needed to match actual school layout.

export const venueToNode: Record<string, string> = {
  "Entrance": "1",
  "Auditorium": "3",
  "Atrium": "22",
  "LO1": "5",
  "LO2": "6",
  "ADMT Studio": "21",
  "Maker Lab": "18",
  "Physics Lab 2": "8",
  "Chem Lab 2": "9",
  "Biotech Lab 1": "10",
  "Engineering Lab": "11",
  "Bio Lab 1": "12",
  "Physics Lab 1": "L1_13",
  "Research Lab": "14",
  "SST Inc": "46",
  "Outside Maker Lab": "L1_20",
  "Robotics Room": "24",
  "MPR3": "27",
};

// Reverse mapping: node ID -> venue name
export const nodeToVenue: Record<string, string> = Object.fromEntries(
  Object.entries(venueToNode).map(([venue, node]) => [node, venue])
);
