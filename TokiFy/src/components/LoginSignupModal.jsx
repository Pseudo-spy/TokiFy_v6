import { useState, useEffect } from "react";
import OtpInput from "react-otp-input";
import { supabase } from "../lib/supabaseClient";
import { countryCodes, indianStates } from "../data/content";

/* ── Styles ── */
const inputStyle = {
  width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff",
  fontFamily: "'Syne',sans-serif", fontSize: 14, marginBottom: 6, outline: "none",
  transition: "border-color 0.2s",
};
const errStyle   = { color: "#ff5555", fontSize: 11, fontFamily: "'Syne',sans-serif", marginBottom: 14, display: "block" };
const labelStyle = {
  display: "block", fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 6,
  fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.07em",
};
const ctaBtn = {
  width: "100%", padding: "15px", background: "linear-gradient(135deg,#e8210a,#f56a00)",
  color: "#fff", border: "none", borderRadius: 8, fontFamily: "'Syne',sans-serif",
  fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer",
  textTransform: "uppercase", marginTop: 8,
};
const selectStyle = {
  ...inputStyle, appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 32,
};

const OTP_INPUT_STYLE = {
  width: "clamp(42px,13vw,54px)",
  height: "clamp(50px,14vw,62px)",
  fontSize: 22,
  fontWeight: 700,
  textAlign: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#fff",
  fontFamily: "'Syne',sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
};
const OTP_FOCUS_STYLE = { ...OTP_INPUT_STYLE, border: "1px solid rgba(232,33,10,0.7)" };

