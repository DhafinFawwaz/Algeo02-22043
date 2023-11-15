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

from multiprocessing import Pool
from time import time
from .uploader import Uploader

class SearchRequestApiView(APIView):
    # add permission to check if user is authenticated
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        image_request_data: InMemoryUploadedFile = request.data.get('image')
        image_request_data.seek(0)
        search_type: int = request.data.get('search_type')

        
        search_request: SearchRequest = SearchRequest()
        search_request.image_request = image_request_data
        search_request.hash = Searcher.generateHash(image_request_data,search_type)
        search_request.search_type = search_type

        image_request_data.seek(0) # reset cursor. prevent error invalid_image becase of generateHash

        (search_result_list,is_hash_exist) = Searcher.getSearchResult(search_request)

        if len(search_result_list) == 0:
            return Response({
                'data': [],
                'pdf_url': ""
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not is_hash_exist:
            print("Saving search request and results")
            start = time()
            SearchResult.objects.bulk_create(search_result_list)

            print("Saving search result took", time()-start, "seconds")
            
            # search_request.pdf_result = Searcher.getPDFfromImageUrls(search_result_list)
            # search_request.save()
        else:
            print("Return cached search result")
        
        
        serialized_data = SearchResultSerializer(search_result_list, many=True).data
        response = {
            'data': serialized_data,
            'pdf_url': "/media/result/"+search_request.hash+".pdf"
        }

        return Response(response, status=status.HTTP_201_CREATED)
    

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
        all_data = DataSet.objects.all()
        if request.query_params.get('limit'):
            limit = int(request.query_params.get('limit'))
            all_data = all_data[:limit]
        
        start_time = time()
        list_dataset_serializer = DataSetSerializer(all_data,many=True)
        print("Serializing took", time()-start_time, "seconds")
        return Response(list_dataset_serializer.data, status=status.HTTP_201_CREATED)
    
    
    def post(self, request, *args, **kwargs):

        is_overwrite = int(request.data.get('is_overwrite'))
        if is_overwrite:
            print("Overwriting dataset")
            start = time()
            DataSet.objects.all().delete()
            print("Deleting all dataset took", time()-start, "seconds")
        else:
            print("Appending dataset")

        image_list = request.data.getlist('images')
        if image_list[0] == '': # can happen because of the way FormData works
            image_list.pop(0)

        # Delete semua SearchResult
        start = time()
        SearchResult.objects.all().delete()
        print("Deleting all search result took", time()-start, "seconds")

        start = time()
        Uploader.saveImages(image_list)
        print("Saving images took", time()-start, "seconds")

        return Response("", status=status.HTTP_201_CREATED)
    
        # delete all SearchResult

class ScrapDatasetApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        
        web_url = request.data.get('web_url')

        (new_dataset_list, status) = Uploader.scrapImages(web_url)
        response = {
            'data': [],
        }

        for dataset in new_dataset_list:
            resData = {
                'hash': "",
                'image_url': dataset.image_request.url,
                'similarity': 0,
            }
            response['data'].append(resData)
        

        # return Response(response, status=status)
        return Response(response, status=status)

    
        # delete all SearchResult

