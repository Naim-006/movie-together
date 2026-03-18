import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RoomState {
  roomToken: string | null;
  roomId: string | null;
  userName: string;
  deviceId: string;
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  messages: any[];
  reactions: any[];
  channel: RealtimeChannel | null;

  setRoomToken: (token: string) => void;
  setUserName: (name: string) => void;
  setVideoStateLocal: (url: string | null, isPlaying: boolean, currentTime: number) => void;
  broadcastVideoState: (url: string | null, isPlaying: boolean, currentTime: number) => void;
  
  addMessageLocal: (msg: any) => void;
  broadcastMessage: (msg: any) => void;
  
  addReactionLocal: (reaction: any) => void;
  broadcastReaction: (reaction: any) => void;

  joinRoom: (token: string) => void;
  leaveRoom: () => void;
}

export const useStore = create<RoomState>()(
  persist(
    (set, get) => ({
      roomToken: null,
      roomId: null,
      userName: '',
      deviceId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      videoUrl: null,
      isPlaying: false,
      currentTime: 0,
      messages: [],
      reactions: [],
      channel: null,

      setRoomToken: (token) => set({ roomToken: token }),
      setUserName: (name) => set({ userName: name }),

  setVideoStateLocal: (url, isPlaying, currentTime) => 
    set({ videoUrl: url, isPlaying, currentTime }),

  broadcastVideoState: (url, isPlaying, currentTime) => {
    const state = get();
    state.setVideoStateLocal(url, isPlaying, currentTime);
    if (state.channel) {
      state.channel.send({
        type: 'broadcast',
        event: 'video-state',
        payload: { url, isPlaying, currentTime }
      });
    }
  },

  addMessageLocal: (msg) => set((state) => {
    // Prevent duplicate messages from showing up twice (fixes the React Strict Mode / Supabase broadcast reflection bug)
    if (state.messages.some(m => m.id === msg.id)) {
      return state;
    }
    return { messages: [...state.messages, msg] };
  }),

  broadcastMessage: async (msg) => {
    const state = get();
    // 1. Optimistic local update
    state.addMessageLocal(msg);
    
    // 2. Broadcast to active peers for instant display
    if (state.channel) {
      state.channel.send({
        type: 'broadcast',
        event: 'chat-msg',
        payload: msg
      });
    }

    // 3. Persist to Supabase Database
    if (state.roomId) {
      await supabase.from('messages').insert([{
        room_id: state.roomId,
        user_name: msg.user_name,
        device_id: state.deviceId, // We can store this or just rely on username
        content: msg.content,
        created_at: msg.created_at
      }]);
    }
  },

  addReactionLocal: (reaction) => set((state) => ({ reactions: [...state.reactions, reaction] })),

  broadcastReaction: (reaction) => {
    const state = get();
    state.addReactionLocal(reaction);
    if (state.channel) {
      state.channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: reaction
      });
    }
  },

  joinRoom: async (token) => {
    const state = get();
    const currentChannel = state.channel;
    if (currentChannel) {
      supabase.removeChannel(currentChannel);
    }

    if (state.roomToken !== token) {
      set({
        roomToken: token,
        roomId: null,
        messages: [],
        reactions: [],
        videoUrl: null,
        isPlaying: false,
        currentTime: 0
      });
    }

    // Connect to Supabase DB to get/create room and fetch history
    let dbRoomId = null;
    const { data: rooms } = await supabase.from('rooms').select('*').eq('token', token).single();
    if (rooms) {
      dbRoomId = rooms.id;
      set({ videoUrl: rooms.video_url, isPlaying: rooms.is_playing, currentTime: rooms.current_time || rooms.playback_time || 0 });
      // Fetch chat history
      const { data: chatHistory } = await supabase.from('messages').select('*').eq('room_id', dbRoomId).order('created_at', { ascending: true });
      if (chatHistory) {
        set({ messages: chatHistory });
      }
    } else {
      // Create room in DB
      const { data: newRoom } = await supabase.from('rooms').insert([{ token }]).select().single();
      if (newRoom) dbRoomId = newRoom.id;
    }

    set({ roomId: dbRoomId });

    const channel = supabase.channel(`room:${token}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'video-state' }, (msg) => {
        set({
          videoUrl: msg.payload.url,
          isPlaying: msg.payload.isPlaying,
          currentTime: msg.payload.currentTime
        });
      })
      .on('broadcast', { event: 'chat-msg' }, (msg) => {
        get().addMessageLocal(msg.payload);
      })
      .on('broadcast', { event: 'reaction' }, (msg) => {
        get().addReactionLocal(msg.payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully joined room ${token}`);
          // Send request for current state to existing members
          channel.send({
            type: 'broadcast',
            event: 'request-state',
            payload: {}
          });
        }
      });

    // Handle incoming state requests from new members
    channel.on('broadcast', { event: 'request-state' }, () => {
        const s = get();
        // If we are currently watching a video, send our state to the newcomer
        if (s.videoUrl) {
            channel.send({
                type: 'broadcast',
                event: 'video-state',
                payload: { url: s.videoUrl, isPlaying: s.isPlaying, currentTime: s.currentTime }
            });
        }
    });

    set({ channel });
  },

  leaveRoom: () => {
    const channel = get().channel;
    if (channel) {
      supabase.removeChannel(channel);
    }
    set({
      roomToken: null,
      channel: null,
      messages: [],
      reactions: [],
      videoUrl: null,
      isPlaying: false,
      currentTime: 0
    });
  }
}),
{
  name: 'movie-together-storage',
  partialize: (state) => ({ 
    roomToken: state.roomToken, 
    userName: state.userName,
    deviceId: state.deviceId,
    videoUrl: state.videoUrl // Remember last video loaded
  }),
}));
