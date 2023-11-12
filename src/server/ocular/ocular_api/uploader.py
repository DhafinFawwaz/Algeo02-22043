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

class Uploader:

    def task_multiprocess(pk: int):
        dataset = DataSet.objects.get(pk=pk)
        
        image = dataset.image_request
        img_tmp = Image.open(image)
        img_matrix = np.array(img_tmp)
        c_img_matrix = img_matrix.ctypes.data_as(POINTER(POINTER(POINTER(c_int))))
        
        row = len(img_matrix)
        col = len(img_matrix[0])

        c_texture_components_ptr = ImageProcessing.by_texture.getTextureComponents(c_img_matrix, row, col)
        texture_components = np.ctypeslib.as_array(c_texture_components_ptr, shape=(6,))
        ImageProcessing.by_texture.free_ptr(c_texture_components_ptr)

        c_color_histogram_ptr = ImageProcessing.by_color.getColorHistogram(c_img_matrix, row, col)
        color_histogram = np.ctypeslib.as_array(c_color_histogram_ptr, shape=(72,))
        ImageProcessing.by_color.free_ptr(c_color_histogram_ptr)

        dataset.texture_components = texture_components.tolist()
        dataset.color_histogram = color_histogram.tolist()
        dataset.save()
        return dataset
     
    def saveImages(image_list: list[InMemoryUploadedFile]):

        length = len(image_list)
        print("Saving {} images".format(length))
        cpu_count = os.cpu_count()

        # ====================== Multiprocessing ======================
        # with Pool(cpu_count) as pool:
        #     for i in range(0, length):
        #         new_data = DataSet()
        #         new_data.image_request = image_list[i]
        #         new_data.save()
        #         pool.apply_async(Uploader.task_multiprocess, (new_data.pk,))
        #     pool.close()
        #     pool.join()

        # ====================== Multiprocessing with Bulk create ======================
        data_list: list[DataSet] = []
        for i in range(0, length):
            new_data = DataSet(image_request=image_list[i])
            data_list.append(new_data)
        # Bulk create all DataSet objects at once
        DataSet.objects.bulk_create(data_list)
        with Pool(cpu_count) as pool:
            pool.map_async(Uploader.task_multiprocess, [data.pk for data in data_list])
            pool.close()
            pool.join()

        # ====================== Normal ======================
        # for i in range(0, length):
        #     Uploader.task_sequencial(image_list[i])

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
            pool.map_async(Uploader.task_multiprocess, [data.pk for data in data_list])
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
                img_urls = [urljoin(url,img['src']) for img in img_tags if 'src' in img.attrs]

                script_img_tags = soup.find_all('script')
                img_matches = re.findall(r"s='data:image/jpeg;base64,(.*?)';", str(script_img_tags))
                img_matches = [img for img in img_matches]

                return (img_urls+img_matches, response.status)
            else:
                print("Failed to get all image url from", url)
                return ([], response.status)
        except Exception as e:
            print("Failed to get all image url from", url)
            return ([], 500)
