from ctypes import cdll, CDLL

class ImageProcessing():
    by_color: CDLL = None
    by_texture: CDLL = None
    cos_sim: CDLL = None
