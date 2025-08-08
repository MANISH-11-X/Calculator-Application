import React, { useEffect, useState, useMemo } from "react";
import { MotionConfig, motion } from "framer-motion";
import { X, Circle, RefreshCw, Cpu } from "lucide-react";

// Modern Tic Tac Toe - Single-file React component
// Requirements: Tailwind CSS, framer-motion, lucide-react
// Drop this component into a create-react-app / Next.js page and ensure Tailwind is configured.

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: "draw" };
  return null;
}

// Minimax for unbeatable AI (X = human, O = AI when AI is O)
function bestMove(board, player) {
  const opponent = player === "X" ? "O" : "X";
  const winnerCheck = (b) => {
    for (const [a, b1, c] of LINES) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (b.every(Boolean)) return "draw";
    return null;
  };

  function minimax(bd, turn) {
    const res = winnerCheck(bd);
    if (res === player) return { score: 1 };
    if (res === opponent) return { score: -1 };
    if (res === "draw") return { score: 0 };

    const scores = [];
    for (let i = 0; i < 9; i++) {
      if (!bd[i]) {
        bd[i] = turn;
        const { score } = minimax(bd, turn === player ? opponent : player);
        scores.push({ i, score });
        bd[i] = null;
      }
    }

    if (turn === player) {
      // maximize
      let best = scores[0];
      for (const s of scores) if (s.score > best.score) best = s;
      return best;
    } else {
      // minimize
      let best = scores[0];
      for (const s of scores) if (s.score < best.score) best = s;
      return best;
    }
  }

  return minimax([...board], player).i;
}

