/**
 * TokiFy AI Transfer Optimizer
 * Deterministic simulation of AI-powered transfer optimization.
 * Modular design — each step is independently upgradeable to real ML.
 */

const BLACKLIST = ["BLOCKED001", "SPAM999", "FRAUD123"];
const RATE_LIMIT_THRESHOLD = 5; // max transfers per session
const HIGH_AMOUNT_THRESHOLD = 100000; // ₹1 lakh

// Simple in-memory rate limiter (resets on page refresh)
const requestLog = [];

/* ── 1. SECURITY PRE-CHECK ─────────────────────────────── */
function securityCheck(amount, userEmail) {
  const now = Date.now();
  const recentRequests = requestLog.filter((t) => now - t < 60_000).length;
  requestLog.push(now);

  if (BLACKLIST.includes(userEmail)) {
    return { pass: false, reason: "Account flagged in security blacklist." };
  }
  if (recentRequests >= RATE_LIMIT_THRESHOLD) {
    return { pass: false, reason: "Rate limit exceeded. Please wait 1 minute." };
  }
  if (amount > HIGH_AMOUNT_THRESHOLD) {
    return {
      pass: true,
      warning: `High-value transfer detected (₹${amount.toLocaleString("en-IN")}). Enhanced verification applied.`,
    };
  }
  return { pass: true };
}

/* ── 2. TIMING OPTIMIZATION ───────────────────────────── */
function checkTiming() {
  const hour = new Date().getHours();
  // Simulate peak hours (9-11 AM, 5-7 PM IST)
  const isPeak = (hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19);
  const queueDepth = Math.round(Math.random() * 10); // 0–10 simulated queue

  if (isPeak && queueDepth > 7) {
    return {
      proceed: false,
      message: `High traffic detected (queue: ${queueDepth}). A better rate may be available if you wait 10–15 minutes.`,
    };
  }
  return {
    proceed: true,
    message: queueDepth < 4 ? "Low traffic — optimal transfer window." : "Moderate traffic — proceeding now.",
  };
}

/* ── 3. EXCHANGE RATE OPTIMIZATION ───────────────────────── */
function optimizeRate(baseRate) {
  // Apply ±0.5% variation to simulate dynamic pricing
  const variation = (Math.random() - 0.5) * 0.01; // -0.005 to +0.005
  const optimizedRate = baseRate * (1 + variation);
  const improvement = ((optimizedRate - baseRate) / baseRate) * 100;
  return {
    optimizedRate: parseFloat(optimizedRate.toFixed(6)),
    improvement: parseFloat(improvement.toFixed(3)),
    message:
      improvement > 0
        ? `Rate improved by +${improvement.toFixed(3)}% via liquidity pool optimization.`
        : `Standard market rate applied (${improvement.toFixed(3)}% variance).`,
  };
}

/* ── 4. FEE OPTIMIZATION ───────────────────────────────── */
function optimizeFee(amount, baseFeePercent = 0.02) {
  const HIGH_VOLUME_THRESHOLD = 50000;
  const LOW_LIQUIDITY_THRESHOLD = 5000;
  let fee = baseFeePercent;
  let reason = "Standard rate applied.";

  if (amount >= HIGH_VOLUME_THRESHOLD) {
    fee = 0.015; // 1.5% — reduce fee for high volume
    reason = "Fee reduced to 1.5% due to high transaction volume.";
  } else if (amount < LOW_LIQUIDITY_THRESHOLD) {
    fee = 0.025; // 2.5% — slightly higher for low liquidity
    reason = "Slightly higher fee (2.5%) due to lower liquidity at this amount.";
  }

  const feeAmount = parseFloat((amount * fee).toFixed(2));
  return { feePercent: fee, feeAmount, reason };
}

/* ── 5. ROUTE SELECTION ─────────────────────────────────── */
function selectRoute(amount, fee) {
  const routes = [
    {
      id: "fiat",
      name: "Direct Fiat Route",
      fee: fee * 1.1,
      time: 3600, // 1 hour in seconds
      description: "Traditional SWIFT/NEFT wire transfer",
    },
    {
      id: "usdt",
      name: "Stablecoin (USDT) Route",
      fee: fee * 0.9,
      time: 15, // ~15 seconds
      description: "Via Diaspora Pool — Polygon network",
    },
  ];

  // Select route with lower fee AND faster time
  const selected = routes.reduce((best, r) =>
    r.fee < best.fee && r.time < best.time ? r : best
  );

  return {
    selectedRoute: selected,
    alternateRoute: routes.find((r) => r.id !== selected.id),
  };
}

/* ── 6. USDT CONVERSION ─────────────────────────────────── */
function convertToUSDT(amountINR, feeAmount, usdtRateINR = 92) {
  const netAmountINR = amountINR - feeAmount;
  const usdtAmount = parseFloat((netAmountINR / usdtRateINR).toFixed(4));
  return { usdtAmount, usdtRateINR, netAmountINR };
}

/* ── MAIN OPTIMIZER FUNCTION ───────────────────────────── */
export async function runAiOptimizer({ amount, userEmail, baseRate, usdtRate = 92 }) {
  const messageLog = [];
  await sleep(800);

  // Step 1
  messageLog.push("🔐 Analyzing transaction security...");
  const security = securityCheck(amount, userEmail);
  if (!security.pass) {
    return { success: false, error: security.reason, messageLog };
  }
  if (security.warning) messageLog.push(`⚠️ ${security.warning}`);
  await sleep(900);

  // Step 2
  messageLog.push("💧 Checking liquidity conditions...");
  const timing = checkTiming();
  await sleep(700);
  if (!timing.proceed) {
    messageLog.push(`⏳ ${timing.message}`);
    await sleep(400);
  } else {
    messageLog.push(`✅ ${timing.message}`);
    await sleep(600);
  }

  // Step 3
  messageLog.push("📈 Optimizing exchange rates...");
  const rateOpt = optimizeRate(baseRate);
  await sleep(800);
  messageLog.push(`✅ ${rateOpt.message}`);
  await sleep(500);

  // Step 4 — fee
  const feeOpt = optimizeFee(amount);
  messageLog.push(`💸 Fee optimized: ${(feeOpt.feePercent * 100).toFixed(1)}% — ${feeOpt.reason}`);
  await sleep(700);

  // Step 5
  messageLog.push("🛣️ Selecting best transfer route...");
  const routeData = selectRoute(amount, feeOpt.feeAmount);
  await sleep(900);
  messageLog.push(`✅ Route selected: ${routeData.selectedRoute.name}`);
  await sleep(500);

  // Step 6
  messageLog.push("🔄 Finalizing conversion...");
  const conversion = convertToUSDT(amount, feeOpt.feeAmount, usdtRate);
  await sleep(700);
  messageLog.push(`✅ Conversion complete: ₹${amount.toLocaleString("en-IN")} → ${conversion.usdtAmount} USDT`);

  const estimatedTime =
    routeData.selectedRoute.time < 60
      ? `~${routeData.selectedRoute.time} seconds`
      : `~${Math.round(routeData.selectedRoute.time / 60)} minutes`;

  return {
    success: true,
    selectedRoute: routeData.selectedRoute,
    alternateRoute: routeData.alternateRoute,
    finalAmountUSDT: conversion.usdtAmount,
    usdtRateINR: usdtRate,
    fee: feeOpt.feeAmount,
    feePercent: feeOpt.feePercent,
    feeReason: feeOpt.reason,
    optimizedRate: rateOpt.optimizedRate,
    rateImprovement: rateOpt.improvement,
    estimatedTime,
    messageLog,
    netAmountINR: conversion.netAmountINR,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
