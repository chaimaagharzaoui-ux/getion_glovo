from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def frontend_home(request):
    return render(request, 'index.html')


def swift_demo(request):
    return render(request, 'swift_demo.html')
