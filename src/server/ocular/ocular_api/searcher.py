from .models import SearchRequest, SearchResult
from PIL import Image
from typing import List

class Searcher:
    def generateHash(image: Image) -> str:
        
        return ""
    
    def getSearchResult(data: SearchRequest) -> List[SearchResult]:
        

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

        result: list[SearchResult] = []
        for i in range(50):
            sr = SearchResult()
            sr.hash = "123"
            sr.image_url = "/media/cat demo.jpg"
            sr.priority = 0
            result.append(sr)
        
        return result

    