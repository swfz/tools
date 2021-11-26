import Link from 'next/link'
import { useState, ReactNode } from 'react'

function Layout({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(true)

  const togglOpen = (event: any) => {setIsOpen(!isOpen)}

  return (
    <div className="flex">
      <div className={isOpen ? "h-screen sticky top-0 bg-gray-300 p-4" : "w-10 overflow-x-hidden h-screen sticky top-0 bg-gray-300"}>
        <div className="flex justify-center text-3xl font-mono">
          <span className={isOpen ? "" : "hidden"}>
            <Link href="/">
              swfz tools
            </Link>
          </span>
          &nbsp;
        </div>
        <ul className="flex flex-col p-2">
          <li className="hover:text-pink-800 h-8 inline-block">
            <Link href="/timer">
              <span className="flex items-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={isOpen ? "" : "hidden"}>Picture in Piscture Timer</span>
              </span>
            </Link>
          </li>
        </ul>
        <div className="absolute bottom-0">
        </div>
      </div>
      <div>
        <svg onClick={togglOpen} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}

export default Layout
