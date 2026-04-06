import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uszudaepofmdglzvsxik.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenVkYWVwb2ZtZGdsenZzeGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTg3NTcsImV4cCI6MjA5MTAzNDc1N30.0EOWEwd9PySc0Syjwecfo-R2r0s84FEoucQY2XU4SPw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
