import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Room from './pages/Room';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background w-full">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/room/:token" element={<Room />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
