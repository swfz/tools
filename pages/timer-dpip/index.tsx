import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, ChangeEvent, StrictMode, useRef } from 'react';
import { event } from '@/lib/gtag';
import { PlayIcon, StopIcon, PauseIcon, DuplicateIcon } from '@/components/icon';

interface formValues {
  hour: number;
  min: number;
  sec: number;
}

const Timer: NextPage = () => {
  const seconds = [...Array(60)].map((_, i) => i);
  const minutes = [...Array(60)].map((_, i) => i);
  const hours = [...Array(24)].map((_, i) => i);

  const workerRef = useRef<Worker | null>(null);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [formValue, setFormValue] = useState<formValues>({ hour: 0, min: 0, sec: 0 });
  const [paused, setPaused] = useState<Boolean | null>(null);

  const createDocumentPinp = async () => {
    const content = document.querySelector('#dpinp');
    // @ts-ignore
    const pipWindow = await documentPictureInPicture.requestWindow({ copyStyleSheets: true });
    pipWindow.document.body.append(content);

    const pipPauseBtn = pipWindow.document.querySelector('#pause-button');
    const pauseHandler = () => setPaused((prev) => !prev);

    pipPauseBtn.addEventListener('click', pauseHandler);

    pipWindow.addEventListener('pagehide', (event: any) => {
      const container = document.querySelector('#container');

      if (container) {
        const pipContent = event.target.querySelector('#dpinp');
        container.append(pipContent);
      }
      pipPauseBtn.removeEventListener('click', pauseHandler);
    });

    // @ts-ignore
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
        const style = document.createElement('style');

        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        link.media = styleSheet.media;
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
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
    setMaxCount(count);
    workerRef.current?.postMessage({ command: 'start', payload: { count, interval: 1000 } });

    event({
      action: 'start',
      category: 'timer',
      label: 'count',
      value: count,
    });
  };

  const pauseTimer = () => setPaused((prev) => !prev);

  const resetTimer = () => {
    workerRef.current?.postMessage({ command: 'reset' });

    setFormValue({ hour: 0, min: 0, sec: 0 });
    setCount(0);
    setPaused(false);
    event({
      action: 'reset',
      category: 'timer',
      label: 'count',
      value: count,
    });
  };

  const formatTime = (count: number) => {
    const hour = Math.floor(count / 60 / 60);
    const min = Math.floor(count / 60) - hour * 60;
    const sec = count % 60;

    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker('/timer-worker.js');
    }

    const worker = workerRef.current;

    worker.onmessage = (event) => {
      const c = event.data.count <= 0 ? 0 : event.data.count;

      setCount(c);
    };

    return () => {
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      const worker = workerRef.current;
      worker.postMessage({ command: !paused ? 'resume' : 'pause' });
    }
  }, [paused]);

  return (
    <>
      <StrictMode>
        <Head>
          <title>Document Picture in Picture Timer</title>
        </Head>
        <div className="divide-y divide-gray-300">
          <div>
            <h1 className="text-3xl">Document Picture in Picture Timer</h1>
          </div>
          <div className="p-3">
            <div>
              <div>Document Picture in Pictureで表示できるタイマー</div>
              <div>時間、分、秒を指定してタイマーを発動する</div>
              <div>時間になると背景色が変わります</div>
            </div>
            <div className="divide-y divide-gray-300 p-2">
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

              <div id="container">
                <div className="flex flex-row p-1" id="dpinp">
                  <div
                    className={`bg-gray-100 flex flex-col w-full items-center ${
                      count <= 0 ? 'bg-pink-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className="py-5 text-stale-900 text-4xl">{formatTime(count)}</div>
                    <meter min={0} max={maxCount} value={count} className="w-full px-5 mb-3"></meter>
                    <div className="flex flex-col mb-2">
                      <button
                        id="pause-button"
                        className="hidden shrink items-center rounded px-2 font-semibold text-gray-800 shadow opacity-25 w-full"
                      >
                        {paused ? (
                          <>
                            <PlayIcon />
                          </>
                        ) : (
                          <>
                            <PauseIcon />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row p-1">
                <button
                  className="mx-1 w-full flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={startTimer}
                >
                  <PlayIcon />
                  Start
                </button>
                <button
                  className="mx-1 w-full flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={pauseTimer}
                >
                  {paused ? (
                    <>
                      <PlayIcon />
                      Replay
                    </>
                  ) : (
                    <>
                      <PauseIcon />
                      Pause
                    </>
                  )}
                </button>
                <button
                  className="mx-1 w-full flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={resetTimer}
                >
                  <StopIcon />
                  Reset
                </button>
              </div>
              <div className="p-1">
                <button
                  className="mx-1 w-full flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={createDocumentPinp}
                >
                  <DuplicateIcon />
                  Picture in Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </StrictMode>
    </>
  );
};

export default Timer;
