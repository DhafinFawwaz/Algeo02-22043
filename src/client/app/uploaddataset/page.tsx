'use client';
import Image from 'next/image'
import { useState } from 'react';
import { ImageImport, ImageResult, SearchResponse } from '../page';
import { LoadingSkeleton } from '@/component/loadingskeleton';

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

  const [uploadState, setUploadState] = useState<number>(0);

  const [imageResult, setImageResult] = useState<ImageResult>({
    srcList: [],
    state: 0,
    maxImagePerPage: 6,
    page: 0,
    pdf_url: "",
    processing_duration: 0,
    hash: "",
  });


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

    setUploadState(1);
    const res = await fetch(url+"/api/upload/dataset", requestOptions)
      .catch(e => console.log(e));
    // wait 1 second
    setUploadState(2);

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

  async function onSubmitScrapping(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setImageResult({srcList: [], state: 1, maxImagePerPage: imageResult.maxImagePerPage, page: 0, pdf_url: "", processing_duration: 0, hash: ""});

    const formData = new FormData(e.currentTarget);

    const requestOptions: RequestInit = {
      method: "POST",
      body: formData,
    };
    
    const startTime = new Date().getTime();
    const res = await fetch(url+"/api/upload/scrap", requestOptions)
      .catch(e => console.log(e));

    if(!res)return;
    if(res.status === 400){
      console.log("bad request");
      return; // bad request
    }
    if(res.status === 500){
      console.log("internal server error");
      setImageResult({srcList: [], state: 3, maxImagePerPage: imageResult.maxImagePerPage, page: 0, pdf_url: "", processing_duration: 0, hash:  ""});
      return; // internal server error
    }

    const data = await res.json();
    if(!data)return;

    setImageResult({
      srcList: data.data.map((res: SearchResponse) => {return {image_url: url+res.image_url, similarity: res.similarity}}), 
      state: 2, 
      maxImagePerPage: imageResult.maxImagePerPage, 
      page: 0,
      pdf_url: url+data.pdf_url,
      processing_duration: (new Date().getTime() - startTime)/1000, 
      hash:  ""
    });
  }

  // #region Pagination ================================
  function changePage(newPage: number){
    if(newPage < 0 || newPage >= imageResult.srcList.length/imageResult.maxImagePerPage) return;
    setImageResult(
      {
        srcList: imageResult.srcList,
        state: imageResult.state,
        maxImagePerPage: imageResult.maxImagePerPage,
        page: newPage,
        pdf_url: imageResult.pdf_url,
        processing_duration: imageResult.processing_duration,
        hash:  ""
      }
    )
  }
  function getPaginationButton(newPage: number): JSX.Element{
    if(newPage == imageResult.page){
      return <div key={newPage} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 font-medium rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 sm:pt-2.5 pt-1.5 text-center align-middle'>{newPage+1}</div>
    }
    return <button onClick={e => changePage(newPage)} key={newPage} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 pt-0.5'>{newPage+1}</button>
  }
  function getPaginationDot(key: number): JSX.Element{
    return <div key={key} className='w-5 text-center flex flex-col-reverse'>...</div>
  }
  function getPaginationButtonList(): JSX.Element[]{
    let buttonList: JSX.Element[] = [];
    if (imageResult.srcList.length/imageResult.maxImagePerPage <= 7){
      for(let i = 0; i < imageResult.srcList.length/imageResult.maxImagePerPage; i++){
        buttonList.push(getPaginationButton(i));
      }
      return buttonList;
    }else{
      // 1,  2  , 3  ,    4   ,   5  ,  6 ,  7
      // 1, ... ,left, current, right, ..., last
      // 1, 2 ,left, current, right, ..., last
      // 1, ... ,left, current, right, 2nd last, last
      // current, 2, 3, ..., last
      // 1, current, 3, ..., last
      // 1, 2, current, 3, ..., last
      // first, ..., 3rd last, 2nd last, current
      // first, ..., 3rd last, current, last
      // first, ..., current, 2nd last, last
      const minPage: number = 0;
      const maxPage: number = Math.ceil(imageResult.srcList.length/imageResult.maxImagePerPage)-1;
      buttonList.push(getPaginationButton(imageResult.page)); // current
      if(imageResult.page-1 >= minPage) buttonList.unshift(getPaginationButton(imageResult.page-1)); // left
      if(imageResult.page+1 <= maxPage) buttonList.push(getPaginationButton(imageResult.page+1)); // right

      if(imageResult.page-3 >= minPage){
        buttonList.unshift(getPaginationDot(-1));
        buttonList.unshift(getPaginationButton(0)); // first
      }else if(imageResult.page-2 >= minPage){
        buttonList.unshift(getPaginationButton(0)); // first
      }
      if(imageResult.page+3 <= maxPage){
        buttonList.push(getPaginationDot(-2));
        buttonList.push(getPaginationButton(maxPage)); // last
      }else if(imageResult.page+2 <= maxPage){
        buttonList.push(getPaginationButton(maxPage)); // last
      }
      return buttonList;
    }
    
      
  }
  // #endregion Pagination End ================================

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
          <h1 className='text-slate-950 dark:text-white font-bold text-3xl text-center mb-8'>Upload Dataset</h1>
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
              <input multiple={true} onChange={onImageImported} name='images' id="dropzone-file" type="file" className="hidden" accept="image/*"/>

                
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop multiple images</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                </div>


              </label>

              


              <div className='flex flex-col mt-3 sm:mt-0 justify-between'>
                
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


              <ul className="grid grid-cols-2 gap-4 my-4">
                  <li>
                      <input type="radio" id="default-radio-0" value={0} name="is_overwrite" className="hidden peer" required defaultChecked/>
                      <label htmlFor="default-radio-0" className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">                           
                          <div className="w-full font-semibold text-center">Accumulative</div>
                      </label>
                  </li>
                  <li>
                      <input type="radio" id="default-radio-1" value={1} name="is_overwrite" className="hidden peer"/>
                      <label htmlFor="default-radio-1" className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                          <div className="w-full font-semibold text-center">Overwrite</div>
                      </label>
                  </li>
              </ul>


                {uploadState === 0 ?
                <> {/**uploadState.toString() === '1' just to remove the error */}
                  <input disabled={uploadState.toString() === '1'} type="submit" value={"Upload Dataset"} className='h-10 w-full cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'/>
                </>
                : uploadState === 2 ?
                <>
                  <input type="submit" value={"Done. Upload More?"} className='h-10 w-full cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'/>
                </>
                :
                <>
                  <div className='cursor-not-allowed flex justify-center h-10 gap-2 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><path strokeDasharray="60" strokeDashoffset="60" strokeOpacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path strokeDasharray="15" strokeDashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg>
                    <div className=''>Uploading...</div>
                  </div>
                </>
                }


                
              </div>
            </div>

            
          </form>

          <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload dataset by web scrapping</label>
          <form onSubmit={onSubmitScrapping} className='grid sm:grid-cols-7 gap-4'>
            <input type="url" name='web_url' className="sm:col-span-5 bg-gray-50 border text-gray-900 sm:text-sm rounded-lg block p-2.5 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="https://id.wikipedia.org/wiki/Ayam" required/>

            <input disabled={imageResult.state === 1} type="submit" value={
              imageResult.state == 0 ? "Start Scrapping"
              : imageResult.state == 1 ? "Scrapping..."
              : imageResult.state == 2 ? "Done. Start again?"
              : "Error. Start again?"
              } className={`${imageResult.state === 1 ? 'cursor-not-allowed':'cursor-pointer'} sm:col-span-2 h-10 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}/>

          </form>


          {/* Search Result */}
            
          {
              imageResult.state === 0 ?
              <></>
              :
              imageResult.state === 1 ?
              <>
                <LoadingSkeleton maxImagePerPage={6}></LoadingSkeleton>
              </>
              : imageResult.state === 2 ?
              <>
                <hr className="h-px mt-8 mb-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                
                <div className='flex justify-between'>
                  <h2 className='text-lg font-bold'>Result:</h2>
                  <h2 className='text'>{imageResult.srcList.length} results in {imageResult.processing_duration} seconds.</h2>
                </div>
                
                <div className='bg-slate-800 rounded-lg mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3'>
                {
                  imageResult.srcList.map((image: SearchResponse, i: number) => {
                    if(i >= imageResult.page*imageResult.maxImagePerPage
                      && i < (imageResult.page+1)*imageResult.maxImagePerPage
                      ){
                        return  <a href={image.image_url} target='_blank' key={i} className='w-full h-36 bg-slate-700 rounded-lg relative cursor-pointer group'>
                                  <img className='object-cover w-full h-full rounded-lg absolute' src={image.image_url}/>
                                  <div className='opacity-0 group-hover:opacity-50 duration-150 bg-black h-full w-full z-30 rounded-lg absolute flex flex-col-reverse justify-between'>
                                    <div className='truncate ... z-50 px-2 pb-0.5'>{image.image_url}</div>
                                  </div>
                                </a>  
                      }
                    return;
                  }
                    
                  )
                }
                </div>
                
                <div className='flex sm:gap-3 gap-2 justify-center mt-3'>
                  {/* left arrow */}
                  <button onClick={e => {changePage(imageResult.page-1); }} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 grid place-items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12)"><g id="feArrowUp0" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1"><g id="feArrowUp1" fill="currentColor"><path id="feArrowUp2" d="m4 15l8-8l8 8l-2 2l-6-6l-6 6z"/></g></g></g></svg>
                  </button>
                  {
                    getPaginationButtonList()
                  }
                  {/* right arrow */}
                  <button onClick={e => changePage(imageResult.page+1)} className='sm:w-10 sm:h-10 w-8 h-8 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 grid place-items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><g id="feArrowUp0" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1"><g id="feArrowUp1" fill="currentColor"><path id="feArrowUp2" d="m4 15l8-8l8 8l-2 2l-6-6l-6 6z"/></g></g></g></svg>
                  </button>
                </div>
      
              </>
              : 
              <></>
            }
        </article>
      </div>
    </main>
  )
}
