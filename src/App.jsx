import { useState } from "react";
import { champions, pickBanSequence } from "./data";

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [slots, setSlots] = useState(Array(pickBanSequence.length).fill(null));
  const [prediction, setPrediction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // The first empty slot = current step
  const currentIndex = slots.findIndex(s => s === null);
  const currentInfo = currentIndex === -1 ? null : pickBanSequence[currentIndex];

  // Disable champions already picked or banned
  const selectedIds = new Set(slots.filter(Boolean).map(ch => ch.id));

  const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* ------------------------------------------------------------
     Handle selecting a champion from the grid
     ------------------------------------------------------------ */
  function handleSelect(champId) {
    const champObj = champions.find(c => c.id === champId);
    if (!champObj) return;
    if (selectedIds.has(champId)) return;
    if (currentIndex === -1) return; // draft full

    setSlots(prev => {
      const next = [...prev];
      const idx = next.findIndex(s => s === null);
      if (idx !== -1) next[idx] = champObj;
      return next;
    });
  }

  /* ------------------------------------------------------------
     Reset draft
     ------------------------------------------------------------ */
  function resetDraft() {
    setSlots(Array(pickBanSequence.length).fill(null));
    setPrediction(null);
    setSearchQuery("");
  }

  /* ------------------------------------------------------------
     Click a slot to clear it
     ------------------------------------------------------------ */
  function handleSlotClick(seqIndex) {
    setSlots(prev => {
      const next = [...prev];
      next[seqIndex] = null;
      return next;
    });
    setPrediction(null);
  }

  /* ------------------------------------------------------------
     Predict Winner (call Python backend)
     ------------------------------------------------------------ */
  async function handlePredict() {
    const team1_ids = [];
    const team2_ids = [];

    for (let i = 0; i < slots.length; i++) {
      const champ = slots[i];
      if (!champ) continue;

      const info = pickBanSequence[i];
      if (info.type === "pick") {
        if (info.side === "B") team1_ids.push(champ.id);
        else team2_ids.push(champ.id);
      }
    }

    const payload = { team1_ids, team2_ids };

    try {
      const response = await fetch(`http://localhost:5000/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1_ids, team2_ids })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-sky-900 to-grey-950 text-white">
      <div className="h-full p-8 flex flex-col">

        {/* TITLE + RESET */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center flex-1">
            LoL Pick/Ban Simulator
          </h1>

          <button
            onClick={resetDraft}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Reset Draft
          </button>
        </div>

        {/* CURRENT ACTION */}
        {currentInfo ? (
          <div className="text-center text-xl mb-4">
            <span
              className={`font-bold ${
                currentInfo.side === "B" ? "text-blue-400" : "text-red-400"
              }`}
            >
              {currentInfo.side === "B" ? "Blue Side" : "Red Side"}
            </span>{" "}
            is selecting a{" "}
            <span className="font-bold">
              {currentInfo.type.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="text-center text-2xl font-bold text-green-400 mb-4">
            Draft Complete!
          </div>
        )}

        {/* DRAFT BOARD */}
        <DraftBoard 
          slots={slots}
          currentIndex={currentIndex}
          onSlotClick={handleSlotClick}
        />

        {/* PREDICT BUTTON */}
        {currentIndex === -1 && (
          <div className="text-center my-4">
            <button
              onClick={handlePredict}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Predict Winner
            </button>

            {prediction && (
              <div className="mt-4 text-xl">
                <div>Blue Win Chance: {(prediction.blue_win * 100).toFixed(1)}%</div>
                <div>Red Win Chance: {(prediction.red_win * 100).toFixed(1)}%</div>
              </div>
            )}
          </div>
        )}

        {/* CHAMPION GRID */}
        <h2 className="text-2xl text-center text-white font-bold font-serif mb-2">
          Champions
        </h2>
        <div className="flex justify-center mb-3">
          <input
            type="text"
            placeholder="Search champions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full max-w-md px-4 py-2 rounded-lg
              text-white
              border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-blue-400
            "
          />
        </div>
        <div className="mt-4 flex justify-center overflow-y-auto">
          <div className="grid grid-cols-[repeat(6,140px)] gap-4 pb-6">

            {[...champions]
              .filter(ch =>
                ch.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(ch => {
                const disabled = selectedIds.has(ch.id) || currentIndex === -1;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelect(ch.id)}
                    disabled={disabled}
                    className={`flex flex-col items-center rounded-xl border shadow bg-white text-white p-2 transition ${
                      disabled ? "cursor-not-allowed opacity-40" : "hover:bg-blue-200"
                    }`}
                  >

                    <div className="w-full aspect-square overflow-hidden rounded">
                      <img
                        src={ch.image}
                        alt={ch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="mt-1 text-xs md:text-sm text-center">
                      {ch.name}
                    </span>

                  </button>
                );
              })}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DRAFT BOARD LOGIC
   ============================================================ */
function DraftBoard({ slots, currentIndex, onSlotClick }) {
  const blueBans  = [];
  const redBans   = [];
  const bluePicks = [];
  const redPicks  = [];

  let bBan = 0, rBan = 0, bPick = 0, rPick = 0;

  for (let i = 0; i < pickBanSequence.length; i++) {
    const info = pickBanSequence[i];
    const champ = slots[i];

    if (info.type === "ban") {
      if (info.side === "B") blueBans[bBan++] = { champ, seqIndex: i };
      else redBans[rBan++] = { champ, seqIndex: i };
    } else {
      if (info.side === "B") bluePicks[bPick++] = { champ, seqIndex: i };
      else redPicks[rPick++] = { champ, seqIndex: i };
    }
  }

  const currentPos = currentIndex === -1 ? null : getSlotPosition(currentIndex);

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-2 ">

      {/* BANS ROW */}
      <div className="grid grid-cols-10 gap-2 w-full max-w-[900px]">
        {blueBans.map((slot, i) =>
          <DraftSlot
            key={`bb${i}`}
            label={`B${i + 1}`}
            champ={slot?.champ}
            seqIndex={slot?.seqIndex}
            isBan={true}
            active={currentPos?.row === "ban" && currentPos?.side === "B" && currentPos?.order === i + 1}
            onClick={onSlotClick}
          />
        )}
        {redBans.map((slot, i) =>
          <DraftSlot
            key={`rb${i}`}
            label={`R${i + 1}`}
            champ={slot?.champ}
            seqIndex={slot?.seqIndex}
            isBan={true}
            active={currentPos?.row === "ban" && currentPos?.side === "R" && currentPos?.order === i + 1}
            onClick={onSlotClick}
          />
        )}
      </div>

      {/* PICKS ROW */}
      <div className="grid grid-cols-10 gap-2 w-full max-w-[900px]">
        {bluePicks.map((slot, i) =>
          <DraftSlot
            key={`bp${i}`}
            label={`B${i + 1}`}
            champ={slot?.champ}
            seqIndex={slot?.seqIndex}
            isBan={false}
            active={currentPos?.row === "pick" && currentPos?.side === "B" && currentPos?.order === i + 1}
            onClick={onSlotClick}
          />
        )}
        {redPicks.map((slot, i) =>
          <DraftSlot
            key={`rp${i}`}
            label={`R${i + 1}`}
            champ={slot?.champ}
            seqIndex={slot?.seqIndex}
            isBan={false}
            active={currentPos?.row === "pick" && currentPos?.side === "R" && currentPos?.order === i + 1}
            onClick={onSlotClick}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   HELPER — Map sequence index → display position
   ============================================================ */
function getSlotPosition(seqIndex) {
  let bBan = 0, rBan = 0, bPick = 0, rPick = 0;

  for (let i = 0; i <= seqIndex; i++) {
    const info = pickBanSequence[i];

    if (info.type === "ban") {
      if (info.side === "B") {
        bBan++; if (i === seqIndex) return { row: "ban", side: "B", order: bBan };
      } else {
        rBan++; if (i === seqIndex) return { row: "ban", side: "R", order: rBan };
      }
    } else {
      if (info.side === "B") {
        bPick++; if (i === seqIndex) return { row: "pick", side: "B", order: bPick };
      } else {
        rPick++; if (i === seqIndex) return { row: "pick", side: "R", order: rPick };
      }
    }
  }

  return null;
}

/* ============================================================
   SINGLE DRAFT SLOT
   ============================================================ */
function DraftSlot({ label, champ, seqIndex, active, isBan, onClick }) {
  const handleClick = () => {
    if (champ && typeof seqIndex === "number") onClick(seqIndex);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full h-20 rounded-lg flex items-center justify-center shadow bg-gray-800 overflow-hidden transition
        ${champ ? "cursor-pointer" : "cursor-default"}
        ${active ? "outline outline-4 outline-white shadow-xl scale-[1.02]" : ""}
      `}
    >

      {/* EMPTY LABEL */}
      {!champ && (
        <span className="text-blue-200 text-xs absolute top-1 left-1">
          [{label}]
        </span>
      )}

      {/* CHAMPION IMAGE */}
      {champ && (
        <img
          src={champ.image}
          alt={champ.name}
          className="w-full h-full object-cover"
        />
      )}

      {/* BAN DIAGONAL SLASH */}
      {isBan && champ && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="
            absolute top-1/2 left-0 w-full h-[3px]
            bg-white opacity-70 rotate-45
            origin-center shadow-md
          " />
        </div>
      )}
    </div>
  );
}
