from django.db import models

class SearchRequest(models.Model):
    hash = models.TextField(default="", blank=True) # sama dengan hash di search result. jadi kaya id
    image_request = models.ImageField(upload_to="requested") # literally image nya

    def __str__(self):
        return self.task
    
class SearchResult(models.Model):
    hash = models.TextField(default="", blank=True) # untuk optimisasi
    image_url = models.TextField(default="", blank=True) # yg bisa diakses secara publik url_backend+image_url
    priority = models.IntegerField(default=0) # untuk sorting

    def __str__(self):
        return self.task