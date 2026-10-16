import {createClient} from "@supabase/supabase-js";
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const KEYS=["nov7_2026_softball","nov7_2026_kickball"];
export default async function handler(req,res){
 try {
  if(req.method==="GET"){
   const {data,error}=await db.from("tournament_registrations").select("id,tournament_key,team_name").in("tournament_key",KEYS).eq("payment_status","paid").eq("status","confirmed");
   if(error)throw error;
   return res.status(200).json({teams:data||[]});
  }
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const {registrationId,playerName,playerEmail,signature,waiverAccepted,electronicAccepted,ageConfirmed}=req.body||{};
  if(!/^[0-9a-f-]{36}$/i.test(registrationId||"")||![playerName,playerEmail,signature].every(v=>typeof v==="string"&&v.trim()&&v.length<=150)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(playerEmail)||!waiverAccepted||!electronicAccepted||!ageConfirmed)return res.status(400).json({error:"Please complete your name, email, signature, and all agreements."});
  const {data:team,error:teamError}=await db.from("tournament_registrations").select("id,tournament_key,payment_status,status").eq("id",registrationId).single();
  if(teamError||!team||!KEYS.includes(team.tournament_key)||team.payment_status!=="paid"||team.status!=="confirmed")return res.status(403).json({error:"This team is not yet confirmed for the tournament."});
  const {data:existing,error:existingError}=await db.from("tournament_players").select("id").eq("tournament_registration_id",registrationId).ilike("player_email",playerEmail.trim()).limit(1);
  if(existingError)throw existingError;
  if(existing?.length)return res.status(409).json({error:"A waiver is already recorded for this email and team. Contact the league if a correction is needed."});
  const {error}=await db.from("tournament_players").insert({tournament_registration_id:registrationId,player_name:playerName.trim(),player_email:playerEmail.trim().toLowerCase(),waiver_signed:true,waiver_signature:signature.trim(),waiver_signed_at:new Date().toISOString()});
  if(error)throw error;
  return res.status(200).json({success:true});
 }catch(error){console.error("Tournament waiver error",error);return res.status(500).json({error:"Unable to save waiver. Please try again."});}
}
