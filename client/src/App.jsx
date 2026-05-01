import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import useGetCurrUser from './hooks/useGetCurrUser';
import { useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import WebsiteEditor from './pages/WebsiteEditor';
import LiveSite from './pages/LiveSite';
import Pricing from './pages/Pricing';
export const serverUrl = 'https://genweb-ai-b5js.onrender.com'

const ProtectedRoute = ({ children }) => {
  const { userData, isAuthLoading } = useSelector((state) => state.user);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  return userData ? children : <Navigate to="/" replace />;
};

function App() {
  useGetCurrUser();
  return (
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path='/generate' element={<ProtectedRoute><Generate/></ProtectedRoute>}/>
        <Route path='/editor/:id' element={<ProtectedRoute><WebsiteEditor/></ProtectedRoute>}/>
        <Route path='/site/:slug' element={<LiveSite />} />
        <Route path='/pricing' element={<Pricing />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
