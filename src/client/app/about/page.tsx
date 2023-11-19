'use client';
import Image from 'next/image'
import about from '../../json/about.json'

export default function Home() {

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-3xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
          
          {/* ======================== Concept ======================== */}
          <section className='mx-2'>
            <h2 className='font-bold text-slate-950 dark:text-white text-3xl text-center mb-8'>Konsep Image Searching</h2>
            <p className='text-l text-justify text-slate-950 dark:text-white'>{about.description.concept}</p>
          </section>
          <hr className="h-px mt-12 mb-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          
          {/* ======================== How To Use ======================== */}
          <section className='mx-2'>
          <h2 className='font-bold text-slate-950 dark:text-white text-3xl text-center mb-8'>How to Use</h2>
            <div className='grid sm:grid-cols-2 gap-4'>
              {about.howToUse.map((howTo, titleIndex) => 
                <div key={titleIndex} className='bg-gray-800 p-4 rounded-lg'>
                  <h3 className='font-bold text-slate-950 dark:text-white'>{howTo.title}</h3>
                  <ul className='marker:text-purple-500 list-disc'>
                    {howTo.steps.map((step, stepIndex) => 
                      <li key={stepIndex} className='ml-4 text-l text-slate-950 dark:text-white'>
                        <p className='translate-y-0.5'>{step}</p>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </section>
          <hr className="h-px mt-12 mb-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>

          {/* ======================== About ======================== */}
          <section className='mx-2'>
            <h2 className='font-bold text-slate-950 dark:text-white text-3xl text-center mb-8'>Meet the Creators</h2>
            <div className="w-full grid gap-8 sm:grid-cols-3">

                {about.creators.map((creator, index) => 
                  <a href={creator.clickSrc} target='_blank' key={index} className='dark:bg-gray-800 rounded-2xl shadow-2xl hover:scale-105 ease-out-back duration-150 focus:scale-110'>
                    <Image width={512} height={512} className="rounded-t-2xl h-52 object-cover" src={"/"+creator.imageSrc} alt={creator.name}/>
                    <div className='p-4 text-slate-950 dark:text-white'>
                      <div className='font-bold truncate'>{creator.name}</div>
                      <div className='font-semibold'>{creator.nim}</div>
                    </div>
                  </a>
                )}

            </div>
          </section>
          
        </article>
      </div>
    </main>
  )
}
