from django.conf.urls import url, include
from django.urls import path
from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^ajax_get_table_data/$', views.ajax_get_table_data, name='ajax_get_table_data'),
]