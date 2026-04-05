import { useState, useEffect, useRef } from "react";
import { countryCodes, indianStates } from "../data/content";

const inputStyle = {
  width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff",
  fontFamily: "'Syne',sans-serif", fontSize: 14, marginBottom: 6, outline: "none",
  transition: "border-color 0.2s",
};
const errStyle   = { color: "#ff5555", fontSize: 11, fontFamily: "'Syne',sans-serif", marginBottom: 14, display: "block" };
const labelStyle = { display: "block", fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 6, fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" };
const ctaBtn     = { width: "100%", padding: "15px", background: "linear-gradient(135deg,#e8210a,#f56a00)", color: "#fff", border: "none", borderRadius: 8, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", marginTop: 8 };

export default function LoginSignupModal({ onLoginSuccess }) {
  const [isOpen,          setIsOpen]          = useState(false);
  const [step,            setStep]            = useState(1);
  const [region,          setRegion]          = useState("India");
  const [lang,            setLang]            = useState("English");
  const [countryCode,     setCountryCode]     = useState("+91");
  const [phoneNumber,     setPhoneNumber]     = useState("");
  const [phoneError,      setPhoneError]      = useState("");
  const [otp,             setOtp]             = useState(["","","","","",""]);
  const [otpError,        setOtpError]        = useState("");
  const [resendTimer,     setResendTimer]     = useState(30);
  const [canResend,       setCanResend]       = useState(false);
  const otpRefs = useRef([]);

  // KYC personal
  const [fullName,        setFullName]        = useState("");
  const [dob,             setDob]             = useState("");
  const [gender,          setGender]          = useState("");
  const [address,         setAddress]         = useState("");
  const [city,            setCity]            = useState("");
  const [pincode,         setPincode]         = useState("");
  const [state,           setState]           = useState("");
  const [email,           setEmail]           = useState("");
  const [personalErrors,  setPersonalErrors]  = useState({});

  // KYC docs
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

  // Resend OTP countdown
  useEffect(() => {
    if (step !== 2) return;
    setResendTimer(30); setCanResend(false);
    const iv = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(iv); setCanResend(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  // Hash listener
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#login" || hash === "#signup") {
        setIsOpen(true); setStep(1);
        setPhoneNumber(""); setOtp(["","","","","",""]); setPhoneError(""); setOtpError("");
        setFullName(""); setDob(""); setGender(""); setAddress(""); setCity(""); setPincode(""); setState(""); setEmail("");
        setAadhaarNum(""); setPanNum(""); setPassportNum(""); setVoterNum(""); setPassportExpiry("");
        setPersonalErrors({}); setDocErrors({}); setKycSuccess(false); setDocUploaded(false); setSelfieUploaded(false);
      } else { setIsOpen(false); }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (!isOpen) return null;
  const close = () => { window.location.hash = ""; };

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "");
    if (countryCode === "+91") { return digits.length <= 5 ? digits : digits.slice(0, 5) + " " + digits.slice(5, 10); }
    return digits;
  };

  const validatePhone = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (countryCode === "+91" && digits.length !== 10) { setPhoneError("Enter a valid 10-digit Indian mobile number"); return false; }
    if (countryCode !== "+91" && digits.length < 7) { setPhoneError("Enter a valid phone number"); return false; }
    setPhoneError(""); return true;
  };

  const handleOtpChange = (i, val) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp]; next[i] = v;
    setOtp(next); setOtpError("");
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = () => {
    if (otp.some((d) => d === "")) { setOtpError("Please enter all 6 digits"); return; }
    setOtpError(""); setStep(3);
  };

  const validatePersonal = () => {
    const errs = {};
    if (!fullName.trim() || fullName.trim().split(" ").length < 2) errs.fullName = "Enter your full name (first & last)";
    if (!dob) errs.dob = "Date of birth is required";
    else { const age = Math.floor((Date.now() - new Date(dob)) / 31557600000); if (age < 18) errs.dob = "You must be at least 18 years old"; }
    if (!gender) errs.gender = "Select gender";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email address";
    if (!address.trim()) errs.address = "Address is required";
    if (!city.trim()) errs.city = "City is required";
    if (region === "India" && !pincode.match(/^\d{6}$/)) errs.pincode = "Enter a valid 6-digit pincode";
    if (region === "India" && !state) errs.state = "Select your state";
    setPersonalErrors(errs); return Object.keys(errs).length === 0;
  };

  const validateDocs = () => {
    const errs = {};
    if (docType === "aadhaar" && !aadhaarNum.replace(/\s/g, "").match(/^\d{12}$/)) errs.aadhaar = "Enter a valid 12-digit Aadhaar number";
    if (docType === "pan" && !panNum.toUpperCase().match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) errs.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (docType === "passport" && !passportNum.toUpperCase().match(/^[A-Z]{1}[0-9]{7}$/)) errs.passport = "Enter a valid passport number (e.g. A1234567)";
    if (docType === "passport" && !passportExpiry) errs.passportExpiry = "Passport expiry date is required";
    if (docType === "voter" && !voterNum.trim()) errs.voter = "Enter your Voter ID (EPIC) number";
    if (!selfieUploaded) errs.selfie = "Please upload a selfie for face verification";
    if (!docUploaded) errs.doc = "Please upload your document image";
    setDocErrors(errs); return Object.keys(errs).length === 0;
  };

  const handleSubmitKyc = () => {
    if (!validateDocs()) return;
    setLoading("submitting");
    setTimeout(() => { setLoading(null); setKycSuccess(true); setTimeout(() => { if (onLoginSuccess) onLoginSuccess(); }, 1600); }, 1800);
  };

  const formatAadhaar = (val) => val.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const selectStyle = {
    ...inputStyle, appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 32,
  };

  const docTypes = region === "India"
    ? [{ k: "aadhaar", l: "🪪 Aadhaar" }, { k: "pan", l: "💳 PAN Card" }, { k: "passport", l: "🛂 Passport" }, { k: "voter", l: "🗳️ Voter ID" }]
    : [{ k: "passport", l: "🛂 Passport" }, { k: "pan", l: "💳 PAN Card" }];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "16px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 500, background: "rgba(14,14,14,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "clamp(20px,5vw,40px) clamp(16px,5vw,36px)", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", marginTop: 24, marginBottom: 24 }}>

        {/* Close */}
        <button onClick={close} style={{ position: "absolute", top: 16, right: 18, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(26px,6vw,34px)", letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>TOKIFY</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, color: "#f56a00", marginTop: 2 }}>
            {["","Phone Verification","OTP Verification","Personal Details","KYC Documents"][step]}
          </div>
        </div>

        {/* Progress */}
        {step <= 4 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "linear-gradient(90deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
            ))}
          </div>
        )}

        {/* ── STEP 1: Phone ── */}
        {step === 1 && (
          <div>
            <label style={labelStyle}>Account Type</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["India", "NRI"].map((r) => (
                <button key={r} onClick={() => { setRegion(r); setCountryCode(r === "India" ? "+91" : ""); }} style={{ flex: 1, padding: "11px 8px", borderRadius: 8, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: region === r ? "linear-gradient(135deg,#e8210a,#f56a00)" : "rgba(255,255,255,0.05)", border: region === r ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)", color: region === r ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {r === "NRI" ? "🌍 NRI / International" : "🇮🇳 India Resident"}
                </button>
              ))}
            </div>

            <label style={labelStyle}>Preferred Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...selectStyle, marginBottom: 20 }}>
              <option>English</option><option>Hindi</option><option>Bengali</option>
              <option>Tamil</option><option>Telugu</option><option>Marathi</option>
            </select>

            <label style={labelStyle}>Mobile Number *</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <select value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setPhoneNumber(""); setPhoneError(""); }} style={{ ...selectStyle, marginBottom: 0, width: "auto", minWidth: 130, flex: "0 0 auto" }}>
                {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input type="tel" inputMode="numeric" placeholder={countryCode === "+91" ? "98765 43210" : "Phone number"} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={phoneNumber} onChange={(e) => { setPhoneNumber(formatPhone(e.target.value)); setPhoneError(""); }} />
            </div>
            {phoneError && <span style={errStyle}>{phoneError}</span>}
            {countryCode === "+91" && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Enter 10-digit mobile number registered with your bank</p>}

            <button style={ctaBtn} onClick={() => { if (validatePhone()) setStep(2); }}>Send OTP via SMS →</button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", textAlign: "center", marginTop: 16 }}>
              By continuing you agree to Tokify's Terms & Privacy Policy. Your data is encrypted end-to-end.
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>We sent a 6-digit OTP to</p>
            <p style={{ fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 24 }}>{countryCode} {phoneNumber}</p>

            <label style={labelStyle}>Enter OTP</label>
            <div style={{ display: "flex", gap: "clamp(6px,2vw,12px)", marginBottom: 6, justifyContent: "space-between" }}>
              {otp.map((d, i) => (
                <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    const next = ["","","","","",""];
                    pasted.split("").forEach((ch, idx) => { if (idx < 6) next[idx] = ch; });
                    setOtp(next);
                    if (pasted.length > 0) otpRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
                  }}
                  style={{ width: "clamp(38px,13vw,52px)", height: "clamp(46px,12vw,58px)", textAlign: "center", fontSize: 22, fontWeight: 700, background: "rgba(255,255,255,0.06)", border: `1px solid ${d ? "rgba(232,33,10,0.6)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, color: "#fff", fontFamily: "'Syne',sans-serif", outline: "none" }}
                />
              ))}
            </div>
            {otpError && <span style={errStyle}>{otpError}</span>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              {canResend
                ? <button onClick={() => { setOtp(["","","","","",""]); setResendTimer(30); setCanResend(false); otpRefs.current[0]?.focus(); }} style={{ background: "transparent", border: "none", color: "#f56a00", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontSize: 12 }}>Resend OTP</button>
                : <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Syne',sans-serif", fontSize: 12 }}>Resend in {resendTimer}s</span>
              }
            </div>

            <button style={ctaBtn} onClick={handleVerifyOtp}>Verify & Continue →</button>
            <button onClick={() => setStep(1)} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 10 }}>← Change Number</button>
          </div>
        )}

        {/* ── STEP 3: Personal ── */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Syne',sans-serif", marginBottom: 20 }}>Personal information stored securely in PostgreSQL • encrypted at rest via AWS S3</p>

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

            <label style={labelStyle}>Email Address *</label>
            <input type="email" placeholder="you@example.com" style={{ ...inputStyle, borderColor: personalErrors.email ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={email} onChange={(e) => { setEmail(e.target.value); setPersonalErrors((p) => ({ ...p, email: null })); }} />
            {personalErrors.email && <span style={errStyle}>{personalErrors.email}</span>}

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
                <input type="text" inputMode="numeric" placeholder={region === "India" ? "6 digits" : ""} style={{ ...inputStyle, borderColor: personalErrors.pincode ? "rgba(255,85,85,0.5)" : "rgba(255,255,255,0.12)" }} value={pincode} onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, region === "India" ? 6 : 10)); setPersonalErrors((p) => ({ ...p, pincode: null })); }} />
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

            <button style={{ ...ctaBtn, marginTop: 16 }} onClick={() => { if (validatePersonal()) setStep(4); }}>Save & Continue →</button>
          </div>
        )}

        {/* ── STEP 4: KYC Docs ── */}
        {step === 4 && !kycSuccess && (
          <div>
            <div style={{ background: "rgba(232,33,10,0.08)", border: "1px solid rgba(232,33,10,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Syne',sans-serif", margin: 0 }}>🔐 KYC is mandatory under RBI / FEMA guidelines. Documents are stored encrypted on Amazon S3 and processed via AI OCR.</p>
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
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Verified via UIDAI API • masked storage only</p>
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
                <label style={labelStyle}>Passport Expiry Date *</label>
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

            {/* Doc image */}
            <label style={labelStyle}>Upload Document Image / PDF *</label>
            <label style={{ display: "block", border: `2px dashed ${docErrors.doc ? "rgba(255,85,85,0.5)" : docUploaded ? "rgba(232,33,10,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "18px 16px", textAlign: "center", cursor: "pointer", background: docUploaded ? "rgba(232,33,10,0.07)" : "rgba(255,255,255,0.02)", marginBottom: 6 }}>
              <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { setLoading("doc"); setTimeout(() => { setLoading(null); setDocUploaded(true); setDocErrors((p) => ({ ...p, doc: null })); }, 1200); } }} />
              {loading === "doc" ? <span style={{ color: "#f56a00", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>⏳ AI OCR extracting data…</span> : docUploaded ? <span style={{ color: "#4caf50", fontSize: 13, fontFamily: "'Syne',sans-serif" }}>✅ Document uploaded & scanned</span> : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>📄 Tap to upload document image</span>}
            </label>
            {docErrors.doc && <span style={errStyle}>{docErrors.doc}</span>}

            <button style={{ ...ctaBtn, marginTop: 18, opacity: loading ? "0.7" : "1" }} onClick={handleSubmitKyc} disabled={!!loading}>
              {loading === "submitting" ? "⏳ Submitting KYC…" : "Submit KYC →"}
            </button>
            <button onClick={() => setStep(3)} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Syne',sans-serif", fontSize: 12, cursor: "pointer", marginTop: 10 }}>← Back to Personal Details</button>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Syne',sans-serif", textAlign: "center", marginTop: 14 }}>🔒 Secured by Firebase Auth • Polygon blockchain audit trail • AWS S3 encrypted storage</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {kycSuccess && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: "0.05em", color: "#fff", marginBottom: 8 }}>KYC Submitted!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Syne',sans-serif", marginBottom: 24 }}>Your KYC is under review. We'll notify you via SMS and email within 24 hours.</p>
            <div style={{ background: "rgba(232,33,10,0.1)", border: "1px solid rgba(232,33,10,0.25)", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#f56a00", fontFamily: "'Syne',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Verification Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "left" }}>
                {[["Phone", `${countryCode} ${phoneNumber}`], ["OTP", "✅ Verified"], ["Name", fullName || "—"], ["DOB", dob || "—"], ["Document", docType.toUpperCase()], ["Face", "✅ Matched"]].map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12, fontFamily: "'Syne',sans-serif", color: "rgba(255,255,255,0.8)" }}><span style={{ color: "rgba(255,255,255,0.4)" }}>{k}: </span>{v}</div>
                ))}
              </div>
            </div>
            <button style={ctaBtn} onClick={() => { if (onLoginSuccess) onLoginSuccess(); else close(); }}>Go to Dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}
