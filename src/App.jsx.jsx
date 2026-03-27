import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("teams").insert([
      {
        team_name: teamName,
        captain_name: captain,
        email,
        phone,
      },
    ]);

    if (error) {
      alert("Error saving data");
      console.log(error);
    } else {
      alert("Team registered!");
      setTeamName("");
      setCaptain("");
      setEmail("");
      setPhone("");
    }
  }

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: system-ui, sans-serif;
          background: #f4efe9;
          color: #1f1a17;
        }

        .container {
          max-width: 1100px;
          margin: auto;
          padding: 40px 20px;
        }

        .title {
          font-size: 42px;
          font-weight: 900;
          margin-bottom: 10px;
          color: #1f1a17;
        }

        .subtitle {
          color: #4a4138;
          margin-bottom: 30px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #ddd;
        }

        .input {
          width: 100%;
          padding: 14px;
          margin-bottom: 14px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 16px;
          color: #1f1a17;
        }

        .input::placeholder {
          color: #6b6258;
        }

        .button {
          width: 100%;
          padding: 14px;
          background: #f59e0b;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }

        .button:hover {
          background: #e48a00;
        }
      `}</style>

      <div className="container">
        <div className="title">
          Register your team or join as a free agent
        </div>

        <div className="subtitle">
          Thursday night coed softball at Sundance Park in Buckeye, Arizona.
        </div>

        <div className="grid">
          <div className="card">
            <h3>League Details</h3>
            <p>Thursday Nights</p>
            <p>Sundance Park – Buckeye, AZ</p>
            <p>8 Week Season</p>
          </div>

          <div className="card">
            <h3>Register a Team</h3>

            <form onSubmit={handleSubmit}>
              <input
                className="input"
                placeholder="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />

              <input
                className="input"
                placeholder="Captain Name"
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                required
              />

              <input
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="input"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <button className="button">Register Team</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}