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