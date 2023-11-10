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
      <body className={`${leagueSpartan.className} bg-white dark:bg-gray-900`}>
          <header className="p-4 not-format flex justify-between bg-slate-200 dark:bg-gray-900">
            <div className='flex gap-5'>
              <img className='sm:h-10 sm:w-10 h-7 w-7 sm:translate-y-0 translate-y-1' width={70} alt="" src={"https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:good:444,e_sharpen:60/MSNBC/Components/Video/201609/a_ov_Pepe_160928.jpg"}></img>
              <div className='font-extrabold sm:text-2xl text-1xl sm:translate-y-1 translate-y-2'>
                OCULAR
              </div>
            </div>
            <div className='gap-2 flex'>
              <Link href="/" className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>Search</Link>
              <Link href="/uploaddataset" className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>Upload Dataset</Link>
              <Link href="/about" className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>About</Link>
              <Link target='_blank' href="https://github.com/DhafinFawwaz/Algeo02-22043" className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>
              {/* <svg className="hover:scale-125 duration-150" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg> */}
              Github
                
                </Link>
            </div>
          </header>
          <div>
            {children}
          </div>
      </body>
    </html>
  )
}
