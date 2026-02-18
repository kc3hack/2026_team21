import { useRef, useState } from "hono/jsx";

export function useAudioAnalyser() {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioCtx = new AudioContext();

      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;

      const source = audioCtx.createMediaStreamSource(ms);
      source.connect(analyserNode);

      mediaStreamRef.current = ms;
      audioContextRef.current = audioCtx;

      setAnalyser(analyserNode);
      setFrequencyData(new Uint8Array(analyserNode.frequencyBinCount));
      setIsRecording(true);
    } catch (_e) {
      // biome-ignore lint/suspicious/noConsole: for debugging
      console.error("Failed to get audio input");
    }
  };

  const stopRecording = () => {
    // MediaStreamの全トラックを停止
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => void track.stop());
      mediaStreamRef.current = null;
    }

    // AudioContextをクローズ
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAnalyser(null);
    setFrequencyData(null);
    setIsRecording(false);
  };

  return { analyser, frequencyData, isRecording, startRecording, stopRecording };
}
