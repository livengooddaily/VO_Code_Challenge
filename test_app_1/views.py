import json

from django.http import HttpResponse
from django.shortcuts import render

from test_app_1.models import Warehouse
from test_app_1.services import FBASendInSuggestionService


def index(request):
    return render(request, 'test_page.html')


def ajax_get_table_data(request):
    response_dict = []
    action = request.POST.get('action', '')
    ###
    # 5. Germany has priority over France. Pcs requirements of Germany need to be fulfilled first
    # 7. Dynamic Implementation. Should work for different values and constellations
    # Uncertain how the prioritization should or does occur.  Storing required_pcs_fba_send_in
    # as an SKU attribute requires some sort of mapping to the ranking for it to be dynamic.
    # Implementation uses dictionary for ranking and maps domains to SKU attributes.
    ###

    amazon_fba_warehouse_priority = {
        0: "amazon.de",
        1: "amazon.fr"
    }

    if action == "dt_sugg_fba_send_ins":
        suggestions = FBASendInSuggestionService(amazon_fba_warehouse_priority)
        warehouses = Warehouse.objects.all()
        for wh in warehouses:
            response_dict.append({
                "warehouse_id": wh.id,
                "warehouse": wh.warehouse_name,
                ###
                # 6. Aggregated results values should be able to fill the correct values in the Matrix in the
                # screenshot (Front End)
                ###
                "amazon_de": suggestions.domain_warehouse_suggestion('amazon.de', wh),
                "amazon_fr": suggestions.domain_warehouse_suggestion('amazon.fr', wh),

            })

    return HttpResponse(json.dumps({"data": response_dict}), content_type='application/json')