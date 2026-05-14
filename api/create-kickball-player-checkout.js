import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {
const {
teamPlayerId,
playerName,
playerEmail,
teamId,
teamName,
leagueType,
amountCents,
} = req.body;

if (!teamPlayerId || !playerName || !leagueType) {
return res.status(400).json({ error: "Missing required player information." });
}

const price = amountCents || 6000;

const session = await stripe.checkout.sessions.create({
mode: "payment",
payment_method_types: ["card"],
customer_email: playerEmail || undefined,
line_items: [
{
price_data: {
currency: "usd",
product_data: {
name: "Kickball Player Registration",
description: `${playerName} - ${teamName || "Kickball Team"}`,
},
unit_amount: price,
},
quantity: 1,
},
],
metadata: {
leagueType: leagueType,
teamPlayerId: teamPlayerId,
teamId: teamId || "",
teamName: teamName || "",
playerName: playerName,
playerEmail: playerEmail || "",
paymentType: "kickball_player",
},
success_url: `${req.headers.origin}/?payment=success`,
cancel_url: `${req.headers.origin}/?payment=cancelled`,
});

return res.status(200).json({ url: session.url });
} catch (error) {
console.error("Kickball checkout error:", error);
return res.status(500).json({ error: error.message });
}
}
