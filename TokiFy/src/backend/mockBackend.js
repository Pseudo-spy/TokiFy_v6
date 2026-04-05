// ── TOKIFY MOCK BACKEND ──
// Replace these with real Firebase / Supabase / Express calls later

const RATES = { USD: 83.12, GBP: 105.43, EUR: 89.64, AED: 22.63, SGD: 61.35 };

const _users    = {};
const _otpStore = {};

export const TokiMockBackend = {
  sendOTP: (phone) =>
    new Promise((res) => {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      _otpStore[phone] = otp;
      console.log(`[TokiMockBackend] OTP for ${phone}: ${otp}`);
      setTimeout(() => res({ success: true, otp }), 800);
    }),

  verifyOTP: (phone, otp) =>
    new Promise((res, rej) => {
      const stored = _otpStore[phone];
      setTimeout(
        () => (stored === otp ? res({ success: true }) : rej({ msg: "Invalid OTP" })),
        600
      );
    }),

  submitKYC: (data) =>
    new Promise((res) => {
      _users[data.phone] = { ...data, kycStatus: "approved", tokiBalance: 0 };
      setTimeout(() => res({ success: true, userId: "USR_" + Date.now() }), 1200);
    }),

  initiateTransfer: (from, toCountry, amount, currency) =>
    new Promise((res) => {
      const fee    = (amount * 0.02).toFixed(2);
      const inr    = (amount * (RATES[currency] || 83)).toFixed(2);
      setTimeout(() =>
        res({
          success:     true,
          txId:        "TXN_" + Date.now(),
          fee:         fee + "₹",
          settled:     inr + "₹",
          time:        "~28 seconds",
          stablecoin:  "TokiUSD",
        }),
        1000
      );
    }),

  getRate: (currency) => RATES[currency] || 83.12,
};
