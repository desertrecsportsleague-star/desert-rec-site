import { useState } from "react";

const logo = "/desert-rec-logo.png";
const heroImage = "/hero-softball.jpg";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const leagues = [
    {
      name: "Tuesday Men's League",
      location: "Buckeye, Arizona",
      desc: "A structured men's slowpitch league built for competitive and recreational teams looking for a quality weeknight softball experience.",
    },
    {
      name: "Thursday Coed League",
      location: "Buckeye, Arizona",
      desc: "A balanced coed softball league designed for fun, consistency, and strong weekly competition in a well-run adult rec environment.",
    },
    {
      name: "Saturday Evening Coed",
      location: "Goodyear, Arizona",
      desc: "A prime-time Saturday evening coed league for teams looking for a high-energy atmosphere and organized weekend play.",
    },
  ];

  return (
    <div className="site">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f7f3eb;
          color: #1f1a17;
        }

        a {
          color: inherit;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section {
          padding: 72px 0;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(17, 17, 17, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .header-inner {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
        }

        .brand img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          background: white;
          border-radius: 14px;
          padding: 4px;
        }

        .brand-title {
          color: white;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.1;
        }

        .brand-subtitle {
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          margin-top: 4px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .nav a {
          color: white;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .nav-cta {
          background: #f59e0b;
          color: #111 !important;
          padding: 10px 16px;
          border-radius: 999px;
        }

        .menu-button {
          display: none;
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          padding: 10px 12px;
          font-weight: 700;
        }

        .mobile-menu {
          display: none;
          padding: 0 0 18px;
        }

        .mobile-menu.open {
          display: block;
        }

        .mobile-menu a {
          display: block;
          color: white;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .hero {
          position: relative;
          color: white;
          background:
            linear-gradient(rgba(18, 12, 8, 0.7), rgba(18, 12, 8, 0.7)),
            url(${heroImage}) center/cover no-repeat;
        }

        .hero-inner {
          min-height: 680px;
          display: grid;
          grid-template-columns: 1.2fr 0.9fr;
          gap: 36px;
          align-items: center;
          padding: 80px 0;
        }

        .eyebrow {
          display: inline-block;
          background: rgba(245, 158, 11, 0.18);
          color: #fcd48b;
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .hero h1 {
          margin: 0 0 16px;
          font-size: clamp(40px, 6vw, 68px);
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: -1.5px;
          max-width: 760px;
        }

        .hero p {
          max-width: 720px;
          font-size: 18px;
          line-height: 1.75;
          color: rgba(255,255,255,0.84);
          margin: 0 0 28px;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          text-decoration: none;
          border-radius: 999px;
          padding: 14px 22px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .btn-primary {
          background: #f59e0b;
          color: #111;
        }

        .btn-secondary {
          border: 1px solid rgba(255,255,255,0.28);
          color: white;
        }

        .hero-card {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 16px 44px rgba(0,0,0,0.25);
          backdrop-filter: blur(6px);
        }

        .hero-card-label {
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #fcd48b;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .hero-card h3 {
          margin: 0 0 16px;
          font-size: 28px;
          line-height: 1.15;
        }

        .hero-list {
          display: grid;
          gap: 12px;
        }

        .hero-list-item {
          background: rgba(255,255,255,0.08);
          padding: 14px 16px;
          border-radius: 14px;
          font-weight: 700;
        }

        .hero-note {
          margin-top: 18px;
          background: rgba(245, 158, 11, 0.14);
          border-radius: 16px;
          padding: 16px;
          color: #f8e8c6;
          line-height: 1.65;
        }

        .stats-grid,
        .leagues-grid,
        .features-grid {
          display: grid;
          gap: 20px;
        }

        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .leagues-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .features-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .card {
          background: white;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .stat-label,
        .section-label,
        .league-location {
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 800;
          font-size: 13px;
        }

        .stat-label {
          color: #8a7f72;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 800;
        }

        .section-label {
          color: #b45309;
          margin-bottom: 10px;
        }

        .section-title {
          margin: 0 0 12px;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 900;
        }

        .section-copy {
          max-width: 760px;
          font-size: 17px;
          line-height: 1.75;
          color: #5f564d;
        }

        .league-location {
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff4e5;
          color: #b45309;
        }

        .league-title {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 900;
          line-height: 1.15;
        }

        .league-copy {
          color: #5f564d;
          line-height: 1.72;
          margin-bottom: 16px;
        }

        .league-format {
          padding: 14px 16px;
          border-radius: 14px;
          background: #f7f3eb;
          border: 1px solid #e6ded0;
          line-height: 1.65;
          margin-bottom: 14px;
        }

        .league-note {
          color: #7a6e62;
          line-height: 1.65;
          font-weight: 600;
        }

        .dark-band {
          background: #111;
          color: white;
        }

        .dark-feature {
          background: rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          font-weight: 700;
          font-size: 18px;
        }

        .waitlist-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 28px;
          align-items: start;
        }

        .info-box {
          margin-top: 22px;
          padding: 18px;
          border-radius: 18px;
          background: white;
          border: 1px solid #e6ded0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }

        .info-box-title {
          font-weight: 800;
          margin-bottom: 10px;
        }

        .email-link {
          color: #b45309;
          text-decoration: none;
          font-weight: 700;
          word-break: break-word;
        }

        .form-card {
          background: white;
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .form-grid {
          display: grid;
          gap: 14px;
        }

        .input,
        .textarea,
        .select {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #d6d1c7;
          font-size: 16px;
          background: white;
          outline: none;
          font-family: inherit;
        }

        .textarea {
          resize: vertical;
          min-height: 130px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px 18px;
          background: #111;
          color: white;
          border: none;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .sponsor-card {
          background: linear-gradient(135deg, #fff 0%, #fcf8f1 55%, #fff1d8 100%);
        }

        .footer {
          background: #111;
          color: white;
          margin-top: 40px;
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding: 28px 0;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-brand img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          background: white;
          border-radius: 12px;
          padding: 3px;
        }

        .footer-title {
          font-weight: 800;
        }

        .footer-subtitle,
        .footer-email {
          color: rgba(255,255,255,0.72);
          font-size: 14px;
        }

        @media (max-width: 980px) {
          .hero-inner,
          .waitlist-grid,
          .stats-grid,
          .leagues-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-inner {
            min-height: auto;
          }
        }

        @media (max-width: 760px) {
          .nav {
            display: none;
          }

          .menu-button {
            display: inline-block;
          }

          .hero {
            background-position: center;
          }

          .section {
            padding: 58px 0;
          }

          .hero-inner {
            padding: 64px 0;
          }

          .header-inner {
            min-height: 72px;
          }

          .brand-title {
            font-size: 18px;
          }

          .brand-subtitle {
            font-size: 13px;
          }

          .hero h1 {
            font-size: clamp(34px, 10vw, 52px);
          }

          .hero p,
          .section-copy {
            font-size: 16px;
          }

          .card,
          .form-card {
            padding: 22px;
          }
        }
      `}</style>

      <header className="header">
        <div className="container">
          <div className="header-inner">
            <a href="#top" className="brand">
              <img src={logo} alt="Desert Rec Sports League logo" />
              <div>
                <div className="brand-title">Desert Rec Sports League</div>
                <div className="brand-subtitle">Men&apos;s and Coed Adult Softball</div>
              </div>
            </a>

            <nav className="nav">
              <a href="#leagues">Leagues</a>
              <a href="#waitlist">Waitlist</a>
              <a href="#sponsors">Sponsors</a>
              <a
                href="mailto:DesertRecSportsLeague@gmail.com"
                className="nav-cta"
              >
                Contact
              </a>
            </nav>

            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>

          <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
            <a href="#leagues" onClick={() => setMenuOpen(false)}>
              Leagues
            </a>
            <a href="#waitlist" onClick={() => setMenuOpen(false)}>
              Waitlist
            </a>
            <a href="#sponsors" onClick={() => setMenuOpen(false)}>
              Sponsors
            </a>
            <a
              href="mailto:DesertRecSportsLeague@gmail.com"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="eyebrow">West Valley Adult Softball</div>
              <h1>Organized leagues. Strong competition. Real community.</h1>
              <p>
                Desert Rec Sports League delivers a professional men&apos;s and coed
                adult softball experience across Buckeye and Goodyear. Registration
                links will be available soon, and exact league dates will be posted
                once final scheduling is complete.
              </p>

              <div className="hero-actions">
                <a href="#waitlist" className="btn btn-primary">
                  Join the Waitlist
                </a>
                <a
                  href="mailto:DesertRecSportsLeague@gmail.com"
                  className="btn btn-secondary"
                >
                  Email the League
                </a>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-card-label">Upcoming League Lineup</div>
              <h3>Tuesday, Thursday, and Saturday softball</h3>

              <div className="hero-list">
                <div className="hero-list-item">Tuesday Men&apos;s League — Buckeye</div>
                <div className="hero-list-item">Thursday Coed League — Buckeye</div>
                <div className="hero-list-item">Saturday Evening Coed — Goodyear</div>
              </div>

              <div className="hero-note">
                Every league features an <strong>8-week season</strong> followed by{" "}
                <strong>single elimination playoffs</strong>.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats-grid">
            <div className="card">
              <div className="stat-label">League Types</div>
              <div className="stat-value">Men&apos;s and Coed</div>
            </div>
            <div className="card">
              <div className="stat-label">Locations</div>
              <div className="stat-value">Buckeye and Goodyear</div>
            </div>
            <div className="card">
              <div className="stat-label">Season Format</div>
              <div className="stat-value">8 Weeks + Playoffs</div>
            </div>
            <div className="card">
              <div className="stat-label">Registration</div>
              <div className="stat-value">Link Available Soon</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="leagues" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ maxWidth: "760px", marginBottom: "28px" }}>
            <div className="section-label">Current League Offerings</div>
            <h2 className="section-title">
              Built for teams that want a better adult softball experience
            </h2>
            <p className="section-copy">
              Our leagues are designed to be organized, competitive, and easy to
              follow, with clear communication and a professional game-day feel.
            </p>
          </div>

          <div className="leagues-grid">
            {leagues.map((league) => (
              <div key={league.name} className="card">
                <div className="league-location">{league.location}</div>
                <h3 className="league-title">{league.name}</h3>
                <div className="league-copy">{league.desc}</div>

                <div className="league-format">
                  <strong>Season Format:</strong> 8-week season followed by a single
                  elimination playoff tournament.
                </div>

                <div className="league-note">
                  Registration link will be available soon. Exact league dates will
                  be posted once finalized.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-band">
        <div className="container">
          <div className="features-grid">
            <div className="dark-feature">Professional league communication</div>
            <div className="dark-feature">8-week seasons with playoffs</div>
            <div className="dark-feature">Men&apos;s and coed divisions</div>
            <div className="dark-feature">Buckeye and Goodyear locations</div>
          </div>
        </div>
      </section>

      <section className="section" id="waitlist">
        <div className="container">
          <div className="waitlist-grid">
            <div>
              <div className="section-label">Join the Team Waitlist</div>
              <h2 className="section-title">Start securing your spot now</h2>
              <p className="section-copy">
                Fill out the form to receive updates on league openings, exact dates,
                registration timing, and next steps for your team or free agent entry.
              </p>

              <div className="info-box">
                <div className="info-box-title">Questions? Email us</div>
                <a
                  href="mailto:DesertRecSportsLeague@gmail.com"
                  className="email-link"
                >
                  DesertRecSportsLeague@gmail.com
                </a>
              </div>
            </div>

            <form
              action="https://formspree.io/f/xreynenj"
              method="POST"
              className="form-card"
            >
              <input
                type="hidden"
                name="_subject"
                value="New Desert Rec Waitlist Submission"
              />

              <div className="form-grid">
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Contact Name"
                  required
                />

                <input
                  className="input"
                  type="text"
                  name="teamName"
                  placeholder="Team Name"
                />

                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                />

                <input
                  className="input"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                />

                <select
                  className="select"
                  name="leagueInterest"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select League Interest
                  </option>
                  <option value="Tuesday Men's League">Tuesday Men&apos;s League</option>
                  <option value="Thursday Coed League">Thursday Coed League</option>
                  <option value="Saturday Evening Coed">Saturday Evening Coed</option>
                </select>

                <textarea
                  className="textarea"
                  name="message"
                  placeholder="Additional Information"
                />

                <button type="submit" className="submit-btn">
                  Join Waitlist
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="section" id="sponsors" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card sponsor-card">
            <div className="section-label">Sponsors & Community Partners</div>
            <h2 className="section-title" style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}>
              Built to grow with local businesses and community support
            </h2>
            <p className="section-copy" style={{ maxWidth: "900px" }}>
              Desert Rec Sports League is actively building partnerships with local
              businesses across the West Valley. If your business is interested in
              sponsorship opportunities, we would love to connect.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src={logo} alt="Desert Rec Sports League logo" />
              <div>
                <div className="footer-title">Desert Rec Sports League</div>
                <div className="footer-subtitle">Men&apos;s and Coed Adult Softball</div>
              </div>
            </div>

            <div className="footer-email">DesertRecSportsLeague@gmail.com</div>
          </div>
        </div>
      </footer>
    </div>
  );
}