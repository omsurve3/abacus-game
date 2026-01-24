import { useEffect, useRef, useState } from "react";

const labels = ["T-Th", "Th", "H", "T", "O"];
const placeValues = [10000, 1000, 100, 10, 1];
const colors = ["#7ccf4e", "#d36ad6", "#4f7fb5", "#f4c430", "#cccccc"];

export default function App() {
  const [beads, setBeads] = useState([0, 0, 0, 0, 0]);
  const [target, setTarget] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [activeRod, setActiveRod] = useState(null);
  const [hintOn, setHintOn] = useState(false);

  const clickSoundRef = useRef(
    new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
  );
  const successSoundRef = useRef(
    new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3")
  );

  useEffect(() => {
    newQuestion();
  }, []);

  const newQuestion = () => {
    setTarget(Math.floor(10000 + Math.random() * 90000));
    setBeads([0, 0, 0, 0, 0]);
    setCelebrate(false);
    setHintOn(false);
  };

  const playClick = () => {
    const sound = clickSoundRef.current;
    sound.currentTime = 0;
    sound.play();
  };

  const addBead = (i) => {
    const arr = [...beads];
    arr[i]++;
    playClick();

    setActiveRod(i);
    setTimeout(() => setActiveRod(null), 200);

    // Carry logic: reset current rod and add to next higher place value
    if (arr[i] > 9) {
      arr[i] = 0;
      if (i > 0) carry(arr, i - 1);
    }
    setBeads(arr);
  };

  const carry = (arr, i) => {
    arr[i]++;
    if (arr[i] > 9) {
      arr[i] = 0;
      if (i > 0) carry(arr, i - 1);
    }
  };

  const removeBead = (i) => {
    if (beads[i] === 0) return;
    playClick();

    setActiveRod(i);
    setTimeout(() => setActiveRod(null), 200);

    const arr = [...beads];
    arr[i]--;
    setBeads(arr);
  };

  const currentValue = beads.reduce(
    (sum, b, i) => sum + b * placeValues[i],
    0
  );

  // Returns the digit at a given place value (used for hint mode)
  const getDigitAt = (num, place) => Math.floor(num / place) % 10;

  useEffect(() => {
    // Trigger celebration and sound when target is matched
    if (currentValue === target && target !== 0 && !celebrate) {
      setCelebrate(true);

      const sound = successSoundRef.current;
      sound.currentTime = 0;
      sound.play();

      setTimeout(() => setCelebrate(false), 1200);
    }
  }, [currentValue, target, celebrate]);

  return (
    <div className="page">
      {celebrate && (
        <div className="confetti">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              className={i % 2 === 0 ? "confetti-piece" : "confetti-star"}
            />
          ))}
        </div>
      )}

      <h3>Match the Number on the Abacus</h3>
      <div className="target">{target}</div>

      <div className={`abacus-box ${currentValue === target ? "matched" : ""}`}>
        <div className="rods">
          {beads.map((count, i) => (
            <div
              key={i}
              className={`rod
                ${activeRod === i ? "active-rod" : ""}
                ${
                  hintOn &&
                  getDigitAt(currentValue, placeValues[i]) !==
                    getDigitAt(target, placeValues[i])
                    ? "hint-rod"
                    : ""
                }
              `}
            >
              <div className="stick" />
              <div className="beads">
                {Array.from({ length: count }).map((_, j) => (
                  <div
                    key={j}
                    className="bead"
                    style={{ background: colors[i] }}
                  />
                ))}
              </div>
              <div className="label">{labels[i]}</div>
            </div>
          ))}
        </div>

        <div className="base" />

        <div className="controls">
          {beads.map((_, i) => (
            <div key={i}>
              <button onClick={() => removeBead(i)}>-</button>
              <button onClick={() => addBead(i)}>+</button>
            </div>
          ))}
        </div>
      </div>

      <h2>{currentValue}</h2>

      <p className={currentValue === target ? "success" : "hint"}>
        {currentValue === target
          ? "You matched the number!"
          : "Keep adjusting the beads."}
      </p>

      <button className="new-btn" onClick={newQuestion}>
        New Question
      </button>

      <button
        className="new-btn"
        style={{ background: "#3b82f6", marginTop: "10px" }}
        onClick={() => setHintOn((prev) => !prev)}
      >
        {hintOn ? "Hide Hint" : "Show Hint"}
      </button>
    </div>
  );
}
