import { useEffect, useRef, useState } from "hono/jsx";
import { useAudioAnalyser } from "../../hooks/audio-analyser";

// Canvas描画コンポーネント
function AudioVisualizer({
  analyser,
  frequencyData,
  onDecibelUpdate,
  threshold,
}: {
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array<ArrayBuffer> | null;
  onDecibelUpdate: (db: number) => void;
  threshold: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !frequencyData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    let animationId: number;

    const update = () => {
      analyser.getByteFrequencyData(frequencyData);

      // デシベル計算
      const sum = frequencyData.reduce((a, b) => a + b, 0);
      const average = sum / frequencyData.length;
      const decibels = 10 * Math.log10(average);
      onDecibelUpdate(decibels);

      // キャンバスをクリア
      canvasCtx.fillStyle = "rgb(20, 20, 20)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      // 表示する周波数ビンの数（低周波数帯域を中心に表示）
      const displayBins = Math.min(analyser.frequencyBinCount, 256);
      const barWidth = WIDTH / displayBins;
      let barHeight: number;
      let x = 0;

      // 周波数スペクトルを描画
      for (let i = 0; i < displayBins; i++) {
        const value = frequencyData[i];

        // 閾値以下の値はフィルタリング
        const filteredValue = value >= threshold ? value : 0;
        barHeight = (filteredValue / 255) * HEIGHT;

        // グラデーションカラー
        const hue = (i / displayBins) * 360;

        // 閾値以下は暗く表示
        if (value < threshold) {
          canvasCtx.fillStyle = `hsl(${hue}, 20%, 20%)`;
        } else {
          canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        }

        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth;
      }

      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [analyser, frequencyData, onDecibelUpdate, threshold]);

  return <canvas ref={canvasRef} width={800} height={300} class="w-full border border-gray-300 rounded-lg" />;
}

export default function AudioProvider() {
  const [decibels, setDecibels] = useState(0);
  const [threshold, setThreshold] = useState(30);
  const { analyser, frequencyData, isRecording, startRecording, stopRecording } = useAudioAnalyser();

  return (
    <div class="space-y-4">
      <div class="flex gap-4 justify-center">
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording}
          class="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          録音開始
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          class="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          録音停止
        </button>
      </div>

      <div class="max-w-md mx-auto space-y-2">
        <label class="block">
          <span class="text-lg font-semibold">音声入力閾値: {threshold}</span>
          <input
            type="range"
            min="0"
            max="255"
            value={threshold}
            onInput={(e) => setThreshold(Number((e.target as HTMLInputElement).value))}
            class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </label>
        <p class="text-sm text-gray-600">
          閾値以下の音声入力は無視されます（0-255の範囲で調整）
        </p>
      </div>

      <p class="py-2 text-2xl">Decibels: {decibels.toFixed(2)} dB</p>
      <AudioVisualizer analyser={analyser} frequencyData={frequencyData} onDecibelUpdate={setDecibels} threshold={threshold} />
    </div>
  );
}
