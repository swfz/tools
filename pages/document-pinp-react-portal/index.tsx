import type { NextPage } from 'next';

import { useState, useRef } from 'react';
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

  // eslint-disable-next-line no-var
  var documentPictureInPicture: DocumentPictureInPicture;
}

const DocumentPinpReactPortal: NextPage = () => {
  const pipWindow = useRef<Awaited<ReturnType<DocumentPictureInPicture['requestWindow']>>| null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const clickHandler = () => setCount((prev) => prev + 1);

  const createDocumentPinp = async () => {
    // close
    if (isOpen) {
      if(!pipWindow.current) return;
      pipWindow.current.close();
      setIsOpen((prev) => !prev);
    }
    // open
    else {
      pipWindow.current = await documentPictureInPicture.requestWindow({
        width: contentRef.current?.clientWidth,
        height: contentRef.current?.clientHeight,
      });

      if(!pipWindow.current) return;
      pipWindow.current.addEventListener('pagehide', (event: any) => {
        if(!pipWindow.current) return;
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

  return (
    <>
      {pipWindow.current && isOpen ? (
        createPortal(
          <div id="container">
            <div id="dpip" ref={contentRef}>
              <p>this is content!!!</p>
              <p>clicked {count}</p>
              <button onClick={clickHandler} className="border rounded">
                click!!!
              </button>
            </div>
          </div>,
          pipWindow.current.document.body,
        )
      ) : (
        <div id="container">
          <div id="dpip" ref={contentRef}>
            <p>this is content!!!</p>
            <p>clicked {count}</p>
            <button onClick={clickHandler} className="border rounded">
              click!!!
            </button>
          </div>
        </div>
      )}

      <button onClick={createDocumentPinp} className="border rounded">
        Document PinP
      </button>
    </>
  );
};

export default DocumentPinpReactPortal;
