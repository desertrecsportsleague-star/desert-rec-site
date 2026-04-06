import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getPricingInfo() {
const now = new Date();
const earlyEnd = new Date("2026-04-15T23:59:59");
const regularEnd = new Date("2026-05-05T23:59:59");

if (now <= earlyEnd) {
return { tier: "early", label: "Early Bird", amount: 55000 };
}

if (now <= regularEnd) {
return { tier: "regular", label: "Regular", amount: 60000 };
}

return { tier: "late", label: "Late", amount: 65000 };
}

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {
const { teamId, teamName, captainName, captainEmail } = req.body || {};
const pricing = getPricingInfo();

if (!teamId || !teamName || !captainName || !captainEmail) {
return res.status(400).json({ error: "Missing required checkout data." });
}

const origin =
req.headers.origin ||
(process.env.VERCEL_PROJECT_PRODUCTION_URL
? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
: "http://localhost:5173");

const session = await stripe.checkout.sessions.create({
mode: "payment",
customer_email: captainEmail,
client_reference_id: teamId,
success_url: `${origin}/?payment=success`,
cancel_url: `${origin}/?payment=cancelled`,
metadata: {
teamId,
teamName,
captainName,
captainEmail,
pricingTier: pricing.tier,
},
line_items: [
{
price_data: {
currency: "usd",
product_data: {
name: `Desert Rec Team Registration - ${pricing.label}`,
description: `${teamName} team registration`,
},
unit_amount: pricing.amount,
},
quantity: 1,
},
],
});

return res.status(200).json({ url: session.url });
} catch (err) {
return res.status(500).json({
error: err.message || "Unable to create checkout session.",
});
}
}
