import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dzmqnmsxnyeuhuqevokc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bXFubXN4bnlldWh1cWV2b2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTg0NTAsImV4cCI6MjA4ODM3NDQ1MH0.ghUbLLiM_kCyQN36wz-CyJVFvojJBBkvsUzA9_87PuA";
console.log("Starting test...");

const supabase1 = createClient(supabaseUrl, supabaseKey);
const supabase2 = createClient(supabaseUrl, supabaseKey);

const lobby1 = supabase1.channel("lobby", {
  config: { presence: { key: "host" } },
});
const lobby2 = supabase2.channel("lobby", {
  config: { presence: { key: "guest" } },
});

lobby2.on("presence", { event: "sync" }, () => {
  console.log(
    "[GUEST] Sync! State:",
    JSON.stringify(lobby2.presenceState(), null, 2),
  );
});

lobby1.subscribe(async (status) => {
  console.log("[HOST] Subscribe:", status);
  if (status === "SUBSCRIBED") {
    console.log("[HOST] Tracking...");
    const res = await lobby1.track({
      isHost: true,
      roomInfo: {
        id: "room-123",
        name: "TestRoom",
        host: "Player1",
        status: "waiting",
        playerCount: 1,
        topic: "DSA",
        maxPlayers: 6,
      },
    });
    console.log("[HOST] Tracked:", res);
  }
});

lobby2.subscribe((status) => {
  console.log("[GUEST] Subscribe:", status);
});

setTimeout(() => process.exit(0), 10000);
