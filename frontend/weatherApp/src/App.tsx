import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/home'
import Users from './components/users'
import Login from './components/users/login'
import UserPage from './components/users/userPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/users' element={<Users/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/user' element={<UserPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
