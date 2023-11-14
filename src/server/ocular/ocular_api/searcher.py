from django.http import HttpResponseBadRequest
from .models import SearchRequest, SearchResult, DataSet
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
from ctypes import cast, POINTER, c_int

class Searcher:
    def generateHash(image_file: InMemoryUploadedFile, search_type: str) -> str:
        image_content = image_file.read()
        hash_input = f"{image_content}{search_type}".encode('utf-8')
        sha256_hash = hashlib.sha256(hash_input).hexdigest()
        print("Hash generated:", sha256_hash)
        return sha256_hash
    

    # list isinya imagenya, bool nentuin apakah hashnya ada di database atau tidak
    def getSearchResult(data: SearchRequest) -> Tuple[List[SearchResult],bool]:
        
        # Kalau data.hash ada di database, ambil semua image yang punya hash yang sama, returnkan
        is_hash_exist: bool = SearchRequest.objects.filter(hash=data.hash).exists()
        if is_hash_exist:
            return (SearchResult.objects.filter(hash=data.hash),True)
        

        # result: list[SearchResult] = []
        # datasets = DataSet.objects.all()[:21]
        # for dataset in datasets:
        #     sr = SearchResult()
        #     sr.image_url = dataset.image_request.url
        #     sr.hash = data.hash
        #     sr.similarity = 0.5
        #     result.append(sr)

        # return (result, False)
        print(data.search_type)
        result: list[SearchResult] = []
        if data.search_type == "0": # by texture
            print("Start searching by texture")
            # ambil semua di database
            dataset_list: list[DataSet] = DataSet.objects.all()

            # mempersiapkan parameter
            img_inp = Image.open(data.image_request)
            img_inp_rgb = img_inp.convert("RGB")
            SearchReq_matrix = np.array(img_inp_rgb)
            Req_row = len(SearchReq_matrix)
            Req_col = len(SearchReq_matrix[0])
            ReqC = np.ctypeslib.as_ctypes(SearchReq_matrix)
            pointer_to_req = cast(ReqC, POINTER(POINTER(POINTER(c_int))))

            # hitung texture_component dari data.image_request
            texture_component = ImageProcessing.by_texture.getTextureComponents(pointer_to_req, Req_row, Req_col)
            # hitung (multiprocessing) cosine similarity dari texture_components dengan dataset.texture_components
            # kalau > 0.6, append result beserta similaritynya
            result: list[SearchResult] = []
            # datasets = DataSet.objects.all()
            for dataset in dataset_list:
                # print(settings.MEDIA_ROOT)
                # print(settings.PUBLIC_ROOT)
                sr = SearchResult()
                sr.image_url = dataset.image_request.url
                sr.hash = data.hash
                sr_path = sr.image_url.replace("/", "\\")
                b_path = settings.BASE_DIR
                SearchRes_matrix = Image.open(str(b_path) + sr.image_url)
                SearchRes_matrix = SearchRes_matrix.convert("RGB")
                SearchRes_matrix = np.array(SearchRes_matrix)
                Res_row = len(SearchRes_matrix)
                Res_col = len(SearchRes_matrix[0])
                ResC = np.ctypeslib.as_ctypes(SearchRes_matrix)
                pointer_to_res = cast(ResC, POINTER(POINTER(POINTER(c_int))))
                texture_component_res = ImageProcessing.by_texture.getTextureComponent(pointer_to_res, Res_row, Res_col)
                if (ImageProcessing.cos_sim.cosineSimilarity(texture_component, color_histogram_res, 72) > 0.6):
                    result.append(sr)
            
            # sort result berdasarkan similarity
            
            # contoh
            # sr = SearchResult()
            # sr.hash = data.hash
            # sr.image_url = dataset_list[0].image_request.url 
            # ini image_url cek dulu aku lupa
            # harusnya itu misalnya sr.image_url = /media/dataset/0.jpg

            # result.append(sr)


            return (result,False)
        else: # by color
            print("Start searching by color")

            # ambil semua di database
            dataset_list: list[DataSet] = DataSet.objects.all()
            
            # variables needed

            # hitung color_histogram dari data.image_request
            SearchReq_matrix = Image.open(data.image_request)
            SearchReq_matrix = SearchReq_matrix.convert("RGB")
            SearchReq_matrix = np.array(SearchReq_matrix, dtype=np.int32)
            Req_row = len(SearchReq_matrix)
            Req_col = len(SearchReq_matrix[0])
            # ReqC = np.ctypeslib.as_ctypes(SearchReq_matrix)
            # pointer_to_req = cast(ReqC, POINTER(POINTER(POINTER(c_int))))
            
            pointer_to_req = SearchReq_matrix.ctypes.data_as(POINTER(c_int))
            # print("ptr")
            # print(pointer_to_req)

            color_histogram = ImageProcessing.by_color.getColorHistogram(pointer_to_req, Req_row, Req_col)
            # print("hist")
            

            # hitung (multiprocessing) cosine similarity dari color_histogram dengan dataset.color_histogram
            # kalau > 0.6, append result beserta similaritynya
            result: list[SearchResult] = []
            # datasets = DataSet.objects.all()
            for dataset in dataset_list:
                # print(settings.MEDIA_ROOT)
                # print(settings.PUBLIC_ROOT)

                sr = SearchResult()
                # sr.image_url = dataset.image_request.url
                # sr.hash = data.hash.convert("RGB")
                # sr_path = sr.image_url.replace("/", "\\")
                # b_path = settings.BASE_DIR
                # SearchRes_matrix = Image.open(str(b_path) + sr.image_url)
                # SearchRes_matrix = SearchRes_matrix
                # SearchRes_matrix = np.array(SearchRes_matrix)
                # Res_row = len(SearchRes_matrix)
                # Res_col = len(SearchRes_matrix[0])
                # SearchRes_matrix = np.array(SearchRes_matrix, dtype=np.int32)
                # pointer_to_res = SearchRes_matrix.ctypes.data_as(POINTER(c_int))

                # ResC = np.ctypeslib.as_ctypes(SearchRes_matrix)
                # pointer_to_res = cast(ResC, POINTER(POINTER(POINTER(c_int))))
                color_histogram_res = dataset.color_histogram
                # ImageProcessing.by_color.getColorHistogram(pointer_to_res, Res_row, Res_col)
                sr.similarity = ImageProcessing.cos_sim.cosineSimilarityColor(color_histogram, color_histogram_res, 72)
                if (sr.similarity > 0.6):
                    result.append(sr)
            
            # sort result berdasarkan similarity
            return (result, False)

        images_path = Path(settings.MEDIA_ROOT).glob('*.*')
        for image_path in images_path:
            img = Image.open(image_path)
            im_matrix = np.array(img)
            print(im_matrix[0][0])
            print(im_matrix[0][0][2])
        

        return ([],True)

        
        

        # cara akses image
        # letaknya semuanya di folder media
        # ini ngebuka dataset yang mau dibandingin
        # img = Image.open(settings.MEDIA_ROOT+"No.jpg")
        # img.show()
        
        # for test
        # ini ngebuka data yg direquest clients
        # img = Image.open(data.image_request)
        # img.show()
        # return

        # print("Showing image:", data.image_request.name)

        # result: list[SearchResult] = []
        # for i in range(15):
        #     sr = SearchResult()
        #     sr.hash = data.hash
        #     sr.image_url = "/media/download.jpeg"
        #     result.append(sr)
        
        # return (result, is_hash_exist)

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