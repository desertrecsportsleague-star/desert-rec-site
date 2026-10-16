import {createClient} from "@supabase/supabase-js";
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const auth=createClient(process.env.SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY);
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const token=(req.headers.authorization||"").replace(/^Bearer /,"");
 if(!token)return res.status(401).json({error:"Sign in as admin."});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user||user.email?.toLowerCase()!==(process.env.ADMIN_EMAIL||"desertrecsportsleague@gmail.com").toLowerCase())return res.status(403).json({error:"Not authorized."});
 const {data:registrations,error:readError}=await admin.from("tournament_registrations").select("id,tournament_key,team_name,captain_name,captain_email,captain_phone,payment_status,status,created_at").in("tournament_key",process.env.VERCEL_ENV==="preview"?["nov7_2026_softball_test","nov7_2026_kickball_test"]:["nov7_2026_softball","nov7_2026_kickball"]).order("created_at",{ascending:false});
 if(readError)return res.status(500).json({error:"Unable to load registrations."});
 const ids=(registrations||[]).map(x=>x.id);
 const {data:players,error:playersError}=ids.length?await admin.from("tournament_players").select("tournament_registration_id,waiver_signed").in("tournament_registration_id",ids):{data:[],error:null};
 if(playersError)return res.status(500).json({error:"Unable to load waiver counts."});
 return res.status(200).json({registrations:(registrations||[]).map(r=>({...r,players:(players||[]).filter(p=>p.tournament_registration_id===r.id).length,waiversSigned:(players||[]).filter(p=>p.tournament_registration_id===r.id&&p.waiver_signed).length}))});
}
