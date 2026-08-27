import { userRepository } from "@/lib/repositories";
import type { Activity, User } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

/**
 * Service de usuários e feed de atividades.
 */
export class UserService {
  async getCurrentUser(authUser?: AuthUser | null, serverClient?: SupabaseClient): Promise<User | null> {
    return userRepository.findCurrent(authUser, serverClient);
  }

  async getActivities(): Promise<Activity[]> {
    return userRepository.findActivities();
  }

  async sendVerificationOtp(email: string, supabase: SupabaseClient) {
    const { error } = await supabase.auth.resend({
      email,
      type: "signup",
    });
    return { error };
  }

  async verifyOtp(email: string, token: string, supabase: SupabaseClient) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (!error && data.user) {
      await supabase
        .from("users")
        .update({ email_verified: true })
        .eq("auth_id", data.user.id);
    }

    return { data, error };
  }

  async isEmailVerified(userId: string, supabase: SupabaseClient): Promise<boolean> {
    const { data } = await supabase
      .from("users")
      .select("email_verified")
      .eq("id", userId)
      .single();

    return data?.email_verified ?? false;
  }
}

export const userService = new UserService();
