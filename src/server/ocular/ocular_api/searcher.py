from concurrent.futures import ThreadPoolExecutor
import django
django.setup()

from django.http import HttpResponseBadRequest

from .models import SearchRequest, SearchResult, DataSet
from .serializers import SearchRequestSerializer, SearchResultSerializer
from PIL import Image
from typing import List, Tuple
import hashlib
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
import numpy as np
from pathlib import Path
from io import BytesIO
from django.core.files import File
import os
import img2pdf
import tempfile
from django.core.files.base import ContentFile
from .apps import ImageProcessing
from ctypes import cast, POINTER, c_int, c_double
from multiprocessing import Pool, Array, Manager
from multiprocessing.sharedctypes import RawArray
import os
from math import isnan, isinf
from time import time

class Searcher:
    def generateHash(image_file: InMemoryUploadedFile, search_type: str) -> str:
        image_content = image_file.read()
        hash_input = f"{image_content}{search_type}".encode('utf-8')
        sha256_hash = hashlib.sha256(hash_input).hexdigest()
        print("Hash generated:", sha256_hash)
        return sha256_hash
    
    def searchByColorMultiprocess(dataset: DataSet, hash: str, color_histogram: list[int]):
        # print("===========================================")
        # initial_time = time()
        # start = time()
        color_histogram_c = color_histogram.ctypes.data_as(POINTER(c_int))
        # print(time()-start, "|", "Converting requested color histogram to ctypes")
        
        sr = SearchResult()
        sr.image_url = dataset.image_request.url
        sr.hash = hash

        color_histogram_res = dataset.color_histogram
        # start = time()
        color_histogram_res_v2 = np.array(color_histogram_res, dtype=np.int32)
        # print(time()-start, "|", "Converting dataset color histogram to numpy array")

        # start = time()
        color_histogram_res_c = color_histogram_res_v2.ctypes.data_as(POINTER(c_int))
        # print(time()-start, "|", "Converting dataset color histogram to ctypes")

        # start = time()
        similarity = ImageProcessing.cos_sim.cosineSimilarityColor(color_histogram_c, color_histogram_res_c, 72)
        # print(time()-start, "|", "Calculating similarity")
        
        sr.similarity = similarity
        
        # print(time()-initial_time, "|", "Total duration")

        return sr


    # list isinya imagenya, bool nentuin apakah hashnya ada di database atau tidak
    def getSearchResult(data: SearchRequest) -> Tuple[List[SearchResult],bool]:
        
        # Kalau data.hash ada di database, ambil semua image yang punya hash yang sama, returnkan
        is_hash_exist: bool = SearchRequest.objects.filter(hash=data.hash).exists()

        # if is_hash_exist:
        #     return (SearchResult.objects.filter(hash=data.hash),True)

        # return (result, False)
        result: list[SearchResult] = []
        if data.search_type == "0": # by texture
            print("[Start searching by texture]")
            # ambil semua di database
            dataset_list: list[DataSet] = DataSet.objects.all()

            # mempersiapkan parameter
            img_inp = Image.open(data.image_request)
            img_inp_rgb = img_inp.convert("RGB")
            SearchReq_matrix = np.array(img_inp_rgb, dtype = np.int32)
            Req_row = len(SearchReq_matrix)
            Req_col = len(SearchReq_matrix[0])
            # hitung texture_component dari data.image_request
            pointer_to_req = SearchReq_matrix.ctypes.data_as(POINTER(c_int))
            texture_component_c = ImageProcessing.by_texture.getTextureComponents(pointer_to_req, Req_row, Req_col)
            # hitung (multiprocessing) cosine similarity dari texture_components dengan dataset.texture_components
            # kalau > 0.6, append result beserta similaritynya

            result: list[SearchResult] = []

            for dataset in dataset_list:
                sr = SearchResult()
                sr.image_url = dataset.image_request.url
                sr.hash = data.hash
                
                texture_component_res = dataset.texture_components
                texture_component_res_v2 = np.array(texture_component_res, dtype=np.double)
                texture_component_res_c = texture_component_res_v2.ctypes.data_as(POINTER(c_double))
                sr.similarity = ImageProcessing.cos_sim.cosineSimilarity(texture_component_c, texture_component_res_c, 6)
                if(sr.similarity > 0.6):
                    result.append(sr)


            result.sort(key=lambda x: x.similarity, reverse=True)
            return (result,False)
        else: # by color
            print("[Start searching by color]")

            # ambil semua di database
            dataset_list: list[DataSet] = DataSet.objects.all()
            
            # hitung color_histogram dari data.image_request
            SearchReq_matrix = Image.open(data.image_request)
            SearchReq_matrix = SearchReq_matrix.convert("RGB")
            SearchReq_matrix = np.array(SearchReq_matrix, dtype=np.int32)
            Req_row = len(SearchReq_matrix)
            Req_col = len(SearchReq_matrix[0])
            
            pointer_to_req = SearchReq_matrix.ctypes.data_as(POINTER(c_int))

            start = time()
            color_histogram_c = ImageProcessing.by_color.getColorHistogram(pointer_to_req, Req_row, Req_col)
            print(time()-start, "|", "Requested Image Color histogram Calculation")

            # hitung (multiprocessing) cosine similarity dari color_histogram dengan dataset.color_histogram
            # kalau > 0.6, append result beserta similaritynya

            start = time()
            color_histogram_req = np.ctypeslib.as_array(color_histogram_c, shape=(1152,))
            print(time()-start, "|", "Converting requested color histogram to numpy array")

            # region Multiprocessing ==================================================
            start = time()
            with Pool(os.cpu_count()) as pool:
                # results = pool.map_async(Searcher.searchByColorMultiprocess, [(dataset, data, color_histogram_req) for dataset in dataset_list], callback = Searcher.searchByColorResult)
                multiprocess_result_list = [pool.apply_async(Searcher.searchByColorMultiprocess, 
                                            args=(dataset, data.hash, color_histogram_req,) 
                                            ) for dataset in dataset_list]
                pool.close()
                pool.join()
            print(time()-start, "|", "Multiprocessing duration")

            start = time()
            for multiprocess_result in multiprocess_result_list:
                if not multiprocess_result.successful():
                    print("Process failed with exception:", multiprocess_result.get())
                else:
                    search_result: SearchResult = multiprocess_result.get()
                    if search_result.similarity > 0.6:
                        result.append(search_result)
            print(time()-start, "|", "Appending result duration")
            # endregion Multiprocessing ==================================================


            # region Linear ==================================================
            # start = time()
            # for dataset in dataset_list:

            #     sr = SearchResult()
            #     sr.image_url = dataset.image_request.url
            #     sr.hash = data.hash

            #     color_histogram_res = dataset.color_histogram
            #     color_histogram_res_v2 = np.array(color_histogram_res, dtype=np.int32)
            #     color_histogram_res_c = color_histogram_res_v2.ctypes.data_as(POINTER(c_int))
            #     similarity = ImageProcessing.cos_sim.cosineSimilarityColor(color_histogram_c, color_histogram_res_c, 72)
                
            #     sr.similarity = similarity
                
            #     if (sr.similarity > 0.6):
            #         result.append(sr)
            # print(time()-start, "|", "Linear duration")
            # endregion Linear ==================================================
            

            # region Multithreading ==================================================
            # start = time()
            # with ThreadPoolExecutor(max_workers=16) as executor:
            #     result = list(executor.map(lambda dataset: Searcher.searchByColorMultiprocess(dataset, data.hash, color_histogram_req,), dataset_list))
            # print(time()-start, "|", "Multithreading duration")
            # # remove all similarity with value <= 0.6
            # start = time()
            # result = list(filter(lambda x: x.similarity > 0.6, result))
            # print(time()-start, "|", "Filtering duration")
            # endregion Multithreading ==================================================



            # sort result berdasarkan similarity
            result.sort(key=lambda x: x.similarity, reverse=True)
            return (result, False)

    def getPDFfromImageUrls(search_result_list: list[SearchResult]):

        images = []
        for search_result in search_result_list:
            image_path: str = search_result.image_url.replace('/','\\')
            base_path = settings.BASE_DIR
            full_path: str = str(base_path)+image_path
            img = Image.open(full_path)
            images.append(img)

        # Convert images to PDF
        temp_files = []
        for idx, img in enumerate(images):
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            temp_files.append(temp_file.name)
            img.save(temp_file.name, format="PNG")

        # Convert images to PDF
        pdf_bytes = img2pdf.convert(temp_files)
        pdf_content = ContentFile(pdf_bytes, name=search_result_list[0].hash+".pdf")

        return pdf_content