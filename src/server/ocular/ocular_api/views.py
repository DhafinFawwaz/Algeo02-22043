# todo/todo_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image, ImageDraw
from typing import List, Tuple
from django.conf import settings

from .models import SearchRequest, SearchResult
from .serializers import SearchRequestSerializer, SearchResultSerializer
from .searcher import Searcher
from django.core.files.uploadedfile import InMemoryUploadedFile


class SearchRequestApiView(APIView):
    # add permission to check if user is authenticated
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        image_request_data: InMemoryUploadedFile = request.data.get('image')
        image_request_data.seek(0)
        search_type: int = request.data.get('search_type')

        reqData = {
            'hash': Searcher.generateHash(image_request_data,search_type), 
            'image_request': image_request_data, 
            'search_type': search_type, 
        }
        image_request_data.seek(0) # reset cursor. prevent error invalid_image
        
        search_request: SearchRequest = SearchRequest()
        search_request.image_request = reqData.get("image_request")
        search_request.hash = reqData.get("hash")
        search_request.search_type = reqData.get("search_type")

        (search_result_list,is_hash_exist) = Searcher.getSearchResult(search_request)
        response_result: dict[str, str|int] = []

        serializerRequest = SearchRequestSerializer(data=reqData)
        if not serializerRequest.is_valid():
            return Response(serializerRequest.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            for search_result in search_result_list:
                resData = {
                    'hash': search_result.hash,
                    'image_url': search_result.image_url
                }
                serializerResult = SearchResultSerializer(data=resData)

                if not serializerResult.is_valid():
                    return Response(serializerResult.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    response_result.append(resData)
                    if not is_hash_exist:
                        serializerResult.save()

        if not is_hash_exist:
            print("Saving search request")
            serializerRequest.save()
        else:
            print("Return cached search result")
        return Response(response_result, status=status.HTTP_201_CREATED)
    

    # untuk debug
    def get(self, request, *args, **kwargs):
        searchReq = SearchRequest.objects.all()
        searchReqJson = SearchRequestSerializer(searchReq, many=True).data
        return Response(searchReqJson, status=status.HTTP_200_OK)
    

class SearchResultApiView(APIView):
    permission_classes = [permissions.AllowAny]

    # untuk debug
    def get(self, request, *args, **kwargs):
        hash = request.query_params.get('hash')
        if(not hash):
            searchRes = SearchResult.objects.all()
            searchResJson = SearchResultSerializer(searchRes, many=True).data
            return Response(searchResJson, status=status.HTTP_200_OK)
        
        searchRes = SearchResult.objects.filter(hash=hash)
        searchResJson = SearchResultSerializer(searchRes, many=True).data
        return Response(searchResJson, status=status.HTTP_200_OK)

class UploadDatasetApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        image_request_data = request.data.get('image')
        print(image_request_data)
