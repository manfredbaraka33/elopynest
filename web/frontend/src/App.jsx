import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import BuddyRequests from "./pages/BuddyRequests";
import Profile from "./pages/Profile";
import LeaderBoard from "./pages/LeaderBoard";


export default function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/register" element={<Register />}/>

      <Route path="/buddy-requests" element={
        <ProtectedRoute>
          <BuddyRequests />
      </ProtectedRoute>}/>

      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderBoard />
      </ProtectedRoute>}/>

      <Route path="/my-profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }/>
      
    </Routes>
  );
}
