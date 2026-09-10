
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar'
import SignUp from './Pages/AuthPages/SignUp'
import SignIn from './Pages/AuthPages/SignIn'
import Home from './Pages/GeneralPages/Home'
import SignOut from './Pages/AuthPages/SignOut'
import MosqueSetup from './Pages/Dashboard/Imam/MosqueSetup'
import DashBoard from './Pages/Dashboard/Imam/DashBoard'
import ProtectedRoute from './Components/ProdectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/signOut" element={<SignOut />} />

      {/* Protected Routes */}
      <Route path="/mosqueSetup" element={
          <ProtectedRoute>
              <MosqueSetup />
          </ProtectedRoute>
      } />
      <Route path="/dashBoard" element={
          <ProtectedRoute>
              <DashBoard />
          </ProtectedRoute>
      } />
            </Routes>

    </BrowserRouter>
  )
}

export default App