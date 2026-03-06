// ═══════════════════════════════════════════════
// BuggedOut — Socket.io P2P Emulator via Supabase
// Replaces real web sockets with Supabase Broadcast
// ═══════════════════════════════════════════════

import { supabase } from "./supabase.js";
import { HostServer } from "./engine/HostServer.js";

class FakeSocket {
  constructor() {
    // Generate a permanent pseudo-socket ID for this browser tab, or load existing
    const storedId = sessionStorage.getItem("buggedOut_socketId");
    if (storedId) {
      this.id = storedId;
    } else {
      this.id = Math.random().toString(36).substring(2, 16);
      sessionStorage.setItem("buggedOut_socketId", this.id);
    }

    this.listeners = {};

    this.roomChannel = null;
    this.isHost = false;
    this.hostServer = null;

    // Load existing identity to prevent logout on refresh
    const storedIdentity = sessionStorage.getItem("buggedOut_identity");
    this.identity = storedIdentity ? JSON.parse(storedIdentity) : null;

    // ─── LOBBY PRESENCE CHANNEL ──────────────────
    // Used exclusively to display available rooms to waiting players
    this.lobbyChannel = supabase.channel("lobby", {
      config: { presence: { key: this.id } },
    });

    this.lobbyChannel
      .on("presence", { event: "sync" }, () => {
        const state = this.lobbyChannel.presenceState();
        console.log("[LOBBY SYNC] Current presence state:", state);
        const roomsList = [];
        for (const key in state) {
          state[key].forEach((p) => {
            if (p.isHost && p.roomInfo) {
              roomsList.push(p.roomInfo);
            }
          });
        }
        console.log("[LOBBY SYNC] Derived roomsList:", roomsList);
        this.trigger("rooms:list", roomsList);
        this.trigger("connect"); // Emulate connect success
      })
      .subscribe((status) => {
        console.log("[LOBBY SUBSCRIBE] Status:", status);
      });
  }

  // ─── EVENT LISTENER REGISTRATION ─────────────

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    if (!callback) this.listeners[event] = [];
    else
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
  }

  trigger(event, payload) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(payload));
    }
  }

  // ─── CLIENT EMITS (Player actions) ───────────

  emit(event, payload = {}) {
    if (event === "rooms:list") {
      const state = this.lobbyChannel.presenceState();
      console.log("[EMIT rooms:list] Current presence state:", state);
      const roomsList = [];
      for (const key in state) {
        state[key].forEach((p) => {
          if (p.isHost && p.roomInfo) {
            roomsList.push(p.roomInfo);
          }
        });
      }
      console.log("[EMIT rooms:list] Derived roomsList:", roomsList);
      this.trigger("rooms:list", roomsList);
      return;
    }

    // 1. Identity handling (local cache)
    if (event === "player:setIdentity") {
      this.identity = payload;
      sessionStorage.setItem("buggedOut_identity", JSON.stringify(payload));
      this.trigger("identity:set", payload);
      return;
    }

    // 2. Room Creation (Becomes Host)
    if (event === "room:create") {
      const roomId = "room-" + Math.random().toString(36).substr(2, 6);
      this.isHost = true;

      this.joinRoomChannel(roomId, () => {
        // Instantiate the Host Game Engine
        this.hostServer = new HostServer(roomId, this);
        // Inject identity and route to host engine
        this.hostServer.handleClientEvent(this.id, event, {
          ...payload,
          identity: this.identity,
        });
      });
      return;
    }

    // 3. Room Joining (Becomes Client)
    if (event === "room:join") {
      this.isHost = false;
      this.hostServer = null;

      this.joinRoomChannel(payload.roomId, () => {
        // Send join request to whoever the host is
        this.roomChannel.send({
          type: "broadcast",
          event: "client_event",
          payload: {
            clientId: this.id,
            event,
            data: { ...payload, identity: this.identity },
          },
        });
      });
      return;
    }

    // 4. Leaving a Room
    if (event === "room:leave") {
      if (this.isHost && this.hostServer) {
        this.hostServer.handleClientEvent(this.id, event, payload);
        this.lobbyChannel.untrack(); // Remove from lobby
      } else if (this.roomChannel) {
        this.roomChannel.send({
          type: "broadcast",
          event: "client_event",
          payload: { clientId: this.id, event, data: payload },
        });
      }

      if (this.roomChannel) {
        supabase.removeChannel(this.roomChannel);
        this.roomChannel = null;
      }
      this.isHost = false;
      this.hostServer = null;
      return;
    }

    // 5. Standard Gameplay Events
    if (this.isHost && this.hostServer) {
      // Proccess locally instantly
      this.hostServer.handleClientEvent(this.id, event, payload);
    } else if (this.roomChannel) {
      // Forward to host via broadcast
      this.roomChannel.send({
        type: "broadcast",
        event: "client_event",
        payload: { clientId: this.id, event, data: payload },
      });
    }
  }

  // ─── CHANNEL MANAGEMENT ──────────────────────

  joinRoomChannel(roomId, onJoin) {
    if (this.roomChannel) {
      supabase.removeChannel(this.roomChannel);
    }

    this.roomChannel = supabase.channel(`game:${roomId}`, {
      // Optional: limit broadcast rate if game gets jerky
    });

    // Clients listen for server events
    this.roomChannel.on(
      "broadcast",
      { event: "server_event" },
      ({ payload }) => {
        // Check if message is addressed specifically to someone else
        if (payload.targetId && payload.targetId !== this.id) return;
        this.trigger(payload.event, payload.data);
      },
    );

    // Host listens for client events
    if (this.isHost) {
      this.roomChannel.on(
        "broadcast",
        { event: "client_event" },
        ({ payload }) => {
          if (this.hostServer) {
            this.hostServer.handleClientEvent(
              payload.clientId,
              payload.event,
              payload.data,
            );
          }
        },
      );
    }

    this.roomChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") onJoin();
    });
  }

  // ─── HOST SERVER EMITTERS (Used by HostServer) ───

  updateLobbyPresence(roomObj) {
    if (!this.isHost) return;
    const trackPayload = {
      isHost: true,
      roomInfo: {
        id: roomObj.id,
        name: roomObj.name,
        host: roomObj.players[roomObj.host]?.username || roomObj.host,
        status: roomObj.status,
        playerCount: Object.keys(roomObj.players).length,
        topic: roomObj.topic || "DSA",
        maxPlayers: roomObj.maxPlayers || 6,
      },
    };
    console.log("[TRACK LOBBY PRESENCE] Sending payload:", trackPayload);
    this.lobbyChannel
      .track(trackPayload)
      .then((res) => {
        console.log("[TRACK LOBBY PRESENCE] Track response:", res);
      })
      .catch((err) => {
        console.error("[TRACK LOBBY PRESENCE] Track error:", err);
      });
  }

  removeLobbyPresence() {
    if (!this.isHost) return;
    this.lobbyChannel.untrack();
  }

  // Emits a targeted event (socket.emit replacements)
  serverEmit(targetId, event, data) {
    if (targetId === this.id) {
      this.trigger(event, data);
    } else if (this.roomChannel) {
      this.roomChannel.send({
        type: "broadcast",
        event: "server_event",
        payload: { targetId, event, data },
      });
    }
  }

  // Emits a global room event (io.to(roomId).emit replacements)
  serverEmitToRoom(roomId, event, data) {
    this.trigger(event, data); // execute on self
    if (this.roomChannel) {
      this.roomChannel.send({
        type: "broadcast",
        event: "server_event",
        payload: { targetId: null, event, data },
      });
    }
  }
}

const socket = new FakeSocket();
export default socket;
