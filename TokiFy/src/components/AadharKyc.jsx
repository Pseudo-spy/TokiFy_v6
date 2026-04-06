import { useState, useRef, useCallback } from "react";
import OtpInput from "react-otp-input";
import Webcam from "react-webcam";
import { supabase } from "../lib/supabaseClient";

const SUPABASE_URL = "https://uszudaepofmdglzvsxik.supabase.co";

const inp = {
  width: "100%", padding: "14px 16px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, color: "#fff", fontFamily: "'Syne',sans-serif",
  fontSize: 14, outline: "none", transition: "border-color .2s",
};
const lbl = {
  display: "block", fontSize: 10, color: "rgba(255,255,255,0.55)",
  letterSpacing: ".4em", textTransform: "uppercase",
  marginBottom: 8, fontFamily: "'Syne',sans-serif",
};
const brandBtn = {
  background: "linear-gradient(135deg,#e8210a,#f56a00)",
  color: "#fff", border: "none", borderRadius: 12,
  fontFamily: "'Syne',sans-serif", fontWeight: 700,
  fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase",
  cursor: "pointer", width: "100%", padding: "15px",
};

const OTP_STYLE = {
  width: "48px", height: "56px", fontSize: 20, fontWeight: 700, textAlign: "center",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10, color: "#fff", fontFamily: "'Syne',sans-serif", outline: "none",
};

