import { useState } from "react";

export const Testing = () => {
  const [counter, setCounter] = useState(0);

  console.log("testing called!");

  const handleOnClick = () => {
    setCounter(counter + 1);
  };

  return (
    <>
      <Profile />

      <button onClick={handleOnClick}>+1</button>
    </>
  );
};

export function Profile() {
  console.log("profile called!");
  return (
    <>
      <img src="https://i.imgur.com/MK3eW3Am.jpg" alt="Katherine Johnson" />
      <Test></Test>
    </>
  );
}

export function Test() {
  console.log('test called')
  return <h1>Test Inner component !</h1>;
}
