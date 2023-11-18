'use client';
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { LoadingSkeleton } from '../component/loadingskeleton';
import { useRouter } from 'next/router';

export interface ImageImport{
  src: string,
  name: string,
  size: number,
  isPreview: boolean,
  data: File | undefined
}
export interface SearchResponse{
  image_url: string,
  similarity: number,
}
export interface ImageResult{
  srcList: SearchResponse[],
  state: number, // 0: none 1: loading 2: ispreview
  maxImagePerPage: number,
  page: number,
  pdf_url: string,
  processing_duration: number,
  hash: string
}

export default function Home() {
  // const url = "http://127.0.0.1:8000"
  // const url = "http://192.168.36.17:8000/"
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const frontendUrl = window.location.href;
    setUrl(frontendUrl.substring(0, frontendUrl.length-5)+"8000");
  }, []);

  const [imageImport, setImageImport] = useState<ImageImport>({
    src: "",
    name: "",
    size: 0,
    isPreview: false,
    data: undefined
  });
  const [searchType, setSearchType] = useState<number>(0);
  const [imageResult, setImageResult] = useState<ImageResult>({
    srcList: [],
    state: 0,
    maxImagePerPage: 6,
    page: 0,
    pdf_url: "",
    processing_duration: 0,
    hash: ""
  });
  const [isHighlightImport, setIsHighlightImport] = useState<boolean>(false);

  function onImageImported(e: React.ChangeEvent<HTMLInputElement>){
    if(!e.target.files)return;
    if (e.target.files[0]) {
      setImageImport({
        src: URL.createObjectURL(e.target.files[0]), 
        isPreview: true, 
        name: e.target.files[0].name, 
        size: e.target.files[0].size,
        data: e.target.files[0]
      });
    }
  }
  const [debugMessage, setDebugMessage] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    if(!imageImport.isPreview){
      console.log("no image");
      return;
    }

    setImageResult({srcList: [], state: 1, maxImagePerPage: imageResult.maxImagePerPage, page: 0, pdf_url: "", processing_duration: 0, hash: ""});

    const formData: FormData = new FormData();
    formData.set("search_type", searchType.toString());
    formData.set("image", imageImport.data!);
    
    const requestOptions: RequestInit = {
      method: "POST",
      body: formData,
    };

    const startTime = new Date().getTime();
    const res = await fetch(url+"/api/search", requestOptions)
      .catch((e: Error) => {
        console.log(e);
        setDebugMessage(e.name+"|\n\n"+e.message+"|\n\n"+e.cause+"|\n\n"+e.stack+"\n\n");
        setImageResult({srcList: [], state: 3, maxImagePerPage: imageResult.maxImagePerPage, page: 0, pdf_url: "", processing_duration: 0, hash: ""});
      });

    if(!res)return;
    if(res.status === 400){
      console.log("bad request");
      return; // bad request
    }

    const jsonres = await res.json();
    if(!jsonres)return;

    setImageResult({
      srcList: jsonres.data.map((res: SearchResponse) => {return {image_url: url+res.image_url, similarity: res.similarity}}),
      state: 2, 
      maxImagePerPage: imageResult.maxImagePerPage, 
      page: 0,
      pdf_url: (!jsonres.pdf_url) ? "" : url+jsonres.pdf_url,
      processing_duration: (new Date().getTime() - startTime)/1000,
      hash: jsonres.data.length === 0 ? "" : jsonres.data[0].hash
    });

  }

  function getRoundedSimilarity(similarity: number): string{
    return (Math.round(similarity*10000)/100).toString();
  }
  function getImageName(image_url: string): string{
    const imageNameLength = 40;
    const splitted = image_url.split("/");
    const imageName = splitted[splitted.length-1];
    if(imageName.length > imageNameLength){
      return imageName.substring(0, imageNameLength-3)+"...";
    }
    return imageName;
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
        hash: imageResult.hash
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


  // #region Auto Capture Camera ================================
  const [isAutoCapture, setIsAutoCapture] = useState<boolean>(false);
  const loopWaitDuration = 5000;
  useEffect(() => {
    if(!isAutoCapture) return;
    const interval = setInterval(() => {
      if(imageResult.state !== 1)captureCamera(); // cuma capture kalo lagi ga loading
    }, loopWaitDuration);
  
    return () => clearInterval(interval);
  }, [isAutoCapture])
  useEffect(() => {
    if(isAutoCapture){
      const e: any = new Event('submit');
      onSubmit(e);
    }
  }, [imageImport])
  function getCurrentDateString(): string{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1; // +1 because month start from 0
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${day}-${month}-${year} ${hour}-${min}-${sec}`;
  }
  function captureCamera(){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      imageCapture.takePhoto()
        .then((blob: any) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const dataFile = new File([blob], getCurrentDateString() + ".png", {type: "image/png"});

            setImageImport({
              src: base64data as string, 
              isPreview: true, 
              name: dataFile.name, 
              size: dataFile.size,
              data: dataFile
            },);

          };
          reader.readAsDataURL(blob);
          track.stop();
        })
        .catch((error: Error) => {
          console.error('Error capturing image:', error);
            });
      })
      .catch((error: Error) => {
        console.error('Error accessing camera:', error);
      });
  }
  // #endregion Auto Capture Camera End ================================

  const [isLoadingPDF, setIsLoadingPDF] = useState<boolean>(false);
  async function onDownloadPDF(e: React.MouseEvent<HTMLButtonElement>){
    e.preventDefault();
    
    if(imageResult.pdf_url){
      window.open(imageResult.pdf_url, '_blank');
      return;
    }

    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({hash: imageResult.hash}),
    };
    setIsLoadingPDF(true);
    const res = await fetch(url+"/api/pdf", requestOptions)
      .catch((e: Error) => {
        console.log(e);
      });
    setIsLoadingPDF(false);

    if(!res)return;

    const jsonres = await res.json();
    if(!jsonres)return;
    if(!jsonres.pdf_url)return;

    setImageResult({
      srcList: imageResult.srcList,
      state: imageResult.state,
      maxImagePerPage: imageResult.maxImagePerPage,
      page: imageResult.page,
      pdf_url: url+jsonres.pdf_url, // new
      processing_duration: imageResult.processing_duration,
      hash: imageResult.hash
    });

    window.open(url+jsonres.pdf_url, '_blank');
  }

  return (
    <main className="pb-16 lg:pt-16 lg:pb-24">
      <div className='flex justify-between px-4 mx-auto max-w-screen-xl'>
        <article className='mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert'>
          
          <h1 className='font-bold text-slate-950 dark:text-white text-3xl text-center mb-8'>Reverse Image Search</h1>
          {/* Form */}
          
          <form onSubmit={onSubmit}>
            <div className='sm:grid sm:grid-cols-2 gap-4'>
              <label htmlFor="dropzone-file" className={`
              
              flex flex-col items-center justify-center w-full h-56 rounded-lg cursor-pointer  dark:focus:bg-gray-100 
              hover:bg-gray-100 hover:dark:bg-gray-600

              ${!isHighlightImport ? `bg-gray-50 dark:bg-gray-700` : `bg-gray-100 dark:bg-gray-600`}
              
              ${imageImport.isPreview ? `` : `border-2 border-gray-300 border-dashed dark:border-gray-600`}
              
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
                
                // check if file is image and is either png, jpg, or jpeg
                if(e.dataTransfer.files.length !== 1) return;
                if(!e.dataTransfer.files[0].type.includes("image")) return;
                if(!e.dataTransfer.files[0].type.includes("png") && !e.dataTransfer.files[0].type.includes("jpg") && !e.dataTransfer.files[0].type.includes("jpeg")) return;
                let i = 0;
                for(i = 0; i < e.dataTransfer.files.length; i++){
                  if(!e.dataTransfer.files[i].type.includes("image")) return;
                  if(!e.dataTransfer.files[i].type.includes("png") && !e.dataTransfer.files[i].type.includes("jpg") && !e.dataTransfer.files[i].type.includes("jpeg")) return;
                }

                setImageImport({
                  src: URL.createObjectURL(e.dataTransfer.files[0]), 
                  isPreview: true, 
                  name: e.dataTransfer.files[0].name, 
                  size: e.dataTransfer.files[0].size,
                  data: e.dataTransfer.files[0],
                });
              }}
              >
              <input onChange={onImageImported} name='image' id="dropzone-file" type="file" className="hidden"  accept="image/jpeg, image/jpg, image/png"/>

                {
                imageImport.isPreview ?
                <>
                  <div className="group relative w-full h-full">
                    <img src={imageImport.src} className={`
                    transition-transform duration-300 object-cover h-full w-full rounded-lg hover:bg-slate-600                   
                    `}/>

                    {/* hightlight */}
                    <div className={`

                    absolute inset-0 bg-black group-hover:opacity-50 transition-opacity  rounded-lg group-hover:visible flex flex-col items-center justify-center pt-5 pb-6

                    ${!isHighlightImport ? `opacity-0 invisible` : `opacity-50 visible`}

                    
                    `}>
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                    </div>
                  </div>

                </>
                :
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG</p>
                </div>
                }


              </label>


              <div className='flex flex-col justify-between mt-2'>
                
                {!imageImport.isPreview ? <div></div> :
                <div>
                  <div className='truncate ...'>
                    Image: {getImageName(imageImport.name)}
                  </div>
                  <div>
                    Size: {imageImport.size/1000} KB
                  </div>
                </div>
                }

                <div>

                  <div className='flex items-center mb-1'>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input onChange={e => {setIsAutoCapture(!isAutoCapture);}} type="checkbox" value="" checked={isAutoCapture} className="sr-only peer"/>
                      <div className="bg-white w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-200 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="mx-2 font-medium text-gray-900 dark:text-white">Auto Capture</span>
                  </div>
                  
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Search Algorithm:</h3>
                  <ul className="grid grid-cols-2 gap-4 mb-4">
                      <li>
                          <input onClick={e => {setSearchType(0)}} type="radio" id="default-radio-0" value={0} name="search_type" className="hidden peer" required defaultChecked/>
                          <label htmlFor="default-radio-0" className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">                           
                              <div className="w-full font-semibold text-center">By Texture</div>
                          </label>
                      </li>
                      <li>
                          <input onClick={e => {setSearchType(1)}} type="radio" id="default-radio-1" value={1} name="search_type" className="hidden peer"/>
                          <label htmlFor="default-radio-1" className="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                              <div className="w-full font-semibold text-center">By Color</div>
                          </label>
                      </li>
                  </ul>

                  <input disabled={imageResult.state === 1} type="submit" value={
                    imageResult.state == 0 ? "Search Image"
                    : imageResult.state == 1 ? "Searching..."
                    : imageResult.state == 2 ? "Done. Search again?"
                    : "Error. Start again?"
                    } className={`${imageResult.state === 1 ? 'cursor-not-allowed':'cursor-pointer'} w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}></input>
                </div>


              </div>
            </div>

            
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
              :
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
                                    <div className='truncate ... z-10 px-2 pb-0.5'>{image.image_url}</div>
                                  </div>
                                  <div className='absolute h-1/3 w-full rounded-lg opacity-80 z-50 flex justify-end bg-gradient-to-b from-black to-transparent'>
                                    <div className='z-10 px-2 pt-1 text-end'>{`${getRoundedSimilarity(image.similarity)}%`}</div>
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
            }

            {imageResult.state === 2 && imageResult.hash ? 
              <button disabled={isLoadingPDF} onClick={onDownloadPDF} className={`${isLoadingPDF ? "cursor-not-allowed" : "cursor-pointer"} text-center mt-4 w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700`}>
                {isLoadingPDF ? "Processing PDF File..." : "Download Search Result as PDF"}
              </button>
              :
              <></>
            }

        <br />
        <div>{debugMessage}</div>
        </article>
      </div>
    </main>
  )
}
