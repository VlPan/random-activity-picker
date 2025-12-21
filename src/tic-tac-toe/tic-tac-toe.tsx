import { useState, type MouseEventHandler } from "react";

export function Square({
  value,
  isHighlighted,
  onSquareClick,
}: {
  value: string | null;
  isHighlighted: boolean | null;
  onSquareClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button onClick={onSquareClick} className="square" style={{backgroundColor: isHighlighted ? 'yellow' : ''}}>
      {value}
    </button>
  );
}

export function Board({ xIsNext, squares, onPlay }: any) {
  const rows = [
    {
      id: 0,
      children: [squares[0], squares[1], squares[2]],
    },
    {
      id: 1,
      children: [squares[3], squares[4], squares[5]],
    },
    {
      id: 2,
      children: [squares[6], squares[7], squares[8]],
    },
  ];

  console.log("r", rows);

  function handleSquareClick(i: number) {
    console.log("handleSquareClick", i);
    if (squares[i] || calculateWinner(squares)?.winner) return;
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const {winner, row} = calculateWinner(squares);
  console.log('ROW', row)
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const rowsEl = rows.map((r, index) => {
    return {
      id: index,
      children: r.children.map((rowChild, index) => {
        return (
          <Square
            isHighlighted={row.includes(index + r.id * 3)}
            key={index}
            value={rowChild}
            onSquareClick={() => handleSquareClick(index + r.id * 3)}
          />
        );
      }),
    };
  });

  console.log(rowsEl);

  return (
    <>
      <div className="status">{status}</div>
      {rowsEl.map((row) => (
        <div className="board-row" key={row.id}>
          {row.children.map((el) => el)}
        </div>
      ))}
    </>
  );
}

export function TicTacToe() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [movesSort, setMovesSort] = useState<string>("asc");

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: number[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    console.log(nextHistory);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: any) {
    setCurrentMove(nextMove);
  }

  function handleMovesSort() {
    if (movesSort === "asc") {
      setMovesSort("desc");
    } else if (movesSort === "desc") {
      setMovesSort("asc");
    }
  }

  const moves = history.map((squares, move) => {
    if (move === currentMove) return;
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  let sortedMoves = [...moves];
  if (movesSort === "desc") {
    sortedMoves = [...moves].reverse();
  }

  return (
    <>
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        You are at move {currentMove}
        <hr />
        Order <button onClick={() => handleMovesSort()}>{movesSort}</button>
        <ol>{sortedMoves}</ol>
      </div>
    </>
  );
}

function calculateWinner(squares: number[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], row: [a, b, c] };
    }
  }
  return {winner: null, row: [] as number[]};
}
