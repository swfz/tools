import Link from 'next/link';
import { useState, ReactNode, MouseEvent } from 'react';
import { useMedia } from 'react-use';
import { ClockIcon, AdjustmentsIcon, GridIcon } from './icon';

function Layout({ children }: { children: ReactNode }) {
  const isWide = useMedia('(min-width: 600px)');
  const [isOpen, setIsOpen] = useState(isWide);

  const togglOpen = (event: MouseEvent<SVGElement>) => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      <div
        className={
          isWide
            ? isOpen
              ? 'sticky top-0 h-screen w-64 shrink-0 bg-gray-300 p-4'
              : 'sticky top-0 h-screen w-10 overflow-x-hidden bg-gray-300'
            : isOpen
            ? 'top-0 h-screen w-32 shrink-0 bg-gray-300 p-0'
            : 'top-0 h-screen w-10 bg-gray-300 p-0'
        }
      >
        <div className={isWide ? 'flex justify-center font-mono text-3xl' : 'text-sm flex justify-center font-mono'}>
          <span className={isOpen ? '' : 'hidden'}>
            <Link href="/">swfz tools</Link>
          </span>
          &nbsp;
        </div>
        <ul className="flex flex-col p-2">
          <li
            className={isWide ? 'inline-block h-8 hover:text-pink-800' : 'inline-block h-8 text-xs hover:text-pink-800'}
          >
            <Link href="/timer" passHref>
              <span className="flex cursor-pointer items-center">
                <ClockIcon />
                <span className={isOpen ? '' : 'hidden'}>Picture in Piscture Timer</span>
              </span>
            </Link>
          </li>
          <li
            className={isWide ? 'inline-block h-8 hover:text-pink-800' : 'inline-block h-8 text-xs hover:text-pink-800'}
          >
            <Link href="/timeline" passHref>
              <span className="flex cursor-pointer items-center">
                <AdjustmentsIcon />
                <span className={isOpen ? '' : 'hidden'}>Hourly Timeline Editor</span>
              </span>
            </Link>
          </li>
          <li
            className={isWide ? 'inline-block h-8 hover:text-pink-800' : 'inline-block h-8 text-xs hover:text-pink-800'}
          >
            <Link href="/kusa" passHref>
              <span className="flex cursor-pointer items-center">
                <GridIcon />
                <span className={isOpen ? '' : 'hidden'}>GitHub kusa</span>
              </span>
            </Link>
          </li>
        </ul>
        <div className="absolute bottom-0"></div>
      </div>
      <div>
        <svg
          onClick={togglOpen}
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <div className={isWide ? 'p-8' : ''}>{children}</div>
    </div>
  );
}

export default Layout;
