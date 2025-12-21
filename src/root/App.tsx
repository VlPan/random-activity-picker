import './App.css'
import {Outlet} from 'react-router-dom'

function App() {

  return (
    <>
    <h1>App component with outlet</h1>
      <Outlet></Outlet>
    </>
  )
}

export default App