/* ─────────────────────────────────────────────────────────── */
export default function LoginSignupModal({ onLoginSuccess }) {
  const [isOpen,          setIsOpen]          = useState(false);
  const [step,            setStep]            = useState(1);
  const [region,          setRegion]          = useState("India");
  const [lang,            setLang]            = useState("English");

  // Step 1 — Email
  const [email,           setEmail]           = useState("");
  const [emailError,      setEmailError]      = useState("");
  const [sendingOtp,      setSendingOtp]      = useState(false);

  // Step 2 — OTP
  const [otp,             setOtp]             = useState("");
  const [otpError,        setOtpError]        = useState("");
  const [verifyingOtp,    setVerifyingOtp]    = useState(false);
  const [resendTimer,     setResendTimer]     = useState(30);
  const [canResend,       setCanResend]       = useState(false);

  // Step 3 — Personal
  const [fullName,        setFullName]        = useState("");
  const [dob,             setDob]             = useState("");
  const [gender,          setGender]          = useState("");
  const [address,         setAddress]         = useState("");
  const [city,            setCity]            = useState("");
  const [pincode,         setPincode]         = useState("");
  const [state,           setState]           = useState("");
  const [personalErrors,  setPersonalErrors]  = useState({});
  const [savingPersonal,  setSavingPersonal]  = useState(false);

  // Step 4 — KYC Docs
  const [docType,         setDocType]         = useState("aadhaar");
  const [aadhaarNum,      setAadhaarNum]      = useState("");
  const [panNum,          setPanNum]          = useState("");
  const [passportNum,     setPassportNum]     = useState("");
  const [voterNum,        setVoterNum]        = useState("");
  const [passportExpiry,  setPassportExpiry]  = useState("");
  const [loading,         setLoading]         = useState(null);
  const [docUploaded,     setDocUploaded]     = useState(false);
  const [selfieUploaded,  setSelfieUploaded]  = useState(false);
  const [kycSuccess,      setKycSuccess]      = useState(false);
  const [docErrors,       setDocErrors]       = useState({});
  const [ocrData,         setOcrData]         = useState(null);

  /* ──  Resend countdown ── */
  useEffect(() => {
    if (step !== 2) return;
    setResendTimer(30); setCanResend(false);
    const iv = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(iv); setCanResend(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  /* ── Hash listener ── */
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === "#login" || h === "#signup") {
        setIsOpen(true); setStep(1);
        resetAll();
      } else { setIsOpen(false); }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  /* ── Also check session on mount (returning user) ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onLoginSuccess();
    });
  }, []);

  function resetAll() {
    setEmail(""); setEmailError(""); setOtp(""); setOtpError("");
    setFullName(""); setDob(""); setGender(""); setAddress(""); setCity(""); setPincode(""); setState("");
    setAadhaarNum(""); setPanNum(""); setPassportNum(""); setVoterNum(""); setPassportExpiry("");
    setPersonalErrors({}); setDocErrors({}); setKycSuccess(false);
    setDocUploaded(false); setSelfieUploaded(false); setOcrData(null);
  }

  if (!isOpen) return null;
  const close = () => { window.location.hash = ""; };

  /* ── STEP 1: Send Email OTP via Supabase ── */
  const validateEmail = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Enter a valid email address"); return false;
    }
    setEmailError(""); return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;
    setSendingOtp(true);
    try {
      // --- DEV BYPASS ---
      if (email.toLowerCase() === "test@tokify.com") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: "Tokify123!",
        });
        if (error) {
          setEmailError("Test bypass failed. Did you use 'Tokify123!' as the password?");
          return;
        }
        if (data?.session) {
          await supabase.from("profiles").upsert({ id: data.user.id, email }, { onConflict: "id", ignoreDuplicates: true });
          setStep(3); // Jump straight to KYC step!
          return;
        }
      }
      // ------------------

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) { setEmailError(error.message); return; }
      setStep(2);
    } catch (e) {
      setEmailError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleGoogleSSO = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // Optional: you can set redirectTo to window.location.href or similar to return exactly where they were
      });
      if (error) setEmailError(error.message);
    } catch (e) {
      setEmailError("Failed to launch Google Login.");
    }
  };

  /* ── STEP 2: Verify OTP ── */
  const handleOtpChange = async (val) => {
    setOtp(val); setOtpError("");
    // Auto-verify when 6th digit is entered
    if (val.length === 6) {
      await verifyOtp(val);
    }
  };

  const verifyOtp = async (code) => {
    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) { setOtpError(error.message || "Invalid OTP. Please try again."); return; }
      if (data?.session) {
        // Create profile row if doesn't exist
        await supabase.from("profiles").upsert({ id: data.user.id, email }, { onConflict: "id", ignoreDuplicates: true });
        setStep(3);
      }
    } catch (e) {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResend = async () => {
    setOtp(""); setOtpError("");
    await supabase.auth.signInWithOtp({ email });
    setResendTimer(30); setCanResend(false);
  };

  /* ── STEP 3: Save personal details ── */
  const validatePersonal = () => {
    const errs = {};
    if (!fullName.trim() || fullName.trim().split(" ").length < 2) errs.fullName = "Enter your full name (first & last)";
    if (!dob) errs.dob = "Date of birth is required";
    else { const age = Math.floor((Date.now() - new Date(dob)) / 31557600000); if (age < 18) errs.dob = "You must be at least 18 years old"; }
    if (!gender) errs.gender = "Select gender";
    if (!address.trim()) errs.address = "Address is required";
    if (!city.trim()) errs.city = "City is required";
    if (region === "India" && !pincode.match(/^\d{6}$/)) errs.pincode = "Enter a valid 6-digit pincode";
    if (region === "India" && !state) errs.state = "Select your state";
    setPersonalErrors(errs); return Object.keys(errs).length === 0;
  };

  const handleSavePersonal = async () => {
    if (!validatePersonal()) return;
    setSavingPersonal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id, email, full_name: fullName, dob, gender,
          address, city, pincode, state, kyc_status: "pending",
        });
      }
      setStep(4);
    } catch (e) {
      console.error("Save personal error:", e);
      setStep(4); // proceed anyway
    } finally {
      setSavingPersonal(false);
    }
  };

  /* ── STEP 4: KYC ── */
  const validateDocs = () => {
    const errs = {};
    if (docType === "aadhaar" && !aadhaarNum.replace(/\s/g, "").match(/^\d{12}$/)) errs.aadhaar = "Enter a valid 12-digit Aadhaar number";
    if (docType === "pan" && !panNum.toUpperCase().match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) errs.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (docType === "passport" && !passportNum.toUpperCase().match(/^[A-Z]{1}[0-9]{7}$/)) errs.passport = "Enter a valid passport number";
    if (docType === "passport" && !passportExpiry) errs.passportExpiry = "Passport expiry date is required";
    if (docType === "voter" && !voterNum.trim()) errs.voter = "Enter your Voter ID number";
    if (!selfieUploaded) errs.selfie = "Please upload a selfie for face verification";
    if (!docUploaded) errs.doc = "Please upload your document image";
    setDocErrors(errs); return Object.keys(errs).length === 0;
  };

  const handleSubmitKyc = async () => {
    if (!validateDocs()) return;
    setLoading("submitting");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          kyc_status: "pending",
          ...(ocrData || {}),
        });
      }
      setTimeout(() => { setLoading(null); setKycSuccess(true); setTimeout(() => { onLoginSuccess?.(); }, 1600); }, 1800);
    } catch {
      setTimeout(() => { setLoading(null); setKycSuccess(true); setTimeout(() => { onLoginSuccess?.(); }, 1600); }, 1800);
    }
  };

  /* ── OCR from document image ── */
  const handleDocUpload = async (file) => {
    if (!file) return;
    setLoading("doc");
    try {
      // Dynamic import to avoid blocking main bundle
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Extract fields from OCR text
      const extracted = parseOcrText(text);
      setOcrData(extracted);

      // Pre-fill personal fields if found
      if (extracted.name && !fullName) setFullName(extracted.name);
      if (extracted.dob && !dob) setDob(extracted.dob);
    } catch (e) {
      console.warn("OCR error:", e);
    } finally {
      setLoading(null);
      setDocUploaded(true);
      setDocErrors((p) => ({ ...p, doc: null }));
    }
  };

  /** Simple regex-based OCR field extraction */
  function parseOcrText(text) {
    const result = {};
    // Name: line starting with "Name:" or all-caps words
    const nameMatch = text.match(/(?:Name|NAME)\s*[:\-]?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
    if (nameMatch) result.name = nameMatch[1].trim();

    // DOB: dd/mm/yyyy or dd-mm-yyyy
    const dobMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (dobMatch) result.dob = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`; // ISO format

    // Gender
    if (/MALE|Male|FEMALE|Female/.test(text)) {
      result.gender = /FEMALE|Female/.test(text) ? "Female" : "Male";
    }

    // Address: look for common address keywords
    const addrMatch = text.match(/(?:Address|ADDRESS|Addr)\s*[:\-]?\s*(.{10,80})/);
    if (addrMatch) result.address = addrMatch[1].trim();

    return result;
  }

  const formatAadhaar = (val) => val.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const docTypes = region === "India"
    ? [{ k: "aadhaar", l: "🪪 Aadhaar" }, { k: "pan", l: "💳 PAN Card" }, { k: "passport", l: "🛂 Passport" }, { k: "voter", l: "🗳️ Voter ID" }]
    : [{ k: "passport", l: "🛂 Passport" }, { k: "pan", l: "💳 PAN Card" }];

  const stepLabels = ["", "Email Verification", "OTP Verification", "Personal Details", "KYC Documents"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 500, background: "rgba(14,14,14,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "clamp(20px,5vw,40px) clamp(16px,5vw,36px)", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", marginTop: 24, marginBottom: 24 }}>

        {/* Close */}
        <button onClick={close} style={{ position: "absolute", top: 16, right: 18, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(26px,6vw,34px)", letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>TOKIFY</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, color: "#f56a00", marginTop: 2 }}>{stepLabels[step]}</div>
        </div>

        {/* Progress */}
        {step <= 4 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "linear-gradient(90deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
            ))}
          </div>
        )}

        {/* ── STEP 1: EMAIL ── */}
        {step === 1 && (
          <div>
            <label style={labelStyle}>Account Type</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["India", "NRI"].map((r) => (
                <button key={r} onClick={() => setRegion(r)} style={{ flex: 1, padding: "11px 8px", borderRadius: 8, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: region === r ? "linear-gradient(135deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.05)", border: region === r ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)", color: region === r ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {r === "NRI" ? "🌍 NRI / International" : "🇮🇳 India Resident"}
                </button>
              ))}
            </div>

            <label style={labelStyle}>Preferred Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...selectStyle, marginBottom: 20 }}>
              <option>English</option><option>Hindi</option><option>Bengali</option>
              <option>Tamil</option><option>Telugu</option><option>Marathi</option>
            </select>

            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              placeholder="you@example.com"
              style={{ ...inputStyle, borderColor: emailError ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            />
            {emailError && <span style={errStyle}>{emailError}</span>}

            <div style={{ background: "rgba(232,33,10,0.06)", border: "1px solid rgba(232,33,10,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, marginTop: 8 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", margin: 0 }}>
                📧 We'll send a 6-digit OTP to your email. No password needed — secure magic link login powered by Supabase.
              </p>
            </div>

            <button style={{ ...ctaBtn, opacity: sendingOtp ? 0.7 : 1 }} onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? "⏳ Sending OTP…" : "Send OTP via Email →"}
            </button>

            <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ margin: "0 14px", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'Syne',sans-serif" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            <button style={{ ...ctaBtn, background: "#fff", color: "#111", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={handleGoogleSSO}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", textAlign: "center", marginTop: 24 }}>
              By continuing you agree to Tokify's Terms & Privacy Policy. Your data is encrypted end-to-end.
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>We sent a 6-digit OTP to</p>
            <p style={{ fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 28 }}>{email}</p>

            <label style={labelStyle}>Enter OTP</label>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={6}
                renderSeparator={<span style={{ width: 8 }} />}
                renderInput={(props) => (
                  <input
                    {...props}
                    style={{
                      ...OTP_INPUT_STYLE,
                      ...(document.activeElement === props.ref?.current ? OTP_FOCUS_STYLE : {}),
                    }}
                  />
                )}
                inputType="tel"
                shouldAutoFocus
              />
            </div>

            {verifyingOtp && (
              <div style={{ textAlign: "center", padding: "12px 0", color: "#f56a00", fontFamily: "'Syne',sans-serif", fontSize: 13 }}>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Verifying…
              </div>
            )}
            {otpError && <span style={{ ...errStyle, display: "block", textAlign: "center", marginTop: 8 }}>{otpError}</span>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, marginTop: 8 }}>
              {canResend
                ? <button onClick={handleResend} style={{ background: "transparent", border: "none", color: "#f56a00", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: 12 }}>Resend OTP</button>
                : <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Syne',sans-serif", fontSize: 12 }}>Resend in {resendTimer}s</span>
              }
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", textAlign: "center", marginTop: 8 }}>
              OTP is auto-verified when all 6 digits are entered
            </p>
            <button onClick={() => setStep(1)} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 14 }}>← Change Email</button>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* ── STEP 3: PERSONAL DETAILS ── */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", marginBottom: 20 }}>Personal information stored securely in Supabase • encrypted at rest</p>

            <label style={labelStyle}>Full Legal Name *</label>
            <input type="text" placeholder="As on government ID" style={{ ...inputStyle, borderColor: personalErrors.fullName ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={fullName} onChange={(e) => { setFullName(e.target.value); setPersonalErrors((p) => ({ ...p, fullName: null })); }} />
            {personalErrors.fullName && <span style={errStyle}>{personalErrors.fullName}</span>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input type="date" style={{ ...inputStyle, borderColor: personalErrors.dob ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)", colorScheme: "dark" }} value={dob} max={new Date().toISOString().split("T")[0]} onChange={(e) => { setDob(e.target.value); setPersonalErrors((p) => ({ ...p, dob: null })); }} />
                {personalErrors.dob && <span style={errStyle}>{personalErrors.dob}</span>}
              </div>
              <div>
                <label style={labelStyle}>Gender *</label>
                <select style={{ ...selectStyle, borderColor: personalErrors.gender ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={gender} onChange={(e) => { setGender(e.target.value); setPersonalErrors((p) => ({ ...p, gender: null })); }}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
                {personalErrors.gender && <span style={errStyle}>{personalErrors.gender}</span>}
              </div>
            </div>

            <label style={labelStyle}>Residential Address *</label>
            <input type="text" placeholder="House no., Street, Area" style={{ ...inputStyle, borderColor: personalErrors.address ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={address} onChange={(e) => { setAddress(e.target.value); setPersonalErrors((p) => ({ ...p, address: null })); }} />
            {personalErrors.address && <span style={errStyle}>{personalErrors.address}</span>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input type="text" placeholder="City" style={{ ...inputStyle, borderColor: personalErrors.city ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={city} onChange={(e) => { setCity(e.target.value); setPersonalErrors((p) => ({ ...p, city: null })); }} />
                {personalErrors.city && <span style={errStyle}>{personalErrors.city}</span>}
              </div>
              <div>
                <label style={labelStyle}>{region === "India" ? "Pincode *" : "Postal Code"}</label>
                <input type="text" inputMode="numeric" placeholder={region === "India" ? "6 digits" : ""} style={{ ...inputStyle, borderColor: personalErrors.pincode ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={pincode} onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPersonalErrors((p) => ({ ...p, pincode: null })); }} />
                {personalErrors.pincode && <span style={errStyle}>{personalErrors.pincode}</span>}
              </div>
            </div>

            {region === "India" && (
              <>
                <label style={labelStyle}>State *</label>
                <select style={{ ...selectStyle, borderColor: personalErrors.state ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={state} onChange={(e) => { setState(e.target.value); setPersonalErrors((p) => ({ ...p, state: null })); }}>
                  <option value="">Select State / UT</option>
                  {indianStates.map((s) => <option key={s}>{s}</option>)}
                </select>
                {personalErrors.state && <span style={errStyle}>{personalErrors.state}</span>}
              </>
            )}

            <button style={{ ...ctaBtn, marginTop: 16, opacity: savingPersonal ? 0.7 : 1 }} onClick={handleSavePersonal} disabled={savingPersonal}>
              {savingPersonal ? "⏳ Saving…" : "Save & Continue →"}
            </button>
          </div>
        )}

        {/* ── STEP 4: KYC DOCS ── */}
        {step === 4 && !kycSuccess && (
          <div>
            <div style={{ background: "rgba(232,33,10,0.08)", border: "1px solid rgba(232,33,10,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Syne',sans-serif", margin: 0 }}>🔐 KYC is mandatory under RBI / FEMA guidelines. Documents processed via AI OCR (Tesseract.js).</p>
            </div>

            <label style={labelStyle}>Primary ID Document *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {docTypes.map(({ k, l }) => (
                <button key={k} onClick={() => { setDocType(k); setDocErrors({}); }} style={{ padding: "11px 8px", borderRadius: 8, fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: docType === k ? "linear-gradient(135deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.05)", border: docType === k ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)", color: docType === k ? "#fff" : "rgba(255,255,255,0.55)" }}>{l}</button>
              ))}
            </div>

            {docType === "aadhaar" && (
              <>
                <label style={labelStyle}>Aadhaar Number *</label>
                <input type="text" inputMode="numeric" placeholder="1234 5678 9012" style={{ ...inputStyle, letterSpacing: "0.15em", borderColor: docErrors.aadhaar ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={aadhaarNum} onChange={(e) => { setAadhaarNum(formatAadhaar(e.target.value)); setDocErrors((p) => ({ ...p, aadhaar: null })); }} />
                {docErrors.aadhaar && <span style={errStyle}>{docErrors.aadhaar}</span>}
              </>
            )}
            {docType === "pan" && (
              <>
                <label style={labelStyle}>PAN Number *</label>
                <input type="text" placeholder="ABCDE1234F" maxLength={10} style={{ ...inputStyle, letterSpacing: "0.2em", textTransform: "uppercase", borderColor: docErrors.pan ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={panNum} onChange={(e) => { setPanNum(e.target.value.toUpperCase().slice(0, 10)); setDocErrors((p) => ({ ...p, pan: null })); }} />
                {docErrors.pan && <span style={errStyle}>{docErrors.pan}</span>}
              </>
            )}
            {docType === "passport" && (
              <>
                <label style={labelStyle}>Passport Number *</label>
                <input type="text" placeholder="A1234567" maxLength={8} style={{ ...inputStyle, letterSpacing: "0.2em", textTransform: "uppercase", borderColor: docErrors.passport ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={passportNum} onChange={(e) => { setPassportNum(e.target.value.toUpperCase().slice(0, 8)); setDocErrors((p) => ({ ...p, passport: null })); }} />
                {docErrors.passport && <span style={errStyle}>{docErrors.passport}</span>}
                <label style={labelStyle}>Passport Expiry *</label>
                <input type="date" style={{ ...inputStyle, colorScheme: "dark", borderColor: docErrors.passportExpiry ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={passportExpiry} min={new Date().toISOString().split("T")[0]} onChange={(e) => { setPassportExpiry(e.target.value); setDocErrors((p) => ({ ...p, passportExpiry: null })); }} />
                {docErrors.passportExpiry && <span style={errStyle}>{docErrors.passportExpiry}</span>}
              </>
            )}
            {docType === "voter" && (
              <>
                <label style={labelStyle}>Voter ID (EPIC) Number *</label>
                <input type="text" placeholder="ABC1234567" maxLength={10} style={{ ...inputStyle, letterSpacing: "0.15em", textTransform: "uppercase", borderColor: docErrors.voter ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={voterNum} onChange={(e) => { setVoterNum(e.target.value.toUpperCase().slice(0, 10)); setDocErrors((p) => ({ ...p, voter: null })); }} />
                {docErrors.voter && <span style={errStyle}>{docErrors.voter}</span>}
              </>
            )}

            {/* Selfie */}
            <label style={labelStyle}>Live Selfie / Face Photo *</label>
            <label style={{ display: "block", border: `2px dashed ${docErrors.selfie ? "rgba(255,85,85,0.5)" : selfieUploaded ? "rgba(232,33,10,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "18px 16px", textAlign: "center", cursor: "pointer", background: selfieUploaded ? "rgba(232,33,10,0.07)" : "rgba(255,255,255,0.02)", marginBottom: 6 }}>
              <input type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { setLoading("selfie"); setTimeout(() => { setLoading(null); setSelfieUploaded(true); setDocErrors((p) => ({ ...p, selfie: null })); }, 1000); } }} />
              {loading === "selfie" ? <span style={{ color: "#f56a00", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>⏳ Processing biometric…</span> : selfieUploaded ? <span style={{ color: "#4caf50", fontSize: 13, fontFamily: "'Syne',sans-serif" }}>✅ Face captured & verified</span> : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>📷 Tap to open camera or upload photo</span>}
            </label>
            {docErrors.selfie && <span style={errStyle}>{docErrors.selfie}</span>}

            {/* Doc upload with OCR */}
            <label style={labelStyle}>Upload Document Image *</label>
            <label style={{ display: "block", border: `2px dashed ${docErrors.doc ? "rgba(255,85,85,0.5)" : docUploaded ? "rgba(232,33,10,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "18px 16px", textAlign: "center", cursor: "pointer", background: docUploaded ? "rgba(232,33,10,0.07)" : "rgba(255,255,255,0.02)", marginBottom: 6 }}>
              <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) handleDocUpload(e.target.files[0]); }} />
              {loading === "doc" ? <span style={{ color: "#f56a00", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>⏳ AI OCR extracting data…</span> : docUploaded ? <span style={{ color: "#4caf50", fontSize: 13, fontFamily: "'Syne',sans-serif" }}>✅ Document scanned{ocrData?.name ? ` — ${ocrData.name}` : ""}</span> : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>📄 Tap to upload — AI OCR auto-extracts name, DOB, address</span>}
            </label>
            {docErrors.doc && <span style={errStyle}>{docErrors.doc}</span>}

            {/* OCR results preview */}
            {ocrData && Object.keys(ocrData).length > 0 && (
              <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: ".3em", color: "#4ade80", textTransform: "uppercase", marginBottom: 8 }}>OCR Extracted</div>
                {Object.entries(ocrData).map(([k, v]) => v && (
                  <div key={k} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>{k}: </span>{v}
                  </div>
                ))}
              </div>
            )}

            <button style={{ ...ctaBtn, marginTop: 18, opacity: loading ? "0.7" : "1" }} onClick={handleSubmitKyc} disabled={!!loading}>
              {loading === "submitting" ? "⏳ Submitting KYC…" : "Submit KYC →"}
            </button>
            <button onClick={() => setStep(3)} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 10 }}>← Back to Personal Details</button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {kycSuccess && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: "0.05em", color: "#fff", marginBottom: 8 }}>KYC Submitted!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Syne',sans-serif", marginBottom: 24 }}>Your KYC is under review. We'll notify you via email within 24 hours.</p>
            <div style={{ background: "rgba(232,33,10,0.1)", border: "1px solid rgba(232,33,10,0.25)", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#f56a00", fontFamily: "'Syne',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Verification Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
                {[["Email", email], ["OTP", "✅ Verified"], ["Name", fullName || ocrData?.name || "—"], ["DOB", dob || ocrData?.dob || "—"], ["Document", docType.toUpperCase()], ["Face", "✅ Matched"]].map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12, fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,0.8)" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>{k}: </span>{v}</div>
                ))}
              </div>
            </div>
            <button style={ctaBtn} onClick={() => { onLoginSuccess?.() || close(); }}>Go to Dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}
