from django.db import models

class SearchRequest(models.Model):
    hash = models.TextField(default="", blank=True, db_index=True) # sama dengan hash di search result. jadi kaya id
    image_request = models.ImageField(upload_to="requested") # literally image nya
    search_type = models.IntegerField(default=0) # 0 untuk by texture, 1 untuk by color
    pdf_result = models.FileField(upload_to="result") # literally pdf nya

    def __str__(self):
        return self.task
    
class SearchResult(models.Model):
    hash = models.TextField(default="", blank=True) # untuk optimisasi
    image_url = models.TextField(default="", blank=True) # yg bisa diakses secara publik url_backend+image_url

    def __str__(self):
        return self.task
    
    
class DataSet(models.Model):
    image_request = models.ImageField(upload_to="dataset") # literally image nya
    texture_components = models.JSONField(default=list) # texture components: [contrast,dissimilarity,homogeneity,ASM,entropy,energy]
    color_histogram = models.JSONField(default=list) # color histogram: list[72]

    def __str__(self):
        return self.task