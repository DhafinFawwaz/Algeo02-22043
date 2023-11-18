'use client';
import Image from 'next/image'

export default function Home() {

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-3xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
          <span className="w-3/6 mx-auto flex justify-center items-center box-decoration-slice bg-gradient-to-r from-purple-700 to-sky-300 text-white text-4xl font-bold rounded-lg">About Us</span>
          <div className="w-full mx-auto my-12 px-4 md:px-12">
            <div className="flex flex-wrap -mx-5 lg:-mx-4">
              <div className=" rounded-lg my-1 px-1 w-1/3 md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
                  <article className="overflow-hidden rounded-lg shadow-lg">
                      <a href="#">
                          <img className="block h-auto w-full" src="daniel.jpg"></img>
                      </a>
                      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
                          <h1 className="text-lg">
                              <a className="no-underline hover:underline text-white" href="#">
                                  Daniel Mulia Putra M.
                              </a>
                          </h1>
                          <p className="text-white text-sm">
                            13522043
                          </p>
                      </header>
                  </article>
              </div>
              <div className="my-1 px-1 w-1/3 md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
                  <article className="overflow-hidden rounded-lg shadow-lg">
                      <a href="#">
                          <img className="block h-auto w-full" src="dhafin.jpg"></img>
                      </a>
                      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
                          <h1 className="text-lg">
                              <a className="no-underline hover:underline text-white" href="#">
                                  Dhafin Fawwaz Ikramullah
                              </a>
                          </h1>
                          <p className="text-white text-sm">
                            13522084
                          </p>
                      </header>
                  </article>
              </div>
              <div className="my-1 px-1 w-1/3 md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
                  <article className="overflow-hidden rounded-lg shadow-lg">
                      <a href="#">
                          <img className="block h-auto w-full" src="althaf.jpg"></img>
                      </a>
                      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
                          <h1 className="text-lg">
                              <a className="no-underline hover:underline text-white" href="#">
                                  Rayendra Althaf Taraka N.
                              </a>
                          </h1>
                          <p className="text-white text-sm">
                            13522107
                          </p>
                      </header>
                  </article>
              </div>
            </div>
          </div>
          <h1 className='w-4/6 mx-auto flex justify-center items-center box-decoration-slice bg-gradient-to-r from-purple-700 to-sky-300 text-white text-4xl font-bold rounded-lg mb-4'>Konsep Image<br/>Searching</h1>
          <p className='text-l mb-3'>
              Pada web ini, digunakan konsep Content-Based Image Retrieval (CBIR). Dengan dasar konsep ini kami mengolah sebuah
              citra sehingga didapatkan citra-citra yang memiliki kemiripan dengan
              citra awal. Untuk parameter yang digunakan ada 2 pilihan, yakni warna dan tekstur. Untuk parameter
              warna, gambar akan diubah menjadi ke bentuk HSV lalu dihitung color histogramnya.
              Sedangkan untuk parameter tekstur, gambar akan diubah ke bentuk grayscale lalu 
              dihitung nilai komponen-komponen teksturnya. Setelah digunakan salah satu dari parameter tersebut, kemiripan 
              gambar akan dikalkulasikan menggunakan cosine similarity.
          </p>
          <br/>
          <h2 className='w-4/6 mx-auto flex justify-center items-center box-decoration-slice bg-gradient-to-r from-purple-700 to-sky-300 text-white text-4xl font-bold rounded-lg mb-4'>How To Use</h2>
          <p className='text-xl'>Pencarian gambar relevan dengan upload gambar</p>
          <ul className="marker:text-sky-400 list-disc pl-3 mb-2">
            <li>Pilih laman searching</li>
            <li>Upload sebuah gambar pada kolom yang disediakan</li>
            <li>Pilih parameter pencarian</li>
            <li>Tekan tombol search image</li>
          </ul>
          <p className='text-xl'>Pencarian gambar relevan dengan kamera</p>
          <ul className="marker:text-sky-400 list-disc pl-3 mb-2">
            <li>Pilih laman searching</li>
            <li>Nyalakan toggle "Auto Capture"</li>
          </ul>
          <p className='text-xl'>Upload dataset</p>
          <ul className="marker:text-sky-400 list-disc pl-3 mb-2">
            <li>Pilih laman upload</li>
            <li>Upload satu atau lebih gambar pada kolom yang disediakan</li>
            <li>Pilih opsi upload</li>
            <li>Tekan tombol "Upload Dataset"</li>
          </ul>
          <p className='text-xl'>Web Scrapping</p>
          <ul className="marker:text-sky-400 list-disc pl-3 mb-2">
            <li>Pilih laman upload</li>
            <li>Masukkan alamat web pada kolom yang disediakan</li>
            <li>Tekan tombol "Start Scrapping"</li>
          </ul>
        </article>
      </div>
    </main>
  )
}
