import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {
const { freeAgentId, playerName, playerEmail } = req.body || {};

if (!freeAgentId || !playerName || !playerEmail) {
return res.status(400).json({ error: "Missing required free agent checkout data." });
}

const origin =
req.headers.origin ||
(process.env.VERCEL_PROJECT_PRODUCTION_URL
? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
: "http://localhost:5173");

const session = await stripe.checkout.sessions.create({
mode: "payment",
customer_email: playerEmail,
client_reference_id: freeAgentId,
success_url: `${origin}/?payment=success`,
cancel_url: `${origin}/?payment=cancelled`,
metadata: {
freeAgentId,
playerName,
playerEmail,
registrationType: "free_agent",
},
line_items: [
{
price_data: {
currency: "usd",
product_data: {
name: "Desert Rec Free Agent Registration",
description: `${playerName} free agent registration`,
},
unit_amount: 6000,
},
quantity: 1,
},
],
});

return res.status(200).json({ url: session.url });
} catch (err) {
console.error("FREE AGENT STRIPE CHECKOUT ERROR:", err);
return res.status(500).json({
error: err.message || "Unable to create free agent checkout session.",
});
}
}
