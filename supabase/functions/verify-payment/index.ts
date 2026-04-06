import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "oDxl7R4b67fBIIgi1FjKM1KU";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment fields" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── HMAC-SHA256 Signature Verification ──
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const encoder = new TextEncoder();
    const keyBuf = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuf = await crypto.subtle.sign("HMAC", keyBuf, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch", { expected: expectedSignature, received: razorpay_signature });
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Signature valid — update wallet balance ──
    const amountINR = parseFloat(amount) || 0;

    // Get current balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.wallet_balance ?? 0;
    const newBalance = currentBalance + amountINR;

    // Update balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("Balance update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update balance" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Insert transaction record
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "topup",
      amount: amountINR,
      status: "success",
      tx_hash: razorpay_payment_id,
    });

    return new Response(
      JSON.stringify({ success: true, new_balance: newBalance }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge fn error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
