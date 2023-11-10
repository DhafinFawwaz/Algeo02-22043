# todo/todo_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image, ImageDraw
from typing import List, Tuple
from django.conf import settings

from .models import SearchRequest, SearchResult, DataSet
from .serializers import SearchRequestSerializer, SearchResultSerializer, DataSetSerializer
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

    def get(self, request, *args, **kwargs):
        
        data = {
            'image_url': "",
            'texture_components': [5.3452,2.1243,1.123],
            'color_histogram': [5.00,2.15,1.123,6.111,2.543,3.12,10.523],
        }
        dataset_serializer = DataSetSerializer(data=data)

        if not dataset_serializer.is_valid():
            return Response(dataset_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            all_data = DataSet.objects.all()
            list_dataset_serializer = DataSetSerializer(all_data,many=True)
            return Response(list_dataset_serializer.data, status=status.HTTP_201_CREATED)
        
    def post(self, request, *args, **kwargs):
        
        current_image = request.data.get('images[0]')
        images = [current_image]
        i = 1
        while current_image:
            current_image = request.data.get('images['+str(i)+']')
            images.append(current_image)
            i += 1
        print(images)
        return Response("", status=status.HTTP_201_CREATED)
    
        # delete all SearchResult

