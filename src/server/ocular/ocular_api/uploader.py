import base64
import django
django.setup()

from django.core.files.uploadedfile import InMemoryUploadedFile
from multiprocessing import Pool, Manager, Array
from .models import DataSet
from .apps import ImageProcessing
import numpy as np
import os
from PIL import Image
from ctypes import c_int, POINTER
from sys import getsizeof
from bs4 import BeautifulSoup
import requests
import io
from urllib.parse import urljoin, unquote, urlparse
from concurrent.futures import ThreadPoolExecutor
import re
import urllib3
from datetime import datetime
from django.db import transaction
from time import time
import cv2
from io import BytesIO
from django.conf import settings

class Uploader:
        

    def bulk_created_task_multiprocess(dataset: DataSet):
        
        # start = time()
        # dataset = DataSet.objects.get(pk=pk)
        # print(time()-start, "|", "Getting dataset from database")

        image = dataset.image_request

        # start = time()
        img_tmp = Image.open(image)

        # img_matrix = cv2.imdecode(np.frombuffer(image.read(), dtype=np.uint8), cv2.IMREAD_COLOR)
        # if img_matrix.shape[2] == 4:  # if has alpha
        #     img_matrix = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
        # elif img_matrix.shape[2] == 1:  # if 1 channel (grayscale)
        #     img_matrix = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        
        # print(time()-start, "|", "Opening image")

        # start = time()
        img_matrix = img_tmp.convert('RGB')
        # print(time()-start, "|", "Converting image to RGB")

        # start = time()
        img_matrix = np.array(img_matrix, dtype=np.int32)
        # print(time()-start, "|", "Converting image to numpy array")

        # start = time()
        c_img_matrix = img_matrix.ctypes.data_as(POINTER(c_int))
        # print(time()-start, "|", "Converting image to ctypes")

        row = len(img_matrix)
        col = len(img_matrix[0])

        # Debug
        # start_time = time()
        # Debug End

        # start = time()
        c_texture_components_ptr = ImageProcessing.by_texture.getTextureComponents(c_img_matrix, row, col)
        texture_components = np.ctypeslib.as_array(c_texture_components_ptr, shape=(6,))
        # ImageProcessing.by_texture.free_ptr(c_texture_components_ptr)
        # print(time()-start, "|", "Getting texture components")

        # start = time()
        c_color_histogram_ptr = ImageProcessing.by_color.getColorHistogram(c_img_matrix, row, col)
        color_histogram = np.ctypeslib.as_array(c_color_histogram_ptr, shape=(1152,))
        # ImageProcessing.by_color.free_ptr(c_color_histogram_ptr)
        # print(time()-start, "|", "Getting color histogram")


        # start = time()
        dataset.texture_components = texture_components.tolist()
        dataset.color_histogram = color_histogram.tolist()
        dataset.save(update_fields=['texture_components', 'color_histogram'])
        # print(time()-start, "|", "Saving to database")

        # DataSet.objects.update(pk=pk, texture_components=texture_components.tolist(), color_histogram=color_histogram.tolist())

        return dataset
     

    def task_multiprocess(image_file: InMemoryUploadedFile, image_name: str):
        
        # start = time()
        image_byte = BytesIO(image_file)
        # print(time()-start, "|", "Converting image to BytesIO")
        
        # start = time()
        img_tmp = Image.open(image_byte)
        # print(time()-start, "|", "Opening image")

        # image_read = image_byte.read()
        # img_matrix = cv2.imdecode(np.frombuffer(image_read, dtype=np.uint8), cv2.IMREAD_COLOR)
        # if img_matrix.shape[2] == 4:  # Check if there's alpha channel
        #     print("Alpha channel detected. Converting to RGB.")
        #     img_matrix = cv2.cvtColor(image_read, cv2.COLOR_BGRA2RGB)  # Convert BGRA to RGB
        # elif img_matrix.shape[2] == 1:
        #     img_matrix = cv2.cvtColor(image_read, cv2.COLOR_GRAY2RGB)
        # print(time()-start, "|", "Opening image")

        # start = time()
        img_matrix = img_tmp.convert('RGB')
        # print(time()-start, "|", "Converting image to RGB")

        # start = time()
        img_matrix = np.array(img_matrix, dtype=np.int32)
        # print(time()-start, "|", "Converting image to numpy array")

        # start = time()
        c_img_matrix = img_matrix.ctypes.data_as(POINTER(c_int))
        # print(time()-start, "|", "Converting image to ctypes")

        row = len(img_matrix)
        col = len(img_matrix[0])


        # start = time()
        c_texture_components_ptr = ImageProcessing.by_texture.getTextureComponents(c_img_matrix, row, col)
        texture_components = np.ctypeslib.as_array(c_texture_components_ptr, shape=(6,))
        # ImageProcessing.by_texture.free_ptr(c_texture_components_ptr)
        # print(time()-start, "|", "Getting texture components")

        # start = time()
        c_color_histogram_ptr = ImageProcessing.by_color.getColorHistogram(c_img_matrix, row, col)
        color_histogram = np.ctypeslib.as_array(c_color_histogram_ptr, shape=(1152,))
        # ImageProcessing.by_color.free_ptr(c_color_histogram_ptr)
        # print(time()-start, "|", "Getting color histogram")


        # start = time()
        img_to_save = InMemoryUploadedFile(
            image_byte,
            None,
            image_name,
            'image/jpeg',
            getsizeof(image_byte),
            None
        )
        # print(time()-start, "|", "Converting image to InMemoryUploadedFile")

        # start = time()
        DataSet.objects.create(image_request=img_to_save, texture_components=texture_components.tolist(), color_histogram=color_histogram.tolist())
        # print(time()-start, "|", "saving")


    def saveImages(image_list: list[InMemoryUploadedFile]):

        length = len(image_list)
        print("Saving {} images".format(length))
        cpu_count = os.cpu_count()

        if length <= cpu_count: # no need to use multiprocessing
            for image in image_list:
                Uploader.task_multiprocess(image.read(), image.name)
            return

        # region ====================== Multiprocessing ======================
        start = time()
        with Pool(cpu_count) as pool:
            multiprocess_result_list = [pool.apply_async(Uploader.task_multiprocess, 
                                        args=(image.read(),image.name,) 
                                        ) for image in image_list]
            pool.close()
            pool.join()
        print(time()-start, "|", "Multiprocessing duration")
        start = time()
        for multiprocess_result in multiprocess_result_list:
            if not multiprocess_result.successful():
                print("Process failed with exception:", multiprocess_result.get())
        print(time()-start, "|", "Error checking duration")
        # endregion ====================== Multiprocessing ======================

        # region ====================== Multiprocessing with Bulk create ======================
        # data_list: list[DataSet] = []
        # for i in range(0, length):
        #     new_data = DataSet(image_request=image_list[i])
        #     data_list.append(new_data)
        # # Bulk create all DataSet objects at once
        # start = time()
        # with transaction.atomic():
        #     DataSet.objects.bulk_create(data_list)
        # print(time()-start, "|", "Bulk create duration")

        # start = time()
        # with Pool(os.cpu_count()) as pool:
        #         multiprocess_result_list = [pool.apply_async(Uploader.bulk_created_task_multiprocess, 
        #                                     args=(data,) 
        #                                     ) for data in data_list]
        #         pool.close()
        #         pool.join()
        # print(time()-start, "|", "Multiprocessing duration")
        # start = time()
        # for multiprocess_result in multiprocess_result_list:
        #     if not multiprocess_result.successful():
        #         print("Process failed with exception:", multiprocess_result.get())
        # print(time()-start, "|", "Error checking duration")
        # endregion ====================== Multiprocessing with Bulk create ======================
        

        return
    
    def scrapImages(web_url: str)->(tuple[list[DataSet], int]):
        print("Scraping images from", web_url)
        (img_urls, status) = Uploader.get_all_image_url(web_url)
        
        if status != 200:
            return ([], status)

        image_list = []
        with ThreadPoolExecutor(max_workers=16) as executor:
            image_list = list(executor.map(lambda img_url: Uploader.download_image(img_url), img_urls))

        # remove all None
        image_list = [img for img in image_list if img is not None]


        length = len(image_list)
        print("Saving {} images".format(length))
        cpu_count = os.cpu_count()
        # ====================== Multiprocessing with Bulk create ======================
        data_list: list[DataSet] = []
        for i in range(0, length):
            img = Image.open(image_list[i])
            new_data = DataSet(image_request=image_list[i])
            data_list.append(new_data)

        # Bulk create all DataSet objects at once
        DataSet.objects.bulk_create(data_list)
        with Pool(cpu_count) as pool:
            pool.map_async(Uploader.bulk_created_task_multiprocess, [data for data in data_list])
            pool.close()
            pool.join()

        return (data_list, status)
    
    def download_image(url):
        try:
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                image_file = io.BytesIO(response.content)
                img = Image.open(image_file)
                return InMemoryUploadedFile(
                    image_file,
                    None,
                    str(datetime.now())+".jpg",
                    'image/jpeg',
                    getsizeof(image_file),
                    None
                )
                # return None
            else:
                print(f"Status code: {response.status_code}")
                print(f"Failed to download: {url}")
                return None
        except Exception as e:
            pass
            # print(f"{str(e)}")
        
        try:
            print("Trying with base64 encoding")
            decoded = base64.b64decode(url)
            image_file = io.BytesIO(decoded)
            img = Image.open(image_file)
            return InMemoryUploadedFile(
                image_file,
                None,
                str(datetime.now())+".jpg",
                'image/jpeg',
                getsizeof(image_file),
                None
            )
        except Exception as e:
            print(e)
            # print(f"{str(e)}")

        return None
    
    def get_all_image_url(url):
        
        try:
            http = urllib3.PoolManager()
            response = http.request('get', url)

            if response.status == 200:
                print("Getting all image url from", url)
                soup = BeautifulSoup(response.data, 'html.parser')

                img_tags = soup.find_all('img')
                img_src_urls = [urljoin(url,img['src']) for img in img_tags if 'src' in img.attrs]

                script_img_tags = soup.find_all('script')
                img_script_matches = re.findall(r"s='data:image/jpeg;base64,(.*?)';", str(script_img_tags))
                img_script_matches = [img for img in img_script_matches]

                style_img_tags = soup.find_all('div', style=True)
                img_style_matches = re.findall(r"background-image:url\('(.*?)'\)", str(style_img_tags))
                img_style_matches = [img for img in img_style_matches]

                return (img_src_urls+img_script_matches+img_style_matches, response.status)
            else:
                print("Failed to get all image url from", url)
                return ([], response.status)
        except Exception as e:
            print("Failed to get all image url from", url)
            print(e)
            return ([], 500)
