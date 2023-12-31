# todo/todo_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
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
        print(search_type)
        
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
            }, status=status.HTTP_200_OK)
        
        if not is_hash_exist:
            print("Saving search request and results")
            start = time()
            SearchResult.objects.bulk_create(search_result_list)

            print("Saving search result took", time()-start, "seconds")

            # dont save the image
            search_request.image_request = None
            search_request.save()
            
        else:
            print("Return cached search result")
        
        
        serialized_data = SearchResultSerializer(search_result_list, many=True).data
        response = {
            'data': serialized_data,
            'pdf_url': ""
        }

        return Response(response, status=status.HTTP_201_CREATED)
    

    # untuk debug
    def get(self, request, *args, **kwargs):
        all_data = SearchRequest.objects.all()

        # region hash =======================
        hash = request.query_params.get('hash')
        if(hash):
            print("Get search result by hash")
            all_data = all_data.filter(hash=hash)
            searchResJson = SearchRequestSerializer(all_data, many=True).data
            return Response(searchResJson, status=status.HTTP_200_OK)
        # endregion hash =======================
        
        print("Get all search result")
        # region get all =======================
        limit = int(request.query_params.get('limit'))
        is_reverse = request.query_params.get('reverse') == 'true'

        if is_reverse:
            all_data = all_data.order_by('-id')

        if limit:
            all_data = all_data[:limit]
        # endregion get all =======================

        
        searchResJson = SearchRequestSerializer(all_data, many=True).data
        return Response(searchResJson, status=status.HTTP_200_OK)

class SearchResultApiView(APIView):
    permission_classes = [permissions.AllowAny]

    # untuk debug
    def get(self, request, *args, **kwargs):
        all_data = SearchResult.objects.all()

        # region hash =======================
        hash = request.query_params.get('hash')
        if(hash):
            print("Get search result by hash")
            all_data = all_data.filter(hash=hash)
            searchResJson = SearchResultSerializer(all_data, many=True).data
            return Response(searchResJson, status=status.HTTP_200_OK)
        # endregion hash =======================
        
        print("Get all search result")
        # region get all =======================
        limit = int(request.query_params.get('limit'))
        is_reverse = request.query_params.get('reverse') == 'true'

        if is_reverse:
            all_data = all_data.order_by('-id')

        if limit:
            all_data = all_data[:limit]
        # endregion get all =======================

        
        searchResJson = SearchResultSerializer(all_data, many=True).data
        return Response(searchResJson, status=status.HTTP_200_OK)

class UploadDatasetApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        all_data = DataSet.objects.all()
        limit = int(request.query_params.get('limit'))
        is_reverse = request.query_params.get('reverse') == 'true'
        
        if is_reverse:
            all_data = all_data.order_by('-id')

        if limit:
            all_data = all_data[:limit]
        
        list_dataset_serializer = DataSetSerializer(all_data,many=True)
        return Response(list_dataset_serializer.data, status=status.HTTP_201_CREATED)
    
    
    def post(self, request, *args, **kwargs):

        is_overwrite = int(request.data.get('is_overwrite'))
        if is_overwrite:
            print("Overwriting dataset")
            start = time()
            DataSet.objects.all().delete()
            print(time()-start, " | Deleting all dataset")
        else:
            print("Appending dataset")

        image_list = request.data.getlist('images')
        if image_list[0] == '': # can happen because of the way FormData works
            image_list.pop(0)

        # Delete semua SearchResult
        start = time()
        Uploader.delete_all_request_result()
        print(time()-start, " | Deleting all search request & result")

        start = time()
        Uploader.saveImages(image_list)
        print(time()-start, " | Saving images")

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

class PDFApiView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, JSONParser]

    def post(self, request, *args, **kwargs):
        
        print("[Saving PDF]")
        hash = request.data.get('hash')

        try:
            search_request = SearchRequest.objects.get(hash=hash)
            if search_request.pdf_result:
                print("PDF already exist")
                response = {
                    'pdf_url': "/media/result/"+hash+".pdf"
                }
                return Response(response, status=status.HTTP_201_CREATED)
        except:
            pass

        # get all search result with hash
        search_result_list = SearchResult.objects.all().filter(hash=hash)

        start = time()
        pdf_result = Searcher.getPDFfromImageUrls(search_result_list)
        print(time()-start, " | Generating PDF")

        start = time()
        search_request = SearchRequest.objects.get(hash=hash)
        search_request.pdf_result = pdf_result
        search_request.save()
        print(time()-start, " | Updating SearchRequest PDF File")

        response = {
            'pdf_url': "/media/result/"+hash+".pdf"
        }
        return Response(response, status=status.HTTP_201_CREATED)

    
        # delete all SearchResult



