import { useState, useRef } from 'react';
import ReactPlayerOriginal from 'react-player';
import { useStore } from '../store/useStore';
import { Link, Play, Globe, X } from 'lucide-react';

const ReactPlayer = ReactPlayerOriginal as any;

const DEFAULT_SITES = [
  { name: 'Fmovies', url: 'https://ww4.fmovies.co/home/' },
  { name: 'IMDB', url: 'https://www.imdb.com/?ref_=sr_nv_home' },
  { name: 'Bilibili', url: 'https://www.bilibili.tv/en/' },
  { name: 'Netflix', url: 'https://www.netflix.com/' },
  { name: 'Amazon Prime', url: 'https://www.primevideo.com/' }
];

export default function VideoPlayer() {
  const { videoUrl, isPlaying, currentTime, broadcastVideoState } = useStore();
  const [inputUrl, setInputUrl] = useState('');
  const [hideWarning, setHideWarning] = useState(false);
  const playerRef = useRef<any>(null);
  
  const handlePlayPause = (playState: boolean) => {
    broadcastVideoState(videoUrl, playState, playerRef.current?.getCurrentTime() || 0);
  };

  const handleSeek = (time: number) => {
    broadcastVideoState(videoUrl, isPlaying, time);
  };

  const loadVideo = (url: string) => {
    if (url.trim()) {
      broadcastVideoState(url.trim(), true, 0);
      setInputUrl('');
      setHideWarning(false); // Reset warning visibility when changing URLs
    }
  };

  // ReactPlayer supports YouTube, Vimeo, Twitch, SoundCloud, Streamable, Wistia, DailyMotion, Facebook, and direct media files like .mp4, .webm
  // We check if it can play natively for sync. If not, we render it as an iframe.
  const isPlayableVideo = videoUrl ? (
    ReactPlayer.canPlay(videoUrl) || 
    !!videoUrl.match(/(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|facebook\.com|.*\.(mp4|webm|ogg|mp3|wav|flac|aac|m3u8))/i)
  ) : false;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* URL Input Ribbon & Default Sites */}
      <div className="glass-panel w-full rounded-2xl p-4 flex flex-col gap-3 shadow-lg shrink-0">
        
        {/* Quick Select Default Sites */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-400 mr-2 font-medium">Quick Select:</span>
          {DEFAULT_SITES.map(site => (
            <button
              key={site.name}
              onClick={() => loadVideo(site.url)}
              className={`px-3 py-1.5 rounded-full border border-white/10 transition-colors ${videoUrl === site.url ? 'bg-primary text-white font-bold border-primary' : 'bg-black/30 text-gray-300 hover:bg-white/10'}`}
            >
              {site.name}
            </button>
          ))}
        </div>

        {/* Custom URL Input */}
        <div className="flex gap-3">
          <div className="relative flex-grow">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Paste website or video URL (YouTube, Fmovies, mp4 link...)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <button onClick={() => loadVideo(inputUrl)} className="btn-primary py-2 px-6 rounded-xl shrink-0">
            Embed Display
          </button>
        </div>
      </div>

      {/* Media / Browser Container */}
      <div className="w-full flex-grow relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col items-center justify-center bg-black">
        
        {videoUrl ? (
          <>
            {!isPlayableVideo && !hideWarning && (
              <div className="absolute top-0 w-full bg-red-500/80 text-white text-[10px] text-center py-1.5 z-10 uppercase tracking-widest font-bold backdrop-blur-sm flex justify-center items-center gap-2">
                <Globe size={12} />
                Web Browser Mode
                <span className="text-white/80 lowercase tracking-normal italic ml-2">
                  (Netflix/Amazon block iframes. Try YouTube for perfect sync!)
                </span>
                <button 
                  onClick={() => setHideWarning(true)} 
                  className="absolute right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {isPlayableVideo ? (
              <ReactPlayer 
                ref={playerRef as any}
                url={videoUrl} 
                playing={isPlaying}
                controls={true}
                width="100%"
                height="100%"
                onPlay={() => handlePlayPause(true)}
                onPause={() => handlePlayPause(false)}
                onSeek={handleSeek}
                onProgress={(e: any) => {
                  if (Math.abs(e.playedSeconds - currentTime) > 3) {
                    // Placeholder for future sync drift correction
                  }
                }}
              />
            ) : (
              <iframe 
                src={videoUrl} 
                title="Shared Web View"
                className="w-full h-full border-none pt-6"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                allow="fullscreen"
              />
            )}
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center gap-4 opacity-50">
            <Play size={64} className="text-white/20" />
            <p className="text-center px-4">Waiting for a movie URL...<br/><span className="text-sm">Select a default site above to start browsing together!</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
