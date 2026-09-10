import { useState } from "react";
import { CLOSER_DECK, shuffledOrder, type CloserCard } from "./closerDeck";
import "./App.css";

const ALL_CATEGORIES = Array.from(new Set(CLOSER_DECK.map((c) => c.category)));
const STORAGE_KEY = "closer.categories";

function loadSelected(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // ignore
  }
  return new Set(ALL_CATEGORIES);
}

interface GameState {
  deck: CloserCard[];
  order: number[];
  index: number;
}

function App() {
  const [selected, setSelected] = useState<Set<string>>(loadSelected);
  const [game, setGame] = useState<GameState | null>(null);

  const toggleCategory = (category: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const start = () => {
    const deck = CLOSER_DECK.filter((c) => selected.has(c.category));
    if (deck.length === 0) return;
    setGame({ deck, order: shuffledOrder(deck.length), index: 0 });
  };

  const next = () => {
    setGame((prev) => {
      if (!prev) return prev;
      const wrapping = prev.index + 1 >= prev.order.length;
      return wrapping
        ? { ...prev, order: shuffledOrder(prev.order.length), index: 0 }
        : { ...prev, index: prev.index + 1 };
    });
  };

  const end = () => setGame(null);

  if (!game) {
    return (
      <div className="screen">
        <h1>Closer</h1>
        <p>A deck of questions to get closer, together.</p>
        <div className="category-picker">
          {ALL_CATEGORIES.map((category) => {
            const count = CLOSER_DECK.filter((c) => c.category === category).length;
            return (
              <label key={category} className="category-row">
                <input type="checkbox" checked={selected.has(category)} onChange={() => toggleCategory(category)} />
                <span>{category}</span>
                <span className="category-count">{count}</span>
              </label>
            );
          })}
        </div>
        <button type="button" onClick={start} disabled={selected.size === 0}>
          Start
        </button>
      </div>
    );
  }

  const card = game.deck[game.order[game.index]];

  return (
    <div className="screen">
      <div className="closer-card">
        <span className="closer-category">{card.category}</span>
        <p className="closer-prompt">{card.prompt}</p>
        <div className="closer-controls">
          <span className="closer-progress">
            {game.index + 1} / {game.order.length}
          </span>
          <button type="button" onClick={next}>
            Next card
          </button>
          <button type="button" onClick={end}>
            End
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
