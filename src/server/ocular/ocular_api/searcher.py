from django.http import HttpResponseBadRequest
from .models import SearchRequest, SearchResult
from PIL import Image
from typing import List, Tuple
import hashlib
from django.core.files.uploadedfile import InMemoryUploadedFile

class Searcher:
    def generateHash(image_file: InMemoryUploadedFile, search_type: str) -> str:
        image_content = image_file.read()
        hash_input = f"{image_content}{search_type}".encode('utf-8')
        sha256_hash = hashlib.sha256(hash_input).hexdigest()
        print("Hash generated:", sha256_hash)
        return sha256_hash
    
    def getSearchResult(data: SearchRequest) -> Tuple[List[SearchResult],bool]:
        
        
        
        return ([],True)

        
        # Kalau data.hash ada di database, ambil semua image yang punya hash yang sama, returnkan
        is_hash_exist: bool = SearchRequest.objects.filter(hash=data.hash).exists()
        if is_hash_exist:
            return (SearchResult.objects.filter(hash=data.hash),is_hash_exist)

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
        for i in range(15):
            sr = SearchResult()
            sr.hash = data.hash
            sr.image_url = "/media/cat demo.jpg"
            result.append(sr)
        
        return (result, is_hash_exist)

    