const logo = "/desert-rec-logo.png";

export default function App() {
  const leagues = [
    {
      name: "Tuesday Men's League",
      location: "Buckeye, Arizona",
      desc: "Weekly men's slowpitch softball league designed for competitive and recreational adult teams in Buckeye.",
    },
    {
      name: "Thursday Coed League",
      location: "Buckeye, Arizona",
      desc: "Coed softball league built for fun, structure, and strong community competition each week in Buckeye.",
    },
    {
      name: "Saturday Evening Coed",
      location: "Goodyear, Arizona",
      desc: "Weekend evening coed softball for teams looking for a prime-time rec league atmosphere in Goodyear.",
    },
  ];

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f5ef",
        color: "#222",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          backgroundColor: "#111",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <img
          src={logo}
          alt="Desert Rec Sports League logo"
          style={{
            width: "70px",
            height: "70px",
            objectFit: "contain",
            borderRadius: "10px",
            backgroundColor: "white",
            padding: "4px",
          }}
        />
        <div>
          <h1 style={{ margin: 0 }}>Desert Rec Sports League</h1>
          <p style={{ margin: "8px 0 0" }}>Men&apos;s and Coed Adult Softball</p>
        </div>
      </header>

      <section style={{ padding: "50px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "40px", marginBottom: "10px" }}>
          West Valley Adult Softball Done Right
        </h2>
        <p style={{ fontSize: "18px", maxWidth: "800px", margin: "0 auto 25px" }}>
          Desert Rec Sports League offers organized men&apos;s and coed softball
          leagues built for competition, community, and a professional game-day
          experience across the West Valley.
        </p>

        <a
          href="#waitlist"
          style={{
            display: "inline-block",
            backgroundColor: "#111",
            color: "white",
            padding: "12px 22px",
            textDecoration: "none",
            borderRadius: "8px",
            marginRight: "10px",
          }}
        >
          Join the Waitlist
        </a>

        <a
          href="mailto:DesertRecSportsLeague@gmail.com"
          style={{
            display: "inline-block",
            border: "1px solid #111",
            color: "#111",
            padding: "12px 22px",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Email the League
        </a>
      </section>

      <section style={{ padding: "20px 40px 50px" }}>
        <h2>About Desert Rec Sports League</h2>
        <p style={{ maxWidth: "900px", lineHeight: 1.6 }}>
          Desert Rec Sports League was created to bring a professional, reliable,
          and exciting adult softball experience to the West Valley. Our goal is
          to build leagues that are organized, competitive, and easy for teams to join.
        </p>
      </section>

      <section style={{ padding: "20px 40px 50px" }}>
        <h2>Current League Offerings</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {leagues.map((league) => (
            <div
              key={league.name}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{league.name}</h3>
              <p style={{ fontWeight: "bold" }}>Location: {league.location}</p>
              <p style={{ lineHeight: 1.6 }}>{league.desc}</p>
              <p style={{ marginTop: "10px", lineHeight: 1.6 }}>
                <strong>Season Format:</strong> 8-week season followed by a single
                elimination playoff tournament.
              </p>
              <p style={{ marginTop: "10px", color: "#444" }}>
                Registration link will be available soon. Exact league dates will be posted.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "20px 40px 50px" }}>
        <h2>League Locations</h2>
        <p style={{ maxWidth: "900px", lineHeight: 1.6 }}>
          Tuesday and Thursday leagues will be played in <strong>Buckeye, Arizona</strong>.
          Saturday evening league will be played in <strong>Goodyear, Arizona</strong>.
        </p>
      </section>

      <section id="waitlist" style={{ padding: "20px 40px 50px" }}>
        <h2>Join the Team Waitlist</h2>
        <p style={{ maxWidth: "900px", lineHeight: 1.6 }}>
          Fill out the form below to join the waitlist and receive league updates,
          opening dates, and next-step details.
        </p>

        <form
          action="https://formspree.io/f/xreynenj"
          method="POST"
          style={{
            maxWidth: "600px",
            marginTop: "20px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <input type="hidden" name="_subject" value="New Desert Rec Waitlist Submission" />

          <input
            type="text"
            name="name"
            placeholder="Contact Name"
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="teamName"
            placeholder="Team Name"
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            style={inputStyle}
          />

          <select name="leagueInterest" required style={inputStyle} defaultValue="">
            <option value="" disabled>
              Select League Interest
            </option>
            <option value="Tuesday Men's League">Tuesday Men&apos;s League</option>
            <option value="Thursday Coed League">Thursday Coed League</option>
            <option value="Saturday Evening Coed">Saturday Evening Coed</option>
          </select>

          <textarea
            name="message"
            placeholder="Additional Information"
            rows="5"
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#111",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Join Waitlist
          </button>
        </form>

        <p style={{ marginTop: "16px" }}>
          <strong>Email:</strong> DesertRecSportsLeague@gmail.com
        </p>
      </section>

      <section style={{ padding: "20px 40px 50px" }}>
        <h2>Sponsors & Community Partners</h2>
        <p style={{ maxWidth: "900px", lineHeight: 1.6 }}>
          Desert Rec Sports League is building partnerships with local businesses
          across the West Valley. If your business is interested in sponsorship
          opportunities, we would love to connect.
        </p>
      </section>

      <footer
        style={{
          backgroundColor: "#111",
          color: "white",
          padding: "20px 40px",
          marginTop: "30px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src={logo}
          alt="Desert Rec Sports League logo"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "contain",
            borderRadius: "8px",
            backgroundColor: "white",
            padding: "3px",
          }}
        />
        <div>
          <p style={{ margin: 0 }}>Desert Rec Sports League</p>
          <p style={{ margin: "6px 0 0" }}>DesertRecSportsLeague@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}