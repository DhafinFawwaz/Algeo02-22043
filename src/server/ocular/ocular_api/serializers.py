from rest_framework import serializers
from .models import SearchRequest, SearchResult, DataSet
class SearchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchRequest
        fields = ["hash", "image_request","search_type"]

class SearchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchResult
        fields = ["hash", "image_url"]

class DataSetSerializer(serializers.ModelSerializer):
    texture_components = serializers.ListField(child=serializers.FloatField())
    color_histogram = serializers.ListField(child=serializers.FloatField())

    class Meta:
        model = DataSet
        fields = ["image_request", "texture_components", "color_histogram"]