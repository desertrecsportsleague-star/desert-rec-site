import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const EVENTS = {softball: {key:"nov7_2026_softball",name:"November 7 Softball Tournament",amount:45000},kickball:{key:"nov7_2026_kickball",name:"November 7 Kickball Tournament",amount:35000}};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req,res) {
 if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
 try {
  const {sport,teamName,captainName,captainEmail,captainPhone,signature,waiverAccepted,captainDutyAccepted,electronicAccepted}=req.body||{};
  const event=EVENTS[sport];
  if(!event || ![teamName,captainName,captainEmail,signature].every(v=>typeof v==="string"&&v.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(captainEmail) || !waiverAccepted || !captainDutyAccepted || !electronicAccepted) return res.status(400).json({error:"Complete all required fields and waiver agreements."});
  const {data:tournament,error:tournamentError}=await db.from("tournaments").select("registration_enabled,status,entry_fee_cents,team_cap").eq("tournament_key",event.key).single();
  if(tournamentError) throw tournamentError;
  if(!tournament.registration_enabled || tournament.status==="draft") return res.status(403).json({error:"Registration is not open yet."});
  const {data:registrationId,error:reserveError}=await db.rpc("reserve_tournament_team",{p_tournament_key:event.key,p_team_name:teamName.trim(),p_captain_name:captainName.trim(),p_captain_email:captainEmail.trim(),p_captain_phone:captainPhone||null});
  if(reserveError)return res.status(409).json({error:reserveError.message.includes("full")?"This tournament is full.":"Registration is not currently available."});
  const registration={id:registrationId};
  const origin="https://desertrecsportsleague.com";
  let session;
  try { session=await stripe.checkout.sessions.create({mode:"payment",customer_email:captainEmail.trim(),line_items:[{price_data:{currency:"usd",unit_amount:tournament.entry_fee_cents,product_data:{name:event.name}},quantity:1}],success_url:origin+"/?tournament_payment=success",cancel_url:origin+"/?tournament_payment=cancelled",metadata:{paymentType:"tournament_team",registrationId:registration.id,tournamentKey:event.key,sport,signature:signature.trim()}}); }
  catch(checkoutError){await db.from("tournament_registrations").update({status:"cancelled"}).eq("id",registration.id);throw checkoutError;}
  const {error:sessionSaveError}=await db.from("tournament_registrations").update({stripe_checkout_session_id:session.id,stripe_session_id:session.id}).eq("id",registration.id);
  if(sessionSaveError){await stripe.checkout.sessions.expire(session.id);await db.from("tournament_registrations").update({status:"cancelled"}).eq("id",registration.id);throw sessionSaveError;}
  return res.status(200).json({url:session.url});
 } catch(err) {console.error("Tournament checkout failed",err);return res.status(500).json({error:"Unable to start checkout. Please try again."});}
}
