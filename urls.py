
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:page_name>", views.load_static_page, name="static_page")
]
