from django.shortcuts import render
from django.core.paginator import Paginator

def index(request):
    return render(request, "physics/index.html")

def load_static_page(request, page_name):
    lessons = ["gravity", "newtons-law", "drag-and-friction", "conservation", "buoyancy"]
    data = {}
    if page_name in lessons:
        page_index = lessons.index(page_name)
        data = {
            "lessons": lessons, 
            "page_index": page_index + 1,
        }    

        # If there is a next page then add it to data
        if page_index + 1 != len(lessons):
            data.update({"next": lessons[page_index + 1]})

        # If there is a previous page then add it to data
        if page_index != 0:
            data.update({"prev": lessons[page_index - 1]})

    return render(request, f"physics/{page_name}.html", data)

def get_posts_data(lesson):
    lessons = ["gravity", "newtons-law", "drag-and-friction", "conservation", "buoyancy"]
    p = Paginator(lessons, 1)
    page_number = lessons.index(lesson)     # Get the page number
    page = p.page(page_number)              # Get the page object
    page_posts = page.object_list

    posts_user_ratings_dict = {post: get_rating_value(post, request.user) for post in page_posts}

    return {
        "posts_user_ratings_dict": posts_user_ratings_dict,
        "page_obj": page
    }