import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, useRef, useCallback, ChangeEvent, SyntheticEvent } from 'react';
import { event } from '../../src/lib/gtag';
import { PlayIcon, StopIcon, DuplicateIcon } from '../../src/components/icon';

interface formValues {
  hour: number;
  min: number;
  sec: number;
}

const Timer: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const seconds = [...Array(60)].map((_, i) => i);
  const minutes = [...Array(60)].map((_, i) => i);
  const hours = [...Array(24)].map((_, i) => i);

  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [formValue, setFormValue] = useState<formValues>({ hour: 0, min: 0, sec: 0 });

  const getContext = (): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;

    return canvas ? canvas.getContext('2d') : null;
  };

  async function createVideo() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (canvas && video) {
      video.srcObject = canvas.captureStream();
      video.play();
    }
  }

  const handleVideoEvent = (e: SyntheticEvent<HTMLVideoElement>) => {
    // TODO: さっと解決できなかったのでキャストしている
    const video = e.target as HTMLVideoElement;
    video.requestPictureInPicture();

    event({
      action: 'pinp',
      category: 'timer',
      label: 'count',
      value: count,
    });
  };

  const handleHourChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormValue((prev) => {
      return { ...prev, hour: parseInt(e.target.value) };
    });
  };
  const handleMinChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormValue((prev) => {
      return { ...prev, min: parseInt(e.target.value) };
    });
  };
  const handleSecChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormValue((prev) => {
      return { ...prev, sec: parseInt(e.target.value) };
    });
  };

  const startTimer = () => {
    const count = formValue.hour * 60 * 60 + formValue.min * 60 + formValue.sec;
    setCount(count);
    setMaxCount(count);
    event({
      action: 'start',
      category: 'timer',
      label: 'count',
      value: count,
    });
  };

  const resetTimer = () => {
    setFormValue({ hour: 0, min: 0, sec: 0 });
    setCount(0);
    event({
      action: 'reset',
      category: 'timer',
      label: 'count',
      value: count,
    });
  };

  const writeToCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, count: number) => {
      const width = 300;
      const height = 100;

      const value = formatTime(count);
      const bgColor = count === 0 ? '#cc1074' : '#EFEFEF';
      const fgColor = count === 0 ? '#000000' : '#666666';
      const guageFgColor1 = '#ff1493';
      const guageFgColor2 = '#cc1074';
      const guageBgColor1 = '#222222';
      const guageBgColor2 = '#000000';

      // 枠
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = fgColor;
      ctx.font = '30px Arial';
      ctx.fillText(value, 90, 45);

      // guage border
      ctx.strokeStyle = '#666666';
      ctx.strokeRect(20, 70, 260, 10);

      // guage background
      const bgGradient = ctx.createLinearGradient(21, 71, 21, 79);
      bgGradient.addColorStop(0, guageBgColor2);
      bgGradient.addColorStop(0.4, guageBgColor1);
      bgGradient.addColorStop(0.6, guageBgColor1);
      bgGradient.addColorStop(1, guageBgColor2);

      ctx.fillStyle = bgGradient;
      ctx.fillRect(21, 71, 258, 8);

      // guage
      const fgGradient = ctx.createLinearGradient(21, 71, 21, 79);
      fgGradient.addColorStop(0, guageFgColor2);
      fgGradient.addColorStop(0.4, guageFgColor1);
      fgGradient.addColorStop(0.6, guageFgColor1);
      fgGradient.addColorStop(1, guageFgColor2);
      const remaining = 258 * (count / maxCount);

      ctx.fillStyle = fgGradient;
      ctx.fillRect(21, 71, remaining, 8);
    },
    [maxCount],
  );

  const formatTime = (count: number) => {
    const hour = Math.floor(count / 60 / 60);
    const min = Math.floor(count / 60) - hour * 60;
    const sec = count % 60;

    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const ctx: CanvasRenderingContext2D | null = getContext();

    if (!ctx) {
      return;
    }
    if (count < 0) {
      return;
    }

    writeToCanvas(ctx, count);

    const interval = setInterval(() => {
      setCount((c) => c - 1);
      if (count === 0) {
        event({
          action: 'timeup',
          category: 'timer',
          label: 'max_count',
          value: maxCount,
        });
      }
      writeToCanvas(ctx, count);
    }, 1000);

    return () => clearInterval(interval);
  }, [count, writeToCanvas]);

  return (
    <>
      <Head>
        <title>Picture in Picture Timer</title>
      </Head>
      <div className="divide-y divide-gray-300">
        <div>
          <h1 className="text-3xl">Picture in Picture Timer</h1>
        </div>
        <div className="p-3">
          <div>
            <div>Picture in Pictureで表示できるタイマー</div>
            <div>時間、分、秒を指定してタイマーを発動する</div>
            <div>時間になると背景色が変わります</div>
          </div>
          <div className="p-2 divide-y divide-gray-300">
            <div id="timer">
              <canvas id="canvas" width="300" height="100" ref={canvasRef}></canvas>
            </div>
            <div className="flex p-1">
              <span className="flex-1">Hour: </span>
              <select className="flex-1 rounded" value={formValue.hour} onChange={handleHourChange}>
                {hours.map((hour) => {
                  return (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex p-1">
              <span className="flex-1">Minute: </span>
              <select className="flex-1 rounded" value={formValue.min} onChange={handleMinChange}>
                {minutes.map((min) => {
                  return (
                    <option key={min} value={min}>
                      {min.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex p-1">
              <span className="flex-1">Second: </span>
              <select className="flex-1 rounded" value={formValue.sec} onChange={handleSecChange}>
                {seconds.map((sec) => {
                  return (
                    <option key={sec} value={sec}>
                      {sec.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-row p-1">
              <button
                className="flex items-center py-2 px-4 mx-1 font-semibold text-gray-800 bg-white hover:bg-gray-100 rounded border border-gray-400 shadow"
                onClick={startTimer}
              >
                <PlayIcon />
                Start Timer
              </button>
              <button
                className="flex items-center py-2 px-4 mx-1 font-semibold text-gray-800 bg-white hover:bg-gray-100 rounded border border-gray-400 shadow"
                onClick={resetTimer}
              >
                <StopIcon />
                Reset Timer
              </button>
            </div>
            <div className="p-1">
              <button
                className="flex items-center py-2 px-4 mx-1 font-semibold text-gray-800 bg-white hover:bg-gray-100 rounded border border-gray-400 shadow"
                onClick={createVideo}
              >
                <DuplicateIcon />
                Picture in Picture
              </button>
            </div>
            <video muted={true} onLoadedMetadata={handleVideoEvent} ref={videoRef} className="hidden"></video>
          </div>
        </div>
      </div>
    </>
  );
};

export default Timer;
