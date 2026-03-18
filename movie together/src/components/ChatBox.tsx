import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { useStore } from '../store/useStore';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function ChatBox() {
  const [msgInput, setMsgInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const { messages, broadcastMessage } = useStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgInput.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        content: msgInput.trim(),
        user_name: useStore.getState().userName || `Guest-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString()
      };
      
      broadcastMessage(newMsg);
      setMsgInput('');
    }
  };

  const onEmojiClick = (emojiObj: any) => {
    setMsgInput(prev => prev + emojiObj.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="w-80 h-full glass-panel rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/10 shrink-0">
      <div className="bg-white/5 p-4 border-b border-white/10">
        <h3 className="font-semibold text-white/90">Smart Chat</h3>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center my-auto">Say hi to your partner! 👋</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.user_name === useStore.getState().userName ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-500 ml-1 mb-1">{m.user_name}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${m.user_name === useStore.getState().userName ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-black/40 border-t border-white/10 relative">
        {showEmoji && (
          <div className="absolute bottom-[110%] right-0 z-50 shadow-2xl drop-shadow-2xl">
            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <button 
             type="button" 
             onClick={() => setShowEmoji(!showEmoji)}
             className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Smile size={20} />
          </button>
          <input 
            type="text" 
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            className="flex-grow bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 placeholder-gray-500"
            placeholder="Type a message..."
          />
          <button 
            type="submit" 
            disabled={!msgInput.trim()}
            className="p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:text-gray-600"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
