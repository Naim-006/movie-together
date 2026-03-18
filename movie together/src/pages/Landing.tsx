import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, UserPlus, PlayCircle, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Landing() {
  const [token, setToken] = useState('');
  const [localName, setLocalName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const storedRoomToken = useStore((state) => state.roomToken);
  const storedUserName = useStore((state) => state.userName);
  const setUserName = useStore((state) => state.setUserName);

  const handleCreateRoom = async () => {
    if (!localName.trim() && !storedUserName) {
      alert("Please enter a username first!");
      return;
    }
    setUserName(localName.trim() || storedUserName);
    setLoading(true);
    const newToken = Math.random().toString(36).substring(2, 10);
    // TODO: Insert into Supabase when connected
    /*
    const { error } = await supabase.from('rooms').insert([{ token: newToken }]);
    if (error) console.error(error);
    */
    navigate(`/room/${newToken}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim() && !storedUserName) {
      alert("Please enter a username first!");
      return;
    }
    if (token.trim()) {
      setUserName(localName.trim() || storedUserName);
      navigate(`/room/${token.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />

      <div className="glass-panel max-w-md w-full p-8 rounded-3xl z-10 animate-float flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
          <Film size={40} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
          Movie Together
        </h1>
        <p className="text-gray-400 mb-8 mt-2">
          Watch movies in perfect sync, together. No matter the distance.
        </p>

        <div className="w-full space-y-4 mb-6">
          <input 
            type="text" 
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder={storedUserName ? `Continue as ${storedUserName}...` : "Choose a Username..."}
            className="input-field text-center font-bold text-lg"
          />
        </div>

        <div className="w-full space-y-6">
          <button 
            onClick={handleCreateRoom}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} />
            {loading ? 'Creating...' : 'Create a Room'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">Or join existing</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter invite token..." 
                className="input-field pl-12"
              />
            </div>
            <button 
              type="submit"
              disabled={!token.trim()}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </form>

          {storedRoomToken && (
            <div className="mt-8 pt-6 border-t border-white/10 w-full animate-fadeIn">
              <p className="text-gray-400 text-sm mb-3">Recently Visited Room</p>
              <button 
                type="button"
                onClick={() => {
                  if (localName.trim()) setUserName(localName.trim());
                  navigate(`/room/${storedRoomToken}`);
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-primary/30 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  Room: {storedRoomToken}
                </span>
                <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-md">Rejoin</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
