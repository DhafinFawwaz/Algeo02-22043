# todo/todo_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image, ImageDraw
from typing import List
from django.conf import settings

from .models import SearchRequest, SearchResult
from .serializers import SearchRequestSerializer, SearchResultSerializer
from .searcher import Searcher

class SearchRequestApiView(APIView):
    # add permission to check if user is authenticated
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        image_request_data:Image = request.data.get('image')
        image_request_data.seek(0)

        reqData = {
            'hash': Searcher.generateHash(image_request_data), 
            'image_request': image_request_data, 
        }
        
        search_request: SearchRequest = SearchRequest()
        search_request.image_request = reqData.get("image_request")
        search_request.hash = reqData.get("hash")

        search_result_list: List[SearchResult] = Searcher.getSearchResult(search_request)
        response_result: dict[str, str|int] = []

        serializerRequest = SearchRequestSerializer(data=reqData)
        if not serializerRequest.is_valid():
            return Response(serializerRequest.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            
            for search_result in search_result_list:
                resData = {
                    'hash': search_result.hash,
                    'image_url': search_result.image_url,
                    'priority': search_result.priority
                }
                serializerResult = SearchResultSerializer(data=resData)

                if not serializerResult.is_valid():
                    return Response(serializerResult.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    response_result.append(resData)
                    serializerResult.save()

        serializerRequest.save()
        return Response(response_result, status=status.HTTP_201_CREATED)
    

    # untuk debug
    def get(self, request, *args, **kwargs):

        searchReq = SearchRequest.objects.all()
        serializer = SearchRequestSerializer(searchReq)
        return Response(serializer.data, status=status.HTTP_200_OK)