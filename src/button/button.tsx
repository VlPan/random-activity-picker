import type {MouseEventHandler} from 'react';

export function MyButton({ count, onClick }: {count: number, onClick: MouseEventHandler<HTMLButtonElement>}) {
  return (
    <button onClick={onClick}>Clicked {count} times</button>
  )
}