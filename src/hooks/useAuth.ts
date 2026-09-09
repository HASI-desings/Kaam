import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  async function signUpWithEmail(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  }

  async function loginWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function sendMobileOtp(phone: string) {
    return supabase.auth.signInWithOtp({ phone });
  }

  async function verifyMobileOtp(phone: string, token: string) {
    return supabase.auth.verifyOtp({ phone, token, type: "sms" });
  }

  async function verifyEmailOtp(email: string, token: string) {
    return supabase.auth.verifyOtp({ email, token, type: "email" });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  return { signUpWithEmail, loginWithEmail, sendMobileOtp, verifyMobileOtp, verifyEmailOtp, signOut };
}
