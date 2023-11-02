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

        sr1 = SearchResult()
        sr1.hash = "123"
        sr1.image_url = "/media/No.jpg"
        sr1.priority = 0

        sr2 = SearchResult()
        sr2.hash = "345"
        sr2.image_url = "/media/cat demo.jpg"
        sr2.priority = 1
        
        result = []
        result.append(sr1)
        result.append(sr2)

        return result

    