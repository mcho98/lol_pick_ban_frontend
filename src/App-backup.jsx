import { useState } from "react";
import { champions, pickBanSequence } from "./data";

export default function App() {
  const [step, setStep] = useState(0);

  const [blue, setBlue] = useState({ picks: [], bans: [] });
  const [red, setRed] = useState({ picks: [], bans: [] });

  const current = pickBanSequence[step];

  const allSelected = new Set([
    ...blue.picks.map(c => c.id),
    ...blue.bans.map(c => c.id),
    ...red.picks.map(c => c.id),
    ...red.bans.map(c => c.id),
  ]);

  function handleSelect(champId) {
    if (!current) return;

    const champObj = champions.find(c => c.id === champId);
    if (!champObj) return;
    if (allSelected.has(champId)) return;

    if (current.type === "ban") {
      if (current.side === "B") {
        setBlue(prev => ({ ...prev, bans: [...prev.bans, champObj] }));
      } else {
        setRed(prev => ({ ...prev, bans: [...prev.bans, champObj] }));
      }
    }

    if (current.type === "pick") {
      if (current.side === "B") {
        setBlue(prev => ({ ...prev, picks: [...prev.picks, champObj] }));
      } else {
        setRed(prev => ({ ...prev, picks: [...prev.picks, champObj] }));
      }
    }

    setStep(step + 1);
  }

  function resetDraft() {
    setStep(0);
    setBlue({ picks: [], bans: [] });
    setRed({ picks: [], bans: [] });
  }

  return (
    <div className="w-full h-screen bg-cyan-950">
      {/* full-height flex column so board stays fixed and champs scroll */}
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
        {current ? (
          <div className="text-center text-xl mb-4">
            <span
              className={`font-bold ${
                current.side === "B" ? "text-blue-600" : "text-red-600"
              }`}
            >
              {current.side === "B" ? "Blue Side" : "Red Side"}
            </span>{" "}
            is selecting a{" "}
            <span className="font-bold text">
              {current.type.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="text-center text-2xl font-bold text-green-600 mb-4">
            Draft Complete!
          </div>
        )}

        {/* DRAFT BOARD (always visible) */}
        <DraftBoard blue={blue} red={red} step={step} />

        {/* SCROLLABLE CHAMPIONS SECTION */}
        <h2 className="text-2xl text-center font-bold font-serif mb-3">Champions</h2>
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 pb-6">

            {[...champions]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(ch => {
                const disabled = allSelected.has(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelect(ch.id)}
                    disabled={disabled || !current}
                    className={`flex flex-col items-center rounded-xl border shadow bg-white p-2 transition ${
                      disabled
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-blue-100"
                    }`}
                  >

                    {/* IMAGE */}
                    <div className="w-full aspect-square overflow-hidden rounded">
                      <img
                        src={ch.image}
                        alt={ch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* NAME */}
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

/* ---------------- Draft Board ---------------- */

function DraftBoard({ blue, red, step }) {
  const blueBans = [...blue.bans, ...Array(5 - blue.bans.length).fill(null)];
  const redBans = [...red.bans, ...Array(5 - red.bans.length).fill(null)];

  const bluePicks = [...blue.picks, ...Array(5 - blue.picks.length).fill(null)];
  const redPicks = [...red.picks, ...Array(5 - red.picks.length).fill(null)];

  const current = pickBanSequence[step];
  const currentType = current?.type;
  const currentSide = current?.side;

  const banCountB = blue.bans.length;
  const banCountR = red.bans.length;
  const pickCountB = blue.picks.length;
  const pickCountR = red.picks.length;

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-2">
      {/* BANS */}
      <div className="grid grid-cols-10 gap-2 w-full">
        {blueBans.map((champ, i) => (
          <DraftSlot
            key={`bb${i}`}
            label={`B Ban ${i + 1}`}
            champ={champ}
            active={
              currentType === "ban" &&
              currentSide === "B" &&
              i === banCountB
            }
            isBan = {true}
          />
        ))}
        {redBans.map((champ, i) => (
          <DraftSlot
            key={`rb${i}`}
            label={`R Ban ${i + 1}`}
            champ={champ}
            active={
              currentType === "ban" &&
              currentSide === "R" &&
              i === banCountR
            }
            isBan = {true}
          />
        ))}
      </div>

      {/* PICKS */}
      <div className="grid grid-cols-10 gap-2 w-full">
        {bluePicks.map((champ, i) => (
          <DraftSlot
            key={`bp${i}`}
            label={`B${i + 1}`}
            champ={champ}
            active={
              currentType === "pick" &&
              currentSide === "B" &&
              i === pickCountB
            }
            isBan = {false}
          />
        ))}
        {redPicks.map((champ, i) => (
          <DraftSlot
            key={`rp${i}`}
            label={`R${i + 1}`}
            champ={champ}
            active={
              currentType === "pick" &&
              currentSide === "R" &&
              i === pickCountR
            }
            isBan = {false}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Draft Slot ---------------- */

function DraftSlot({ label, champ, active, isBan }) {
  return (
    <div
      className={`relative w-full h-20 rounded-lg flex items-center justify-center shadow bg-gray-800 overflow-hidden transition
        ${active ? "outline outline-4 outline-white shadow-lg scale-[1.02]" : ""}
      `}
    >
      {/* Placeholder label */}
      {!champ && (
        <span className="text-blue-300 text-xs absolute top-1 left-1">
          [{label}]
        </span>
      )}

      {/* Champion image */}
      {champ && (
        <img
          src={champ.image}
          alt={champ.name}
          title={champ.name}
          className="w-full h-full object-cover"
        />
      )}

      {/* -------------------------------------------- */}
      {/* BAN OVERLAY — white diagonal slash */}
      {/* -------------------------------------------- */}
      {isBan && champ && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="
            absolute top-1/2 left-0 w-full h-[3px] 
            bg-white
            opacity-50
            rotate-45 
            origin-center
            shadow-md
          " />
        </div>
      )}
    </div>
  );
}

