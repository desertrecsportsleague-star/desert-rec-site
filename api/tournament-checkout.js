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
  const {data:registrations,error:readError}=await db.from("tournament_registrations").select("id,payment_status,status,created_at").eq("tournament_key",event.key);
  if(readError) throw readError;
  const cutoff=Date.now()-30*60*1000;
  const occupied=(registrations||[]).filter(r=>r.payment_status==="paid"||(r.status==="pending"&&new Date(r.created_at).getTime()>cutoff)).length;
  if(occupied>=8) return res.status(409).json({error:"This tournament is full."});
  const {data:registration,error:insertError}=await db.from("tournament_registrations").insert({tournament_key:event.key,registration_type:"team",team_name:teamName.trim(),captain_name:captainName.trim(),captain_email:captainEmail.trim(),captain_phone:captainPhone||null,waiver_acknowledged:true,payment_status:"unpaid",status:"pending"}).select("id").single();
  if(insertError) throw insertError;
  const origin="https://desertrecsportsleague.com";
  const session=await stripe.checkout.sessions.create({mode:"payment",customer_email:captainEmail.trim(),line_items:[{price_data:{currency:"usd",unit_amount:event.amount,product_data:{name:event.name}},quantity:1}],success_url:origin+"/?tournament_payment=success",cancel_url:origin+"/?tournament_payment=cancelled",metadata:{paymentType:"tournament_team",registrationId:registration.id,tournamentKey:event.key,sport,signature:signature.trim()}});
  await db.from("tournament_registrations").update({stripe_checkout_session_id:session.id,stripe_session_id:session.id}).eq("id",registration.id);
  return res.status(200).json({url:session.url});
 } catch(err) {console.error("Tournament checkout failed",err);return res.status(500).json({error:"Unable to start checkout. Please try again."});}
}
