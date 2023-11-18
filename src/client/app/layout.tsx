import type { Metadata } from 'next'
import { League_Spartan } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const leagueSpartan = League_Spartan({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Ocular',
  description: 'Epic Image Searching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <html lang="en" className='dark'>
      <body className={`${leagueSpartan.className} bg-slate-200 dark:bg-gray-900 `}>
          <header className="p-2 not-format flex justify-between bg-slate-100 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className='flex gap-3'>
              <img className='sm:h-10 sm:w-10 h-7 w-7 sm:translate-y-0 translate-y-1.5' width={70} alt="" src={"/icon.png"}></img>
              <div className='text-slate-950 dark:text-white font-extrabold sm:text-2xl text-1xl sm:translate-y-1.5 translate-y-3'>
                OCULAR
              </div>
            </div>
            <div className='gap-2 flex'>

              {/* Search */}
              <Link href="/" className='p-2 text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm dark:text-white dark:hover:bg-gray-700 rounded-lg group'>

                <svg className="group-hover:scale-125 ease-out-back duration-150" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M0 0h24v24H0z"/><path fill="currentColor" d="M10.5 2a8.5 8.5 0 0 1 6.676 13.762l3.652 3.652a1 1 0 0 1-1.414 1.414l-3.652-3.652A8.5 8.5 0 1 1 10.5 2Zm0 2a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13Zm0 1a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11Z"/></g></svg>

              </Link>

              {/* Upload */}
              <Link href="/uploaddataset" className='p-2 text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm dark:text-white dark:hover:bg-gray-700 rounded-lg group'>
                
                <svg className="group-hover:scale-125 ease-out-back duration-150" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16v-6H5l7-7l7 7h-4v6H9m-4 4v-2h14v2H5Z"/></svg>
              
              </Link>

              {/* About */}
              <Link href="/about" className='p-2 text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm  dark:text-white dark:hover:bg-gray-700 rounded-lg group'>

                <svg className="group-hover:scale-125 ease-out-back duration-150" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2v6Z"/></svg>

              </Link>

              {/* Github */}
              <Link target='_blank' href="https://github.com/DhafinFawwaz/Algeo02-22043" className='p-2 text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm  dark:text-white dark:hover:bg-gray-700 rounded-lg group'>
                
                <svg className="group-hover:scale-125 ease-out-back duration-150" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
                
                </Link>
            </div>
          </header>
          <br />
          <div>
            {children}
          </div>
      </body>
    </html>
  )
}
