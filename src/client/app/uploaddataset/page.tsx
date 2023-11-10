'use client';
import Image from 'next/image'
import { useState } from 'react';
import { ImageImport, ImageResult, SearchResponse } from '../page';

interface ImageImportList{
  imageImport: ImageImport[];
  isPreview: boolean;
}

export default function UploadDataset() {
  const url = "http://127.0.0.1:8000"

  const [imageImportList, setImageImportList] = useState<ImageImportList>({
    imageImport: [],
    isPreview: false,
  });
  const [isHighlightImport, setIsHighlightImport] = useState<boolean>(false);

  function onImageImported(e: any){
    setImageImportList({
      isPreview: true,
      imageImport: [...e.target.files].map((file: File) => {
        return  {
          name: file.name,
          size: file.size,
          data: file,
          src: URL.createObjectURL(file),
          isPreview: true,
        }
      })
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    if(!imageImportList.isPreview){
      console.log("no image");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.delete("images");
    imageImportList.imageImport.forEach((imageImport: ImageImport, index: number) => {
      formData.append(`images`, imageImport.data!);
    });

    const requestOptions: RequestInit = {
      method: "POST",
      body: formData,
    };


    const res = await fetch(url+"/api/upload/dataset", requestOptions)
      .catch(e => console.log(e));
    // wait 1 second
    await new Promise(r => setTimeout(r, 3000));

    if(!res)return;
    if(res.status === 400){
      console.log("bad request");
      return; // bad request
    }

    try{
      const data = await res.json();
      if(!data)return;
    }catch(e){
      console.log(e);
    }

  }

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24 bg-white dark:bg-gray-900">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
          
          <h1 className='font-bold text-3xl text-center mb-8'>Upload Dataset</h1>
          {/* Form */}
          
          <form onSubmit={onSubmit}>
            <div className='sm:grid sm:grid-cols-1 gap-4'>
              <label htmlFor="dropzone-file" className={`
              
              flex flex-col items-center justify-center w-full h-56 rounded-lg cursor-pointer  dark:focus:bg-gray-100 
              hover:bg-gray-100 hover:dark:bg-gray-600

              ${!isHighlightImport ? `bg-gray-50 dark:bg-gray-700` : `bg-gray-100 dark:bg-gray-600`}
              
              ${imageImportList.isPreview ? `` : `border-2 border-gray-300 border-dashed dark:border-gray-600`}
              
              `}
              onDragEnter={e => {
                e.preventDefault();
                e.stopPropagation();
                setIsHighlightImport(true);
              }}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
                setIsHighlightImport(true);
              }}
              onDragLeave={e => {
                e.preventDefault();
                e.stopPropagation();
                setIsHighlightImport(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsHighlightImport(false);
                const length = e.dataTransfer.files.length;
                let newImageImportList: ImageImport[] = [];
                for(let i = 0; i < length; i++){
                  const imageImport: ImageImport = {
                    name: e.dataTransfer.files[i].name,
                    size: e.dataTransfer.files[i].size,
                    data: e.dataTransfer.files[i],
                    src: URL.createObjectURL(e.dataTransfer.files[i]),
                    isPreview: true,
                  }
                  newImageImportList.push(imageImport);
                }
                setImageImportList({
                  isPreview: true,
                  imageImport: [...imageImportList.imageImport, ...newImageImportList]
                });
              }}
              >
              <input multiple={true} onChange={onImageImported} name='images' id="dropzone-file" type="file" className="hidden" formAction={""} accept="image/*"/>

                
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop multiple images</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                </div>


              </label>


              <div className='flex mt-4 flex-col justify-between'>
                
                {!imageImportList.isPreview ? <div></div> :
                <div>
                  <div>
                    {imageImportList.imageImport.length} images
                  </div>
                  <div>
                    Total Size: {imageImportList.imageImport.reduce((a:number,b:ImageImport) => a+b.size,0)/1000000} MB
                  </div>
                </div>
                }

                <input type="submit" value={"Upload Dataset"} className='mt-4 w-full cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'></input>


              </div>
            </div>

            
          </form>
        </article>
      </div>
    </main>
  )
}
