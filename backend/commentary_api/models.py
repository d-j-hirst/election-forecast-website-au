from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=64)
    
    def __str__(self):
        return self.name

class Commentary(models.Model):
    # Author-selected identity shared across servers. Existing article links
    # continue to use their original numeric IDs, including articles from admin.
    publication_key = models.SlugField(max_length=100, null=True, blank=True, unique=True)
    tags = models.ManyToManyField(Tag)

    date = models.DateTimeField()

    title = models.TextField()

    text = models.TextField()
    
    def __str__(self):
        return self.title