export default function ModernTicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("cpu"); // 'cpu' or 'local'
  const [aiPlaysAs, setAiPlaysAs] = useState("O");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const result = useMemo(() => checkWinner(board), [board]);

  useEffect(() => {
    // If CPU mode and it's AI's turn, run AI
    if (mode === "cpu") {
      const current = xIsNext ? "X" : "O";
      if (current === aiPlaysAs && !result) {
        // slight delay for UX
        const timer = setTimeout(() => {
          makeAIMove();
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [board, xIsNext, mode, aiPlaysAs, result]);

  useEffect(() => {
    if (result) {
      if (result.winner === "draw") {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else if (result.winner) {
        setScores((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      }
    }
  }, [result]);

  function handleClick(i) {
    if (board[i] || result) return;
    const current = xIsNext ? "X" : "O";
    if (mode === "cpu" && current === aiPlaysAs) return; // block clicking when AI plays

    const newBoard = [...board];
    newBoard[i] = current;
    setHistory((h) => [...h, board]);
    setBoard(newBoard);
    setXIsNext((v) => !v);
  }

  function makeAIMove() {
    const player = aiPlaysAs; // 'O' or 'X'
    // easy: random, hard: minimax
    const empty = board.map((v, idx) => (v ? null : idx)).filter((v) => v !== null);
    if (empty.length === 0) return;
    const difficulty = "hard"; // set here: 'easy' or 'hard'
    let idx;
    if (difficulty === "easy") {
      idx = empty[Math.floor(Math.random() * empty.length)];
    } else {
      idx = bestMove(board, player);
      if (idx === undefined || board[idx]) {
        // fallback
        idx = empty[Math.floor(Math.random() * empty.length)];
      }
    }
    const newBoard = [...board];
    newBoard[idx] = player;
    setHistory((h) => [...h, board]);
    setBoard(newBoard);
    setXIsNext((v) => !v);
  }

  function resetBoard(full = false) {
    setBoard(Array(9).fill(null));
    setHistory([]);
    setXIsNext(true);
    if (full) setScores({ X: 0, O: 0, draws: 0 });
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setBoard(last);
    setHistory((h) => h.slice(0, -1));
    setXIsNext((v) => !v);
  }

  const status = result
    ? result.winner === "draw"
      ? "It's a draw"
      : `${result.winner} wins!`
    : `Next: ${xIsNext ? "X" : "O"}`;

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 400, damping: 20 }}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-3xl w-full bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Tic Tac Toe</h1>
              <p className="text-sm text-slate-300 mt-1">Modern, responsive & fun — play vs CPU or a friend.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                <button
                  onClick={() => setMode("cpu")}
                  className={`flex items-center gap-2 text-sm font-medium py-1 px-2 rounded-full ${mode === "cpu" ? "bg-white/10" : ""}`}>
                  <Cpu size={16} /> vs CPU
                </button>
                <button
                  onClick={() => setMode("local")}
                  className={`flex items-center gap-2 text-sm font-medium py-1 px-2 rounded-full ${mode === "local" ? "bg-white/10" : ""}`}>
                  Local
                </button>
              </div>

              <button
                onClick={() => resetBoard(false)}
                title="Reset board"
                className="p-2 rounded-full bg-white/6 hover:bg-white/8">
                <RefreshCw size={18} className="text-white/90" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Board + Controls */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gradient-to-b from-white/3 to-white/2 p-6 rounded-2xl shadow-inner border border-white/6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-300">Status</div>
                    <div className="text-lg font-semibold text-white">{status}</div>
                  </div>
                  <div className="text-sm text-slate-300">Mode: <span className="text-white">{mode === "cpu" ? `CPU (${aiPlaysAs})` : 'Local'}</span></div>
                </div>

                <div className="board grid grid-cols-3 gap-3 p-2 bg-white/3 rounded-lg">
                  {board.map((cell, i) => {
                    const isWinningCell = result?.line?.includes(i);
                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleClick(i)}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`relative aspect-square flex items-center justify-center rounded-lg bg-white/6 hover:bg-white/8 focus:outline-none transform-gpu ${isWinningCell ? "ring-4 ring-offset-2 ring-yellow-400/30" : ""}`}
                      >
                        <div className="w-16 h-16 flex items-center justify-center">
                          {cell === "X" && (
                            <X className={`w-12 h-12 ${isWinningCell ? "text-yellow-300" : "text-white"}`} />
                          )}
                          {cell === "O" && (
                            <Circle className={`w-12 h-12 ${isWinningCell ? "text-yellow-300" : "text-white"}`} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={undo}
                    disabled={history.length === 0}
                    className={`px-4 py-2 rounded-lg bg-white/6 hover:bg-white/8 ${history.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}>
                    Undo
                  </button>

                  <button
                    onClick={() => resetBoard(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-black font-semibold">
                    Reset Scores & Board
                  </button>

                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="col-span-1">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/6">
                <h3 className="text-sm text-slate-300 mb-3">Players</h3>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">Player X</div>
                      <div className="text-xs text-slate-400">Human</div>
                    </div>
                  </div>

                  <div className="text-white font-semibold">{scores.X}</div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center">
                      <Circle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">Player O</div>
                      <div className="text-xs text-slate-400">{mode === 'cpu' ? 'Computer' : 'Human'}</div>
                    </div>
                  </div>

                  <div className="text-white font-semibold">{scores.O}</div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-400 mb-2">AI plays as</div>
                  <div className="flex gap-2">
                    <button onClick={() => setAiPlaysAs('X')} className={`px-3 py-1 rounded-full ${aiPlaysAs === 'X' ? 'bg-white/10' : ''}`}>X</button>
                    <button onClick={() => setAiPlaysAs('O')} className={`px-3 py-1 rounded-full ${aiPlaysAs === 'O' ? 'bg-white/10' : ''}`}>O</button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-slate-400">Draws</div>
                  <div className="text-white font-semibold">{scores.draws}</div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-slate-400 mb-2">Quick tips</div>
                  <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li>Take the center if available.</li>
                    <li>Block opponent forks by playing sides.</li>
                    <li>Use "Undo" to rewind a move.</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>

          <footer className="mt-6 text-center text-xs text-slate-400">Made with ❤️ — Modern Tic Tac Toe • Drop into your React app</footer>
        </div>
      </div>
    </MotionConfig>
  );
}
