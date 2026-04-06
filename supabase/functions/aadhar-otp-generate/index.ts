import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Surepass sandbox base URL
const SUREPASS_BASE = "https://sandbox.surepass.io/api/v1";
const SUREPASS_TOKEN = Deno.env.get("SUREPASS_TOKEN") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { aadhar_number } = await req.json();
    if (!aadhar_number || String(aadhar_number).replace(/\s/g, "").length !== 12) {
      return new Response(JSON.stringify({ error: "Invalid Aadhar number" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // --- MOCK FALLBACK FOR TESTING ---
    if (!SUREPASS_TOKEN || SUREPASS_TOKEN === "dummy_token") {
      console.log("Using mock Surepass response (no real token provided)");
      await new Promise(r => setTimeout(r, 800)); // simulate network delay
      return new Response(
        JSON.stringify({ success: true, transaction_id: "mock_client_" + Date.now() }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }
    // ---------------------------------

    const res = await fetch(`${SUREPASS_BASE}/aadhaar-v2/generate-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUREPASS_TOKEN}`,
      },
      body: JSON.stringify({ id_number: aadhar_number.replace(/\s/g, "") }),
    });

    const data = await res.json();

    if (!res.ok || !data?.data?.client_id) {
      console.error("Surepass error:", data);
      return new Response(
        JSON.stringify({ error: data?.message || "OTP generation failed" }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, transaction_id: data.data.client_id }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge fn error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
