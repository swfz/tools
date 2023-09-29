import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, useRef, useCallback, ChangeEvent, SyntheticEvent, StrictMode } from 'react';
import { event } from '@lib/gtag';
import { PlayIcon, StopIcon, PauseIcon, DuplicateIcon } from '@components/icon';

interface formValues {
  hour: number;
  min: number;
  sec: number;
}

const Timer: NextPage = () => {
  const seconds = [...Array(60)].map((_, i) => i);
  const minutes = [...Array(60)].map((_, i) => i);
  const hours = [...Array(24)].map((_, i) => i);

  const [startMs, setStartMs] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [decrement, setDecrement] = useState(0);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [formValue, setFormValue] = useState<formValues>({ hour: 0, min: 0, sec: 0 });
  const [paused, setPaused] = useState(false);

  const createDocumentPinp = async () => {
    const content = document.querySelector('#dpinp');
    // @ts-ignore
    const pipWindow = await documentPictureInPicture.requestWindow({ copyStyleSheets: true });
    pipWindow.document.body.append(content);

    pipWindow.addEventListener('pagehide', (event: any) => {
      console.log('PiP window closed.');
      const container = document.querySelector('#container');
      if (container) {
        const pipContent = event.target.querySelector('#dpinp');
        container.append(pipContent);
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
    setStartMs(Date.now());
    setPaused(false);
    setElapsedMs(0);
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

  const pauseTimer = () => {
    setPaused((paused) => {
      if (paused) {
        setStartMs(Date.now());
      }
      if (!paused) {
        setElapsedMs((elapsed) => elapsed + (Date.now() - startMs));
      }

      return !paused;
    });
  };

  const resetTimer = () => {
    setFormValue({ hour: 0, min: 0, sec: 0 });
    setCount(0);
    setPaused(false);
    setDecrement(0);
    setElapsedMs(0);
    setStartMs(0);
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
    if (count <= 0) {
      return;
    }

    const interval = setTimeout(() => {
      if (!paused) {
        const thisRangeElapsedMs = Date.now() - startMs;

        setDecrement(Date.now() - startMs);

        const count = maxCount - Math.floor((elapsedMs + thisRangeElapsedMs) / 1000);
        setCount(count < 0 ? 0 : count);
      }
      if (count === 0) {
        event({
          action: 'timeup',
          category: 'timer',
          label: 'max_count',
          value: maxCount,
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [count, elapsedMs, decrement, startMs, paused]);

  return (
    <>
      <StrictMode>
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
                    <button
                      className="mx-1 flex flex-col items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100 opacity-25 w-full"
                      onClick={pauseTimer}
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

              <div className="flex flex-row p-1">
                <button
                  className="mx-1 flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={startTimer}
                >
                  <PlayIcon />
                  Start
                </button>
                <button
                  className="mx-1 flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                  onClick={resetTimer}
                >
                  <StopIcon />
                  Reset
                </button>
              </div>
              <div className="p-1">
                <button
                  className="mx-1 flex items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
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
