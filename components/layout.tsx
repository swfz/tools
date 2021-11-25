import Link from 'next/link'

function Layout({children}) {
  return (
    <div className="flex">
      <div className="h-screen sticky top-0 bg-gray-300 p-4">
        <div className="flex justify-center text-3xl font-mono">
          <Link href="/">swfz tools</Link>
        </div>
        <ul className="flex flex-col">
          <li className="hover:text-pink-800 h-8">
            <span className="font-bold text-lg">
              <Link href="/timer">Picture in Piscture Timer</Link>
            </span>
          </li>
        </ul>
        <div className="absolute bottom-0">
          @swfz
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}

export default Layout
