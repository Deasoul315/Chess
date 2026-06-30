import { supabase } from "../lib/supabase";

export class MatchService {
  // -----------------------------
  // ROOM LOOKUP
  // -----------------------------

  async getRoomByCode(code: string) {
    return supabase.from("Room").select("*").eq("code", code).single();
  }

  async getActiveRoomByUser(userName: string) {
    return supabase
      .from("Room")
      .select("*")
      .or(`host.eq.${userName},guest.eq.${userName}`)
      .maybeSingle();
  }

  // -----------------------------
  // ROOM CREATION
  // -----------------------------

  async createRoom(data: { code: string; host: number; guest: number }) {
    return supabase.from("Room").insert(data).select().single();
  }

  // -----------------------------
  // ROOM UPDATE (if needed later)
  // -----------------------------

  async updateRoomByCode(
    code: string,
    updates: Partial<{
      host: string;
      guest: string;
    }>,
  ) {
    return supabase
      .from("Room")
      .update(updates)
      .eq("code", code)
      .select()
      .single();
  }

  // -----------------------------
  // ROOM DELETE (optional but useful)
  // -----------------------------

  async deleteRoomByCode(code: string) {
    return supabase.from("Room").delete().eq("code", code);
  }
}

export const matchService = new MatchService();
