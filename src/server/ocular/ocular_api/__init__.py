from ctypes import cdll
from .apps import ImageProcessing

ImageProcessing.by_color = cdll.LoadLibrary("imageprocessing/searchByColor.so")
ImageProcessing.by_texture = cdll.LoadLibrary("imageprocessing/searchByTexture.so")