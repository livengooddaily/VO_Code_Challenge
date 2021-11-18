import json

from django.http import HttpResponse
from django.shortcuts import render

from test_app_1.models import Warehouse


def index(request):
    return render(request, 'test_page.html')


def ajax_get_table_data(request):
    response_dict = []
    action = request.POST.get('action', '')


    if action == "dt_sugg_fba_send_ins":
        warehouses = Warehouse.objects.all()
        for wh in warehouses:
            response_dict.append({
                "warehouse_id": wh.id,
                "warehouse": wh.warehouse_name,
                "amazon_de": 0,
                "amazon_fr": 1,

            })

    return HttpResponse(json.dumps({"data": response_dict}), content_type='application/json')