import type { Metadata } from 'next'
import { League_Spartan } from 'next/font/google'
import './globals.css'

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
              <button className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>Search</button>
              <button className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>About</button>
              <button className='text-gray-900 bg-whit hover:bg-gray-100 font-bold text-sm px-3.5 py-2 mb-2  dark:text-white dark:hover:bg-gray-800 rounded-lg'>Github</button>
            </div>
          </header>
          <div>
            {children}
          </div>
      </body>
    </html>
  )
}
