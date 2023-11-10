import django
django.setup()

from django.core.files.uploadedfile import InMemoryUploadedFile
from time import time
from multiprocessing import Pool
from .serializers import DataSetSerializer
from .models import DataSet
from .apps import ImageProcessing
import numpy as np
import os
from PIL import Image
from ctypes import c_int, c_float, POINTER

class Uploader:
    
    def progress(image: InMemoryUploadedFile):
        print("Image {} saved".format(image.name))
        return

    def task(image: InMemoryUploadedFile):
        
        image.seek(0)
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

        new_data = DataSet()
        new_data.image_request = image
        new_data.texture_components = texture_components.tolist()
        new_data.color_histogram = color_histogram.tolist()
        new_data.save()
        return image
    
    def saveImages(image_list: list[InMemoryUploadedFile]):

        length = len(image_list)
        print("Saving {} images".format(length))
        cpu_count = os.cpu_count()

        with Pool(cpu_count) as pool:
            results = [pool.apply_async(Uploader.task, (image_list[i],), callback=Uploader.progress) for i in range(0, length)]
            pool.close()
            pool.join()

        return