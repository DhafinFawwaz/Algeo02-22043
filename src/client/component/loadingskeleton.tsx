'use client';

export function LoadingSkeleton({maxImagePerPage}: any){

    return <>
    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
    <div className='bg-slate-800 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 animate-pulse'>
    {
      [...Array(maxImagePerPage)].map((e, i) => {
        return <div key={i} className={`
        w-full h-32 bg-slate-700 rounded-lg
        `}></div>
      })
    }
    </div>
    
    <div className='flex sm:gap-3 gap-2 justify-center mt-3'>
      {/* left arrow */}
      <button onClick={e => {}} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 grid place-items-center'>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12)"><g id="feArrowUp0" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1"><g id="feArrowUp1" fill="currentColor"><path id="feArrowUp2" d="m4 15l8-8l8 8l-2 2l-6-6l-6 6z"/></g></g></g></svg>
      </button>
      {/* right arrow */}
      <button onClick={e => {}} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 grid place-items-center'>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><g id="feArrowUp0" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1"><g id="feArrowUp1" fill="currentColor"><path id="feArrowUp2" d="m4 15l8-8l8 8l-2 2l-6-6l-6 6z"/></g></g></g></svg>
      </button>
    </div>

  </>
}