import type { NextPage } from 'next';

import React, { useEffect, useState, useRef } from 'react';
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

const ConditionalPortal: React.FC<ConditionalPortalProps> = ({ children, usePortal, portalContainer }) => {
  if (usePortal && portalContainer) {
    return createPortal(children, portalContainer);
  }
  return <>{children}</>;
};

const DocumentPinpReactPortal: NextPage = () => {
  const pipWindow = useRef<Awaited<ReturnType<DocumentPictureInPicture['requestWindow']>> | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pipSupported, setPipSupported] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const clickHandler = () => setCount((prev) => prev + 1);

  const createDocumentPinp = async () => {
    if (!pipSupported) return;
    // close
    if (isOpen) {
      if (!pipWindow.current) return;
      pipWindow.current.close();
      setIsOpen((prev) => !prev);
    }
    // open
    else {
      pipWindow.current = await documentPictureInPicture.requestWindow({
        width: contentRef.current?.clientWidth,
        height: contentRef.current?.clientHeight,
      });

      if (!pipWindow.current) return;
      pipWindow.current.addEventListener('pagehide', () => {
        if (!pipWindow.current) return;
        pipWindow.current.close();
        setIsOpen(false);
      });

      // tsconfig の target が es5 のため StyleSheetList / CSSRuleList はスプレッドできない
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          const cssRules = Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
          const style = document.createElement('style');

          style.textContent = cssRules;
          if (pipWindow.current !== null) {
            pipWindow.current.document.head.appendChild(style);
          }
        } catch (e) {
          const link = document.createElement('link');

          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText;
          link.href = styleSheet.href ?? '';
          if (pipWindow.current !== null) {
            pipWindow.current.document.head.appendChild(link);
          }
        }
      });
      setIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    setPipSupported(typeof documentPictureInPicture !== 'undefined');
  }, []);

  return (
    <>
      <ConditionalPortal usePortal={isOpen} portalContainer={pipWindow?.current?.document.body}>
        <div id="container">
          <div id="dpip" ref={contentRef}>
            <p>this is content!!!</p>
            <div className="flex flex-row">
              <p>clicked: </p>
              <p aria-label="count">{count}</p>
            </div>
            <button onClick={clickHandler} className="rounded border">
              click!!!
            </button>
          </div>
        </div>
      </ConditionalPortal>

      <button
        onClick={createDocumentPinp}
        className="rounded border"
        disabled={!pipSupported}
        title={pipSupported ? undefined : 'Document Picture in Picture is not supported'}
      >
        Document PinP
      </button>
    </>
  );
};

export default DocumentPinpReactPortal;
