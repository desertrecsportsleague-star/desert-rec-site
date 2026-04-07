import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
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

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const signature = req.headers["stripe-signature"];
if (!signature) {
return res.status(400).send("Missing stripe-signature header");
}

let event;

try {
const rawBody = await readRawBody(req);
event = stripe.webhooks.constructEvent(
rawBody,
signature,
process.env.STRIPE_WEBHOOK_SECRET
);
} catch (err) {
console.error("Webhook verification failed:", err.message);
return res.status(400).send(`Webhook Error: ${err.message}`);
}

try {
if (
event.type === "checkout.session.completed" ||
event.type === "checkout.session.async_payment_succeeded"
) {
const session = event.data.object;
const type = session.metadata?.registrationType;
const teamId = session.metadata?.teamId;
const freeAgentId = session.metadata?.freeAgentId;

if (type === "team" && teamId) {
const { error } = await supabase
.from("teams")
.update({ paid_status: "Paid" })
.eq("id", teamId);

if (error) throw error;
}

if (type === "free_agent" && freeAgentId) {
const { error } = await supabase
.from("free_agents")
.update({ paid_status: "Paid" })
.eq("id", freeAgentId);

if (error) throw error;
}
}

return res.status(200).json({ received: true });
} catch (err) {
console.error("Webhook handler error:", err);
return res.status(500).send(err.message || "Webhook failed");
}
}
