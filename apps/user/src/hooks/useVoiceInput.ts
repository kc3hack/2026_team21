import { useCallback, useRef, useState } from "react";

// Web Speech APIの型定義
interface IWindow extends Window {
  // biome-ignore lint/suspicious/noExplicitAny: Web Speech API types
  webkitSpeechRecognition: any;
  // biome-ignore lint/suspicious/noExplicitAny: Web Speech API types
  SpeechRecognition: any;
}

export const useVoiceInput = () => {
  const [text, setText] = useState<string>("");
  const [volume, setVolume] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState<{
    text: string;
    volume: number;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Web Speech API types
  const recognitionRef = useRef<any>(null);
  const maxVolumeRef = useRef<number>(0); // 一番デカかった瞬間の音量を保持

  const startAudioAnalysis = async () => {
    try {
      // マイクの使用許可
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // biome-ignore lint/suspicious/noExplicitAny: Vendor prefix handling
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512; // 解像度
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      // 分析データを格納する配列
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      // ループ処理開始
      updateVolume();
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: Error logging allowed
      console.error("マイクエラー:", err);
    }
  };

  const updateVolume = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    // 分析機から現在のデータを配列にコピー
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between DOM and TS lib
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

    let sum = 0;
    // 平均値の計算ロジック
    const speechRange = Math.floor(dataArrayRef.current.length / 2);
    for (let i = 0; i < speechRange; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / speechRange;

    // ノイズゲートを定義。30以下は0とみなす
    // 叫び声を強調するためリニアで調整
    const noiseFloor = 30;
    const rawVolume = Math.max(0, average - noiseFloor);
    const normalizedVolume = Math.min(rawVolume * 1.5, 150); // 最大150

    setVolume(normalizedVolume);

    // 最大音量の更新
    if (normalizedVolume > maxVolumeRef.current) {
      maxVolumeRef.current = normalizedVolume;
    }

    // 無限ループ
    requestAnimationFrame(updateVolume);
  };

  const startSpeechRecognition = useCallback(() => {
    const { webkitSpeechRecognition, SpeechRecognition } =
      window as unknown as IWindow;
    // Web Speech API呼び出し
    const Recognition = SpeechRecognition || webkitSpeechRecognition;

    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      maxVolumeRef.current = 0; // 最大音量の値を0に戻す
    };

    // なんか聞こえたら開始
    // biome-ignore lint/suspicious/noExplicitAny: Event type
    recognition.onresult = (event: any) => {
      const results = event.results;
      const latestResult = results[results.length - 1];
      const transcript = latestResult[0].transcript;

      if (latestResult.isFinal) {
        // 文節確定時の処理
        setFinalTranscript({ text: transcript, volume: maxVolumeRef.current });
        setText("");
        maxVolumeRef.current = 0;
      } else {
        setText(transcript);
      }
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const start = () => {
    void startAudioAnalysis();
    startSpeechRecognition();
  };

  return {
    volume,
    currentText: text,
    finalTranscript,
    start,
    isListening,
  };
};
