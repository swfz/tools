import Link from 'next/link';
import { useState, ReactNode, MouseEvent, useEffect } from 'react';
import { useMedia } from 'react-use';
import { ClockIcon, AdjustmentsIcon, GridIcon, ChevronDoubleIcon } from './icon';
import { PaintbrushIcon } from '@primer/octicons-react';

function Layout({ children }: { children: ReactNode }) {
  const isWide = useMedia('(min-width: 640px)', false);
  const [isOpen, setIsOpen] = useState(isWide);

  useEffect(() => {
    setIsOpen(isWide);
  }, [isWide]);

  const togglOpen = (event: MouseEvent<SVGElement>) => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex">
      <div
        className={
          isOpen
            ? 'sticky top-0 h-screen shrink-0 bg-gray-300 sm:sticky sm:w-64 sm:p-4'
            : 'top-0 h-screen w-0 overflow-x-hidden bg-gray-300 sm:sticky sm:w-10'
        }
      >
        <div className={'flex justify-center font-mono text-sm sm:text-3xl'}>
          <span className={isOpen ? '' : 'hidden'}>
            <Link href="/">swfz tools</Link>
          </span>
          &nbsp;
        </div>
        <ul className="flex flex-col p-2">
          <li className={'inline-block h-8 text-xs hover:text-pink-800 sm:text-base'}>
            <Link href="/timer" passHref>
              <span className="flex cursor-pointer items-center">
                <ClockIcon />
                <span className={isOpen ? '' : 'hidden'}>Picture in Piscture Timer</span>
              </span>
            </Link>
          </li>
          <li className={'inline-block h-8 text-xs hover:text-pink-800 sm:text-base'}>
            <Link href="/timeline" passHref>
              <span className="flex cursor-pointer items-center">
                <AdjustmentsIcon />
                <span className={isOpen ? '' : 'hidden'}>Hourly Timeline Editor</span>
              </span>
            </Link>
          </li>
          <li className={'inline-block h-8 text-xs hover:text-pink-800 sm:text-base'}>
            <Link href="/kusa" passHref>
              <span className="flex cursor-pointer items-center">
                <GridIcon />
                <span className={isOpen ? '' : 'hidden'}>GitHub kusa</span>
              </span>
            </Link>
          </li>
          <li className={'inline-block h-8 text-xs hover:text-pink-800 sm:text-base'}>
            <Link href="/arrow-flow-generator" passHref>
              <span className="flex cursor-pointer items-center">
                <ChevronDoubleIcon />
                <span className={isOpen ? '' : 'hidden'}>Arrow Flow Generator</span>
              </span>
            </Link>
          </li>
          <li className={'inline-block h-8 text-xs hover:text-pink-800 sm:text-base'}>
            <Link href="/ansi-text-display" passHref>
              <span className="flex cursor-pointer items-center">
                <PaintbrushIcon size={24} />
                <span className={isOpen ? '' : 'hidden'}>Ansi Text Display</span>
              </span>
            </Link>
          </li>
        </ul>
        <div className="absolute bottom-0"></div>
      </div>
      <div>
        <div className="sticky top-0 bg-white">
          <svg
            onClick={togglOpen}
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className="sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
