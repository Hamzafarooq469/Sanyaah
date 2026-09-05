import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar'
import SignUp from './Pages/AuthPages/SignUp'
import SignIn from './Pages/AuthPages/SignIn'
import Home from './Pages/GeneralPages/Home'
import SignOut from './Pages/AuthPages/SignOut'
import MosqueSetup from './Pages/Dashboard/Imam/MosqueSetup'
import DashBoard from './Pages/Dashboard/Imam/DashBoard'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Visitor Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/signOut" element={<SignOut />} />

        {/* Authenticated Imam Routes */}
        <Route path="/mosqueSetup" element={<MosqueSetup />} />
        <Route path="/dashBoard" element={<DashBoard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App