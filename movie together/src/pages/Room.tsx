import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';

export default function Room() {
  const { token } = useParams<{ token: string }>();
  const { joinRoom, leaveRoom } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      joinRoom(token);
    } else {
      navigate('/');
    }

    return () => {
      leaveRoom();
    };
  }, [token, joinRoom, leaveRoom, navigate]);

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Invite link copied!');
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 md:p-6 gap-6 overflow-hidden">
      {/* Top Navbar */}
      <div className="flex justify-between items-center glass-panel px-6 py-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <span className="font-bold text-white tracking-widest text-sm">MT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Room Code: <span className="text-primary font-mono">{token}</span>
            </h1>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Sync Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl">
            <Users size={18} />
            <span className="text-sm font-medium">Participants</span>
          </button>
          <button 
            onClick={copyInvite}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm shadow-primary/20"
          >
            <Share2 size={16} />
            Invite Partner
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        <div className="flex-grow min-w-0 h-full flex items-center justify-center">
          <VideoPlayer />
        </div>
        <div className="h-full">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
