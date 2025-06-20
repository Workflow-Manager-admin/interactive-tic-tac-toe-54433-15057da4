import React, { useEffect, useState } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // Board is 3x3 array, "X", "O" or null
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameStatus, setGameStatus] = useState("Welcome! X goes first.");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  // API base (assuming local dev, adjust if needed)
  const API_BASE = "http://localhost:3001"; // replace with backend base if different

  // Helper: fetch current game state from backend
  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/state`);
      if (!res.ok) throw new Error("Could not fetch game state.");
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setGameStatus(statusText(data));
      setGameOver(data.game_over);
      setWinner(data.winner);
    } catch (e) {
      setGameStatus("Failed to load game state.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: pretty status text from state structure
  function statusText(data) {
    if (data.game_over) {
      if (data.winner) return `Winner: ${data.winner}!`;
      return "Draw! Game Over.";
    }
    return `Current turn: ${data.current_player}`;
  }

  // Start or restart game
  const startGame = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/start`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start game.");
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setGameStatus(statusText(data));
      setGameOver(data.game_over);
      setWinner(data.winner);
    } catch (e) {
      setGameStatus("Could not start new game.");
    } finally {
      setLoading(false);
    }
  };

  // Make move at (r, c)
  const handleCellClick = async (r, c) => {
    if (loading || gameOver || board[r][c]) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: r, col: c, player: currentPlayer }),
      });
      if (!res.ok) {
        setGameStatus("Invalid move.");
        return;
      }
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setGameStatus(statusText(data));
      setGameOver(data.game_over);
      setWinner(data.winner);
    } catch (e) {
      setGameStatus("Could not make move.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch initial state or start new game
  useEffect(() => {
    fetchState().catch(() => startGame());
    // eslint-disable-next-line
  }, []);

  // UI helper: render a single cell
  function renderCell(r, c) {
    return (
      <button
        key={`cell-${r}-${c}`}
        className="ttt-cell"
        style={{
          color: board[r][c] === "X" ? "var(--primary)" : board[r][c] === "O" ? "var(--accent)" : "inherit",
          cursor: loading || gameOver || board[r][c] ? "not-allowed" : "pointer",
        }}
        onClick={() => handleCellClick(r, c)}
        disabled={loading || gameOver || board[r][c]}
        aria-label={`Cell ${r + 1},${c + 1}`}
      >
        {board[r][c]}
      </button>
    );
  }

  // UI grid
  function renderBoard() {
    return (
      <div className="ttt-board">
        {board.map((row, r) =>
          row.map((_, c) => renderCell(r, c))
        )}
      </div>
    );
  }

  // Modern navbar
  function Navbar() {
    return (
      <nav className="navbar">
        <div className="container" style={{display: "flex", justifyContent:"space-between", alignItems:"center"}}>
          <div className="logo">
            <span className="logo-symbol" style={{color:"var(--primary)"}}>#</span>
            Tic Tac Toe
          </div>
          <a href="https://kavia.ai" target="_blank" rel="noopener noreferrer" style={{color: "var(--primary)", textDecoration: "none", fontWeight: 500, fontSize:"1.1rem"}}>
            by KAVIA
          </a>
        </div>
      </nav>
    );
  }

  // Main render
  return (
    <div className="app" style={{ background: "var(--background)" }}>
      <Navbar />

      <main>
        <div className="ttt-container">
          <div className="ttt-status" data-testid="game-status" style={{ color: winner ? "var(--primary)" : "var(--text-color)" }}>
            {loading ? "Loading..." : gameStatus}
          </div>
          {renderBoard()}
          <div className="ttt-actions">
            <button
              className="btn btn-large"
              style={{
                background: "var(--primary)",
                color: "white",
                marginTop: 24,
                minWidth: 160,
                fontWeight: 600,
                boxShadow: "0 2px 10px rgba(25,118,210,0.08)",
              }}
              onClick={startGame}
              disabled={loading}
            >
              {gameOver ? "Restart Game" : "Restart"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;