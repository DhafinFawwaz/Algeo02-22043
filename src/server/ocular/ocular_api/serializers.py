from rest_framework import serializers
from .models import SearchRequest
from .models import SearchResult
class SearchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchRequest
        fields = ["hash", "image_request","search_type"]

class SearchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchResult
        fields = ["hash", "image_url"]