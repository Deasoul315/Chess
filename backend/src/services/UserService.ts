import { supabase } from "../lib/supabase";

export class UserService {
  async findById(id: number) {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  }

  async findByUserName(userName: string) {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("user_name", userName)
      .single();

    return { data, error };
  }

  async create(name: string, userName: string, hashedPassword: string) {
    return supabase
      .from("User")
      .insert({
        name,
        user_name: userName,
        password: hashedPassword,
      })
      .select("id, name, user_name")
      .single();
  }

  async update(
    userName: string,
    updates: {
      name?: string;
      password?: string;
    },
  ) {
    return supabase
      .from("User")
      .update(updates)
      .eq("user_name", userName)
      .select("name, user_name")
      .single();
  }
}

export const userService = new UserService();
