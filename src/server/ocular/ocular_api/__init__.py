from ctypes import cdll, CDLL, c_void_p, c_int, c_float, POINTER
from .apps import ImageProcessing

ImageProcessing.by_color = cdll.LoadLibrary("imageprocessing/searchByColor.so")
ImageProcessing.by_texture = cdll.LoadLibrary("imageprocessing/searchByTexture.so")

ImageProcessing.by_color.getColorHistogram.argtypes = [POINTER(POINTER(POINTER(c_int))), c_int, c_int]
ImageProcessing.by_color.getColorHistogram.restype = POINTER(c_float)
ImageProcessing.by_color.free_ptr.argtypes = [POINTER(c_float)]

ImageProcessing.by_texture.getTextureComponents.argtypes = [POINTER(POINTER(POINTER(c_int))), c_int, c_int]
ImageProcessing.by_texture.getTextureComponents.restype = POINTER(c_float)
ImageProcessing.by_texture.free_ptr.argtypes = [POINTER(c_float)]

