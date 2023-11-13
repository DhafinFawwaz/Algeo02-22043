from ctypes import cdll, CDLL, c_void_p, c_int, c_float, c_double, POINTER
from .apps import ImageProcessing

ImageProcessing.by_color = cdll.LoadLibrary("imageprocessing/searchByColor.so")
ImageProcessing.by_texture = cdll.LoadLibrary("imageprocessing/searchByTexture.so")

ImageProcessing.by_color.getColorHistogram.argtypes = [POINTER(POINTER(POINTER(c_int))), c_int, c_int]
ImageProcessing.by_color.getColorHistogram.restype = POINTER(c_int)
ImageProcessing.by_color.free_ptr.argtypes = [POINTER(c_int)]

ImageProcessing.by_texture.getTextureComponents.argtypes = [POINTER(POINTER(POINTER(c_int))), c_int, c_int]
ImageProcessing.by_texture.getTextureComponents.restype = POINTER(c_double)
ImageProcessing.by_texture.free_ptr.argtypes = [POINTER(c_double)]

ImageProcessing.calc_similarity.calcSimilarity.argtypes = [POINTER(c_int), POINTER(c_int), c_int]
ImageProcessing.calc_similarity.calcSimilarity.restype = c_double

