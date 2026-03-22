'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, HelpCircle, Navigation, Fuel, AlertTriangle } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { matchCommand, getVoiceResponse, VOICE_COMMANDS } from '@/lib/voice-commands';
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
  }, [transcript, isListening]);

  const processCommand = useCallback((text: string) => {
    setProcessing(true);
    const cmd = matchCommand(text);

    if (!cmd) {
      const response = 'ไม่เข้าใจคำสั่ง ลองพูดว่า หาปั๊ม, รายงาน, แจ้งเหตุ, หรือ ช่วย';
      setLastResponse(response);
      sayText(response);
      setProcessing(false);
      return;
    }

    const nearest = stations[0];
    const data = {
      count: stations.length,
      nearest: nearest?.name,
      distance: nearest?.distance,
    };

    const response = getVoiceResponse(cmd.action, data);
    setLastResponse(response);
    sayText(response);

    // Execute action after speaking
    setTimeout(() => {
      switch (cmd.action) {
        case 'FIND_STATION':
        case 'FIND_DIESEL':
        case 'FIND_GASOHOL':
        case 'CHECK_PRICE':
          router.push('/stations');
          break;
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
        case 'HELP':
          setShowHelp(true);
          break;
      }
      setProcessing(false);
    }, 1500);
  }, [stations, router, sayText]);

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
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-chrome">สั่งด้วยเสียง</span>
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
                <p className="text-sm text-white">{transcript || 'พูดคำสั่งได้เลย...'}</p>
              </div>
            )}

            {isSpeaking && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2">
                <p className="text-xs text-blue-400 animate-pulse mb-1">🔊 กำลังพูด...</p>
                <p className="text-sm text-white">{lastResponse}</p>
              </div>
            )}

            {!isListening && !isSpeaking && lastResponse && (
              <div className="bg-slate-800/50 rounded-xl p-3 mb-2">
                <p className="text-xs text-slate-500 mb-1">ตอบล่าสุด:</p>
                <p className="text-sm text-slate-300">{lastResponse}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <button onClick={() => { sayText('กำลังค้นหาปั๊มน้ำมันใกล้คุณ'); router.push('/stations'); }}
                className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-orange-400 flex flex-col items-center gap-1">
                <Fuel className="w-4 h-4" />
                หาปั๊ม
              </button>
              <button onClick={() => { sayText('เปิดหน้าแจ้งเหตุ'); router.push('/report'); }}
                className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-red-400 flex flex-col items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                แจ้งเหตุ
              </button>
              <button onClick={() => {
                if (stations[0]) {
                  sayText(`นำทางไป ${stations[0].name}`);
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${stations[0].latitude},${stations[0].longitude}&travelmode=driving`, '_blank');
                } else {
                  sayText('ยังไม่พบปั๊มใกล้เคียง');
                }
              }} className="metal-btn rounded-lg p-2 text-[11px] text-slate-400 hover:text-blue-400 flex flex-col items-center gap-1">
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
              <h2 className="text-base font-bold text-chrome flex items-center gap-2">
                <Mic className="w-5 h-5 text-orange-400" />
                คำสั่งเสียง
              </h2>
              <button onClick={() => setShowHelp(false)} className="p-1 text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">กดปุ่มไมค์แล้วพูดคำสั่งเหล่านี้:</p>

            <div className="space-y-2">
              {VOICE_COMMANDS.map((cmd) => (
                <button
                  key={cmd.action}
                  onClick={() => {
                    setShowHelp(false);
                    sayText(cmd.description);
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
              <p className="text-xs text-blue-400 font-medium">💡 เคล็ดลับ</p>
              <p className="text-[10px] text-blue-300/60 mt-1">
                ใช้ขณะขับรถ — กดปุ่มไมค์ 1 ครั้ง พูดคำสั่ง แอปจะตอบด้วยเสียงและทำงานให้อัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
