'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, HelpCircle, Navigation, Fuel, AlertTriangle } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { VOICE_COMMANDS } from '@/lib/voice-commands';
import { NongYingAvatar } from './NongYingAvatar';
import { useRouter } from 'next/navigation';

interface VoiceAssistantProps {
  stations?: { name: string; distance?: number; place_id: string; latitude: number; longitude: number }[];
}

export function VoiceAssistant({ stations = [] }: VoiceAssistantProps) {
  const router = useRouter();
  const { isListening, transcript, listen, stopListening, sayText, isSpeaking } = useSpeech();
  const [showPanel, setShowPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  // Process voice command when transcript is final
  useEffect(() => {
    if (transcript && !isListening && !processing) {
      processCommand(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening, processing]);

  const processCommand = useCallback(async (text: string) => {
    setProcessing(true);

    const nearest = stations[0];

    try {
      // Send to Groq AI via API
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          stationCount: stations.length,
          nearestStation: nearest?.name,
          nearestDistance: nearest?.distance,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'น้องหญิงไม่เข้าใจค่ะ ลองพูดใหม่นะคะ!';
      const action = data.action || 'NONE';

      setLastResponse(reply);
      sayText(reply);

      // Execute action after speaking
      setTimeout(() => {
        executeAction(action, nearest);
        setProcessing(false);
      }, 1500);
    } catch {
      const fallback = 'อุ๊ย เชื่อมต่อไม่ได้ค่ะ ลองใหม่นะคะ!';
      setLastResponse(fallback);
      sayText(fallback);
      setProcessing(false);
    }
  }, [stations, sayText]);

  const executeAction = (action: string, nearest?: { name: string; latitude: number; longitude: number; place_id: string }) => {
    switch (action) {
      case 'FIND_STATION':
      case 'FIND_DIESEL':
      case 'FIND_GASOHOL':
      case 'CHECK_PRICE':
      case 'REPORT':
        router.push('/stations');
        break;
      case 'INCIDENT':
        router.push('/report');
        break;
      case 'NAVIGATE':
        if (nearest) {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${nearest.latitude},${nearest.longitude}&destination_place_id=${nearest.place_id}&travelmode=driving`,
            '_blank'
          );
        } else {
          router.push('/stations');
        }
        break;
      case 'REGISTER_OIL':
        router.push('/register-oil');
        break;
      case 'FIND_OIL':
        router.push('/');
        break;
      case 'HELP':
        setShowHelp(true);
        break;
      // CHAT and NONE — just speak, no navigation
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setShowPanel(true);
      listen();
    }
  };

  return (
    <>
      {/* Floating Voice Button — always visible */}
      <button
        onClick={handleMicClick}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isListening
            ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/40'
            : isSpeaking
            ? 'bg-blue-500 shadow-blue-500/30'
            : 'metal-btn-accent shadow-orange-500/20'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : isSpeaking ? (
          <Volume2 className="w-6 h-6 text-white animate-pulse" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Voice Panel */}
      {showPanel && (
        <div className="fixed bottom-36 right-4 z-50 w-72 metal-panel rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header with Avatar */}
          <div className="flex items-center justify-between p-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <NongYingAvatar size={32} isSpeaking={isSpeaking} isListening={isListening} />
              <div>
                <span className="text-xs font-bold text-chrome">น้องหญิง</span>
                <p className="text-[9px] text-slate-500">AI ผู้ช่วยนักเดินทาง</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowHelp(!showHelp)} className="p-1 text-slate-500 hover:text-blue-400">
                <HelpCircle className="w-4 h-4" />
              </button>
              <button onClick={() => setShowPanel(false)} className="p-1 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="p-3">
            {isListening && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-2">
                <p className="text-xs text-red-400 animate-pulse mb-1">● กำลังฟัง...</p>
                <p className="text-sm text-white">{transcript || 'พูดคำสั่งได้เลยค่ะ...'}</p>
              </div>
            )}

            {processing && !isListening && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-2">
                <div className="flex items-center gap-2">
                  <NongYingAvatar size={24} isSpeaking={true} />
                  <p className="text-xs text-orange-400 animate-pulse">น้องหญิงกำลังคิด...</p>
                </div>
              </div>
            )}

            {isSpeaking && !processing && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2">
                <div className="flex items-start gap-2">
                  <NongYingAvatar size={24} isSpeaking={true} />
                  <p className="text-sm text-white flex-1">{lastResponse}</p>
                </div>
              </div>
            )}

            {!isListening && !isSpeaking && !processing && lastResponse && (
              <div className="bg-slate-800/50 rounded-xl p-3 mb-2">
                <div className="flex items-start gap-2">
                  <NongYingAvatar size={24} />
                  <p className="text-sm text-slate-300 flex-1">{lastResponse}</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <button onClick={() => { processCommand('หาปั๊มน้ำมันใกล้ฉัน'); }}
                className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-orange-400 flex flex-col items-center gap-1">
                <Fuel className="w-4 h-4" />
                หาปั๊ม
              </button>
              <button onClick={() => { processCommand('แจ้งเหตุ'); }}
                className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-red-400 flex flex-col items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                แจ้งเหตุ
              </button>
              <button onClick={() => { processCommand('นำทางไปปั๊มที่ใกล้สุด'); }}
                className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-blue-400 flex flex-col items-center gap-1">
                <Navigation className="w-4 h-4" />
                นำทาง
              </button>
              <button onClick={handleMicClick}
                className={`rounded-lg p-2 text-[11px] flex flex-col items-center gap-1 ${
                  isListening ? 'bg-red-500/20 text-red-400' : 'metal-btn text-slate-400 hover:text-orange-400'
                }`}>
                <Mic className="w-4 h-4" />
                {isListening ? 'หยุด' : 'พูด'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowHelp(false)}>
          <div className="metal-panel rounded-2xl p-5 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <NongYingAvatar size={40} />
                <div>
                  <h2 className="text-base font-bold text-chrome">น้องหญิง</h2>
                  <p className="text-[10px] text-slate-500">AI ผู้ช่วยนักเดินทาง</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-1 text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">กดปุ่มไมค์แล้วพูดอะไรก็ได้ น้องหญิงเข้าใจภาษาธรรมชาติค่ะ! เช่น:</p>

            <div className="space-y-2">
              {VOICE_COMMANDS.map((cmd) => (
                <button
                  key={cmd.action}
                  onClick={() => {
                    setShowHelp(false);
                    processCommand(cmd.example);
                  }}
                  className="w-full metal-panel rounded-xl p-3 text-left hover:border-orange-500/20 transition-all"
                >
                  <p className="text-sm text-chrome font-medium">&ldquo;{cmd.example}&rdquo;</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{cmd.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs text-blue-400 font-medium">💡 เคล็ดลับจากน้องหญิง</p>
              <p className="text-[10px] text-blue-300/60 mt-1">
                พี่พูดเป็นภาษาธรรมชาติได้เลยค่ะ ไม่ต้องจำคำสั่ง แค่บอกสิ่งที่ต้องการ น้องหญิงเข้าใจเองจ้า!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
