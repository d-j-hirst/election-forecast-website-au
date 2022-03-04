from django.db import models
from datetime import datetime

class Tag(models.Model):
    name = models.CharField(max_length=64)
    
    def __str__(self):
        return self.name

class Commentary(models.Model):
    tags = models.ManyToManyField(Tag)

    date = models.DateTimeField()

    title = models.TextField()

    text = models.TextField()
    
    def __str__(self):
        return self.title