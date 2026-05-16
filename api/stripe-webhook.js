import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function readRawBody(req) {
const chunks = [];
for await (const chunk of req) {
chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
}
return Buffer.concat(chunks);
}

async function markPaymentPaid(session) {
const metadata = session.metadata || {};
const paymentType = metadata.paymentType || "";
const paidAt = new Date().toISOString();

const updatePayload = {
paid_status: "Paid",
stripe_session_id: session.id,
paid_at: paidAt,
};

if (session.payment_intent) {
updatePayload.stripe_payment_intent = session.payment_intent;
}

if (paymentType === "kickball_captain") {
if (!metadata.teamId) throw new Error("Missing teamId for kickball captain payment.");

const { error } = await supabaseAdmin
.from("teams")
.update(updatePayload)
.eq("id", metadata.teamId);

if (error) throw error;
return;
}

if (paymentType === "kickball_roster_player") {
if (!metadata.teamPlayerId) throw new Error("Missing teamPlayerId for roster player payment.");

const { error } = await supabaseAdmin
.from("team_players")
.update(updatePayload)
.eq("id", metadata.teamPlayerId);

if (error) throw error;
return;
}

if (paymentType === "kickball_free_agent" || paymentType === "softball_free_agent") {
if (!metadata.freeAgentId) throw new Error("Missing freeAgentId for free agent payment.");

const { error } = await supabaseAdmin
.from("free_agents")
.update(updatePayload)
.eq("id", metadata.freeAgentId);

if (error) throw error;
return;
}

if (paymentType === "team_registration" || metadata.teamId) {
const { error } = await supabaseAdmin
.from("teams")
.update(updatePayload)
.eq("id", metadata.teamId);

if (error) throw error;
}
}

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).send("Method not allowed");
}

const signature = req.headers["stripe-signature"];

let event;

try {
const rawBody = await readRawBody(req);
event = stripe.webhooks.constructEvent(
rawBody,
signature,
process.env.STRIPE_WEBHOOK_SECRET
);
} catch (error) {
console.error("Webhook signature verification failed:", error.message);
return res.status(400).send(`Webhook Error: ${error.message}`);
}

try {
if (event.type === "checkout.session.completed") {
await markPaymentPaid(event.data.object);
}

return res.status(200).json({ received: true });
} catch (error) {
console.error("Webhook processing error:", error);
return res.status(500).json({ error: error.message });
}
