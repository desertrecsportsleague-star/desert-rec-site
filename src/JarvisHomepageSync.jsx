import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function JarvisHomepageSync() {
  useEffect(() => {
    let cancelled = false;
    let timer;

    async function applyJarvisHomepage() {
      try {
        const [{ data: mediaRows }, { data: contentRows }] = await Promise.all([
          supabase.from("media_assets").select("id,public_url,file_name,alt_text,category,created_at").eq("active", true).eq("featured_home", true).order("created_at", { ascending: false }).limit(3),
          supabase.from("site_content").select("key,value").in("key", ["home_headline", "home_subheadline", "home_announcement"])
        ]);
        if (cancelled) return;

        const home = document.querySelector(".home-page");
        if (!home) return;

        const content = Object.fromEntries((contentRows || []).map((row) => [row.key, row.value || ""]));
        const headline = home.querySelector(".home-hero-content h1");
        const subheadline = home.querySelector(".home-hero-content p");
        if (headline && content.home_headline) headline.textContent = content.home_headline;
        if (subheadline && content.home_subheadline) subheadline.textContent = content.home_subheadline;

        let announcement = home.querySelector("[data-jarvis-announcement]");
        if (content.home_announcement) {
          if (!announcement) {
            announcement = document.createElement("div");
            announcement.setAttribute("data-jarvis-announcement", "true");
            announcement.style.cssText = "margin:0 0 18px;padding:12px 16px;border-radius:14px;background:#fff7ed;border:1px solid #fdba74;color:#7c2d12;font-weight:800;text-align:center;";
            home.prepend(announcement);
          }
          announcement.textContent = content.home_announcement;
        } else if (announcement) {
          announcement.remove();
        }

        const cards = [...home.querySelectorAll(".home-photo-card")];
        (mediaRows || []).forEach((item, index) => {
          const card = cards[index];
          if (!card) return;
          const img = card.querySelector("img");
          const caption = card.querySelector("figcaption");
          if (img) {
            img.src = item.public_url;
            img.alt = item.alt_text || item.file_name || "Desert Rec league photo";
            img.setAttribute("data-jarvis-media-id", item.id);
          }
          if (caption) caption.textContent = item.category || "Desert Rec League Photo";
        });
      } catch (e) {
        console.warn("Jarvis homepage sync skipped:", e);
      }
    }

    applyJarvisHomepage();
    timer = window.setInterval(applyJarvisHomepage, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
