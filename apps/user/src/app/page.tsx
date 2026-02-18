"use client";

import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  text: string;
  size: number;
  zIndex: number;
  top: number;
  left: number;
  rotation: number;
};

export default function Home() {
  const { volume, currentText, finalTranscript, start, isListening } =
    useVoiceInput();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (finalTranscript) {
      const { text, volume: inputVolume } = finalTranscript;

      setMessages((prev) => {
        let size = 2 + inputVolume / 15;

        if (inputVolume > 100) size *= 1.5;

        const top = 10 + Math.random() * 80;
        const left = 5 + Math.random() * 90;

        const rotation = Math.random() * 30 - 15;

        const newMessage: Message = {
          id: crypto.randomUUID(),
          text: text,
          size: size,
          zIndex: prev.length + 1,
          top,
          left,
          rotation,
        };
        return [...prev, newMessage];
      });
    }
  }, [finalTranscript]);

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden font-serif select-none">
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <button
            type="button"
            onClick={start}
            className="px-8 py-4 text-2xl font-bold text-black bg-white rounded hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            議論を開始（マイクON）
          </button>
        </div>
      )}

      {/* リアルタイムインジケータ（画面下部固定） */}
      {isListening && (
        <div className="absolute bottom-10 w-full text-center text-gray-500 z-[9999] pointer-events-none">
          <div className="inline-block bg-black/50 px-4 py-2 rounded">
            {/* 音量バーの可視化 */}
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto mb-2 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{ width: `${Math.min(volume, 100)}%` }}
              />
            </div>
            <p className="text-xl min-h-[2rem] text-white font-bold">
              {currentText}
            </p>
          </div>
        </div>
      )}

      {/* メッセージ表示エリア */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="absolute whitespace-nowrap font-black text-white animate-slam"
          style={{
            fontSize: `${msg.size}rem`,
            zIndex: msg.zIndex,
            top: `${msg.top}%`,
            left: `${msg.left}%`,
            // 中央基準で配置して回転させる
            transform: `translate(-50%, -50%) rotate(${msg.rotation}deg)`,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {msg.text}
        </div>
      ))}

      <style jsx global>{`
        @keyframes slam {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.5) rotate(0deg);
            filter: blur(10px);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.0) rotate(var(--tw-rotate));
            filter: blur(0);
          }
          100% {
            opacity: 1;
          }
        }
        .animate-slam {
          animation: slam 0.3s cubic-bezier(0.1, 0.9, 0.2, 1.0) forwards;
        }
      `}</style>
    </main>
  );
}
