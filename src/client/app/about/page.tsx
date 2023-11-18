'use client';
import Image from 'next/image'

export default function Home() {

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-3xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
        <span className="w-3/6 mx-auto flex justify-center items-center box-decoration-slice bg-gradient-to-r from-purple-700 to-sky-300 text-white text-4xl font-bold rounded-lg">About Us</span>
        <br/>
          {/* <div className='w-3/6 mx-auto'>
            <img className='flex justify-center items-center' src="213090.jpg" alt="kami">
            </img>
            <br/>
            <p className='text-xl mb-3'>
            Daniel Mulia Putra M.
            13522043
            Dhafin Fawwaz Ikramullah
            13522084
            ra
            </p>
          </div> */}
          <div className='w-4/5 mx-auto mb-7'>
            <div className='border-2 border-slate-500 rounded-lg mb-3'>
              <div className="grid grid-cols-3 gap-7 my-2">
                <img className='float:left rounded-full' src="daniel.jpg"></img>
                <p className='col-span-2 text-2xl'>Daniel Mulia Putra M.<br/>13522042</p>
              </div>
            </div>
            <div className="border-2 border-slate-500 rounded-lg mb-3">
              <div className="grid grid-cols-3 gap-7 my-2">
                <img className='float:left rounded-full' src="dhafin.jpg"></img>
                <p className='col-span-2 text-2xl'>Dhafin Fawwaz Ikramullah<br/>13522084</p>
              </div>
            </div>
            <div className='border-2 border-slate-500 rounded-lg mb-5'>
              <div className="grid grid-cols-3 gap-7 my-2">
                <img className='float:left rounded-full' src="althaf.jpg"></img>
                <p className='col-span-2 text-2xl'>Rayendra Althaf T. N.<br/>13522107</p>
              </div>
            </div>
          </div>
          {/* <div className='h-3 bg-gradient-to-r from-sky-200 to-indigo-500 rounded-lg'></div> */}
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