export default function AadharKyc({ onVerified, onSkip }) {
  const [stage, setStage] = useState("aadhar"); // aadhar | otp | webcam | processing | done | error
  const [aadharNum, setAadharNum] = useState("");
  const [txId, setTxId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selfieImg, setSelfieImg] = useState(null);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

  const formatAadhar = (v) => v.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  /* ── 1. Send Aadhar OTP ── */
  const handleSendAadharOtp = async () => {
    const digits = aadharNum.replace(/\s/g, "");
    if (digits.length !== 12) { setError("Enter a valid 12-digit Aadhaar number"); return; }
    setLoading(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/aadhar-otp-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ aadhar_number: digits }),
      });
      const json = await res.json();
      if (!res.ok || !json.transaction_id) {
        setError(json.error || "Failed to send OTP. Check Surepass sandbox token.");
        return;
      }
      setTxId(json.transaction_id);
      setStage("otp");
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── 2. Verify OTP (auto on 6 digits) ── */
  const handleOtpChange = (val) => {
    setOtp(val);
    if (val.length === 6) setStage("webcam");
  };

  /* ── 3. Capture selfie ── */
  const captureSelfie = useCallback(() => {
    const img = webcamRef.current?.getScreenshot();
    if (img) setSelfieImg(img);
  }, []);

  /* ── 4. Submit to face-match edge function ── */
  const handleFaceMatch = async () => {
    if (!selfieImg) { setError("Please capture a selfie first"); return; }
    setLoading(true); setError(""); setStage("processing");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // selfieImg is a base64 data URL — strip the prefix
      const base64 = selfieImg.split(",")[1];
      const res = await fetch(`${SUPABASE_URL}/functions/v1/aadhar-face-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ transaction_id: txId, otp, selfie_base64: base64 }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Face match failed"); setStage("error"); return; }
      setResult(json);
      setStage("done");
      onVerified?.(json);
    } catch (e) {
      setError("Network error during face match.");
      setStage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* ── STAGE: AADHAR INPUT ── */}
      {stage === "aadhar" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#e8210a,#f56a00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🪪</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: ".06em" }}>Aadhaar Verification</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Powered by Surepass Sandbox</div>
            </div>
          </div>

          <label style={lbl}>Aadhaar Number *</label>
          <input
            type="text" inputMode="numeric"
            placeholder="1234 5678 9012"
            style={{ ...inp, letterSpacing: "0.15em", marginBottom: 6, borderColor: error ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.1)" }}
            value={aadharNum}
            onChange={(e) => { setAadharNum(formatAadhar(e.target.value)); setError(""); }}
          />
          {error && <div style={{ color: "#ff5555", fontSize: 12, fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>{error}</div>}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", marginBottom: 18 }}>
            🔒 Verified via UIDAI API • masked storage only
          </p>
          <button style={{ ...brandBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSendAadharOtp} disabled={loading}>
            {loading ? "⏳ Sending OTP…" : "Send Aadhaar OTP →"}
          </button>
          {onSkip && (
            <button onClick={onSkip} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 10 }}>
              Skip for now
            </button>
          )}
        </div>
      )}

      {/* ── STAGE: OTP ── */}
      {stage === "otp" && (
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>Enter the OTP sent to your Aadhaar-linked mobile</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", marginBottom: 24 }}>Transaction ID: {txId.slice(0, 12)}…</p>

          <label style={lbl}>6-Digit Aadhaar OTP</label>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              numInputs={6}
              renderSeparator={<span style={{ width: 8 }} />}
              renderInput={(props) => <input {...props} style={OTP_STYLE} />}
              inputType="tel"
              shouldAutoFocus
            />
          </div>
          {error && <div style={{ color: "#ff5555", fontSize: 12, fontFamily: "'Syne',sans-serif", marginBottom: 12, textAlign: "center" }}>{error}</div>}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", textAlign: "center" }}>OTP verified automatically on 6th digit → proceed to selfie</p>
          <button onClick={() => setStage("aadhar")} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 14 }}>← Back</button>
        </div>
      )}

      {/* ── STAGE: WEBCAM ── */}
      {stage === "webcam" && (
        <div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: ".06em", marginBottom: 6 }}>Selfie Capture</div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Position your face within the frame and capture a clear selfie</p>

          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 16, border: "2px solid rgba(232,33,10,0.3)", position: "relative" }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 480, height: 360 }}
              style={{ width: "100%", display: "block" }}
            />
            {/* Face guide overlay */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 160, height: 200, border: "2px dashed rgba(245,106,0,0.6)", borderRadius: "50%", boxShadow: "0 0 0 2000px rgba(0,0,0,0.3)" }} />
            </div>
          </div>

          {selfieImg && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <img src={selfieImg} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #4ade80" }} />
              <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "'Syne',sans-serif", marginTop: 4 }}>✅ Selfie captured</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={captureSelfie} style={{ ...brandBtn, flex: 1 }}>📸 Capture Selfie</button>
            {selfieImg && (
              <button onClick={handleFaceMatch} disabled={loading} style={{ ...brandBtn, flex: 2, opacity: loading ? 0.7 : 1 }}>
                {loading ? "⏳ Matching…" : "Verify Face →"}
              </button>
            )}
          </div>
          {error && <div style={{ color: "#ff5555", fontSize: 12, fontFamily: "'Syne',sans-serif", marginTop: 10 }}>{error}</div>}
        </div>
      )}

      {/* ── STAGE: PROCESSING ── */}
      {stage === "processing" && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", margin: "0 auto 20px", background: "rgba(245,106,0,0.1)", border: "2px solid rgba(245,106,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, animation: "spin 1.2s linear infinite" }}>⟳</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: ".05em", marginBottom: 8 }}>Running Face Match</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif" }}>Comparing selfie with Aadhaar photo via Surepass AI…</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ── STAGE: DONE ── */}
      {stage === "done" && result && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{result.kyc_status === "verified" ? "✅" : "❌"}</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, letterSpacing: ".05em", marginBottom: 6 }}>
            {result.kyc_status === "verified" ? "KYC Verified!" : "Verification Failed"}
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", marginTop: 16, textAlign: "left" }}>
            {[["Name", result.aadhar_name], ["Face Match", `${(result.face_match_score * 100).toFixed(1)}%`], ["Status", result.kyc_status?.toUpperCase()]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif" }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAGE: ERROR ── */}
      {stage === "error" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, marginBottom: 8 }}>Verification Error</div>
          <div style={{ fontSize: 12, color: "#ff5555", fontFamily: "'Syne',sans-serif", marginBottom: 20 }}>{error}</div>
          <button onClick={() => { setStage("aadhar"); setError(""); setOtp(""); setSelfieImg(null); }} style={brandBtn}>Try Again</button>
        </div>
      )}
    </div>
  );
}
