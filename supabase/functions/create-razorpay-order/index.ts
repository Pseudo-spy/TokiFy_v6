import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "rzp_test_Sa9AsT2bFXZnuv";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "oDxl7R4b67fBIIgi1FjKM1KU";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { amount } = await req.json(); // amount in INR (integer)
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Razorpay amounts are in paise (1 INR = 100 paise)
    const amountPaise = Math.round(amount * 100);
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `TKF-${Date.now()}`,
        notes: { purpose: "Tokify Wallet Top-up" },
      }),
    });

    const order = await response.json();
    if (!response.ok || !order.id) {
      console.error("Razorpay error:", order);
      return new Response(
        JSON.stringify({ error: order?.error?.description || "Order creation failed (Check Razorpay Keys)" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge fn error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Internal error" }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
