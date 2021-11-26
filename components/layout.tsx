import Link from 'next/link'
import { useState, ReactNode } from 'react'

function Layout({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(true)

  const togglOpen = () => {setIsOpen(!isOpen)}

  return (
    <div className="flex">
      <div className="h-screen sticky top-0 bg-gray-300 p-4">
        <div className="flex justify-center text-3xl font-mono">
          <Link href="/">swfz tools</Link>
        </div>
        <ul className="flex flex-col p-2">
          <li className="hover:text-pink-800 h-8 inline-block">
            <a href="/timer" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Picture in Piscture Timer</span>
            </a>
          </li>
        </ul>
        <div className="absolute bottom-0">
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}

export default Layout
