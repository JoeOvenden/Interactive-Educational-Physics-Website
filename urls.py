
from django.urls import path

from . import views

app_name = "physics"

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:page_name>", views.load_static_page, name="static_page")
]
