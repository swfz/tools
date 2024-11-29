import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState, ChangeEvent, StrictMode, useRef } from 'react';
import { event } from '@/lib/gtag';
import { PlayIcon, StopIcon, PauseIcon, DuplicateIcon } from '@/components/icon';
import { createPortal } from 'react-dom';

declare global {
  interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
    preferInitialWindowPlacement?: boolean;
  }
  interface DocumentPictureInPicture {
    requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>;
  }

  var documentPictureInPicture: DocumentPictureInPicture;
}

interface ConditionalPortalProps {
  children: React.ReactNode;
  usePortal: boolean;
  portalContainer?: Element | null;
}

interface formValues {
  hour: number;
  min: number;
  sec: number;
}

const ConditionalPortal: React.FC<ConditionalPortalProps> = ({ children, usePortal, portalContainer }) => {
  if (usePortal && portalContainer) {
    return createPortal(children, portalContainer);
  }
  return <>{children}</>;
};

const DocumentPinpTimer: NextPage = () => {
  const workerRef = useRef<Worker | null>(null);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [formValue, setFormValue] = useState<formValues>({ hour: 0, min: 0, sec: 0 });
  const [paused, setPaused] = useState<Boolean | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const pipWindow = useRef<Awaited<ReturnType<DocumentPictureInPicture['requestWindow']>> | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const createDocumentPinp = async () => {
    if (isOpen) {
      if (!pipWindow.current) return;
      pipWindow.current.close();
      setIsOpen((prev) => !prev);
    } else {
      pipWindow.current = await documentPictureInPicture.requestWindow({
        width: contentRef.current?.clientWidth,
        height: contentRef.current?.clientHeight,
      });

      const pauseHandler = () => setPaused((prev) => !prev);

      pipWindow.current.addEventListener('pagehide', (event: any) => {
        if (!pipWindow.current) return;
        pipWindow.current.close();
        setIsOpen(false);
      });

      // @ts-ignore
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');

          style.textContent = cssRules;
          if (pipWindow.current !== null) {
            pipWindow.current.document.head.appendChild(style);
          }
        } catch (e) {
          const link = document.createElement('link');

          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          if (pipWindow.current !== null) {
            pipWindow.current.document.head.appendChild(link);
          }
        }
      });
      setIsOpen((prev) => !prev);
    }
  };

  const handleHourChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((prev) => {
      return { ...prev, hour: parseInt(e.target.value) };
    });
  };
  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((prev) => {
      return { ...prev, min: parseInt(e.target.value) };
    });
  };
  const handleSecChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((prev) => {
      return { ...prev, sec: parseInt(e.target.value) };
    });
  };

  const startTimer = () => {
    const count = formValue.hour * 60 * 60 + formValue.min * 60 + formValue.sec;
    setMaxCount(count);
    setStarted(true);
    setCount(count);
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

    setCount(0);
    setPaused(false);
    setStarted(false);
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

            <ConditionalPortal usePortal={isOpen} portalContainer={pipWindow?.current?.document.body}>
              <div>
                <div className="divide-y divide-gray-300">
                  <div id="container">
                    <div className="flex flex-row p-1" id="dpinp">
                      <div
                        className={`flex w-full flex-col items-center bg-gray-100 ${
                          count <= 0 ? 'bg-pink-600' : 'bg-gray-200'
                        }`}
                      >
                        <div className="py-5 text-4xl text-slate-900">{formatTime(count)}</div>
                        <meter min={0} max={maxCount} value={count} className="mb-5 w-full px-5"></meter>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row p-1">
                    <div className="grow p-1">
                      {!started && (
                        <div>
                          H:
                          <input
                            type="number"
                            className="h-10 w-12 rounded text-sm"
                            min={0}
                            max={23}
                            value={formValue.hour}
                            onChange={handleHourChange}
                          ></input>
                          M:
                          <input
                            type="number"
                            className="h-10 w-12 rounded text-sm"
                            min={0}
                            max={59}
                            value={formValue.min}
                            onChange={handleMinChange}
                          ></input>
                          S:
                          <input
                            type="number"
                            className="h-10 w-12 rounded text-sm"
                            min={0}
                            max={59}
                            value={formValue.sec}
                            onChange={handleSecChange}
                          ></input>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row p-1">
                      {!paused && !started && (
                        <button
                          className="mx-1 flex items-center rounded border border-gray-400 bg-white p-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                          onClick={startTimer}
                        >
                          <PlayIcon />
                        </button>
                      )}
                      {started && (
                        <button
                          className="mx-1 flex items-center rounded border border-gray-400 bg-white p-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
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
                      )}
                      <button
                        className="mx-1 flex items-center rounded border border-gray-400 bg-white p-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
                        onClick={resetTimer}
                      >
                        <StopIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ConditionalPortal>

            <div>
              <div className="p-1">
                <button
                  className="mx-1 flex w-full items-center rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
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

export default DocumentPinpTimer;
