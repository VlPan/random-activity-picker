import { useState } from "react";
import { MyButton } from "../button/button";
import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);

  const products = [
    { title: "Cabbage", isFruit: false, id: 1 },
    { title: "Garlic", isFruit: false, id: 2 },
    { title: "Apple", isFruit: true, id: 3 },
  ];

  const listItems = products.map((p) => (
    <li
      key={p.id}
      style={{
        color: p.isFruit ? "magenta" : "default",
      }}
    >
      {p.title}
    </li>
  ));

  function handleIncrease() {
    setCount(count + 1);
  }

  function handleDecrease() {
    setCount(count - 1);
  }

  function handleReseat() {
    setCount(0);
  }

  return (
    <>
      <h1>App component with outlet</h1>
      {count}
      <ul>{listItems}</ul>
      <button onClick={handleIncrease}>increase</button>
      <button onClick={handleDecrease}>decrease</button>
      <button onClick={handleReseat}>reset</button>
      <MyButton count={count} onClick={handleIncrease}></MyButton>
      <MyButton count={count} onClick={handleIncrease}></MyButton>
      <MyButton count={count} onClick={handleIncrease}></MyButton>
      <Outlet></Outlet>
    </>
  );
}

export default App;
