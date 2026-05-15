import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      playerName,
      playerEmail,
      teamName,
      teamId,
      teamPlayerId,
      leagueType,
      amountCents,
      paymentType,
    } = req.body;

    if (!playerName) {
      return res.status(400).json({
        error: "Missing player name",
      });
    }

    const checkoutAmount = amountCents || 6000;

    const type = paymentType || "kickball_player";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      customer_email: playerEmail || undefined,

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "usd",

            unit_amount: checkoutAmount,

            product_data: {
              name: "Desert Rec Kickball Player Registration",

              description: `${playerName} - ${teamName || "Kickball Team"}`,
            },
          },
        },
      ],

      metadata: {
        paymentType: type,
        playerName: playerName || "",
        playerEmail: playerEmail || "",
        teamName: teamName || "",
        teamId: teamId || "",
        teamPlayerId: teamPlayerId || "",
        leagueType: leagueType || "kickball",
      },

      success_url: `${req.headers.origin}/?payment=success`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Kickball checkout error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
