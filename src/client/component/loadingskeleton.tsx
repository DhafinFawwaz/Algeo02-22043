'use client';

export function LoadingSpinner(): JSX.Element {
  return  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><path strokeDasharray="60" strokeDashoffset="60" strokeOpacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path strokeDasharray="15" strokeDashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg>
}

export function LoadingSkeleton({maxImagePerPage}: any): JSX.Element{

    return <>
    <hr className="h-px mt-8 mb-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
    <div className='flex justify-between'>
      <h2 className='text-lg font-bold'>Result:</h2>
    </div>
    <div className='bg-slate-800 rounded-lg mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 animate-pulse'>
    {
      [...Array(maxImagePerPage)].map((e, i) => {
        return <div key={i} className={`
        w-full h-36 bg-slate-700 rounded-lg
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