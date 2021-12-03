from django.test import TestCase

# Create your tests here.
from test_app_1.core.create_test_objects import TestObjectCreator


class AmazonFBASendInSuggestionTestCase(TestCase):
    """
    __init__
    pcs_per_carton = 10
    cartons_left_cached = 4
    -----------------------------------------------------------------------------------
    required_pcs_fba_send_in (RPFSI)
    cartons_left_cached (CLC)
    Ideal Cartons     (IC) = ceil(RPFSI/CLC)
    Remaining Cartons (RC) = (CLC - IC) if satisfiable else 0
    Suggested Cartons (SC) = IC if CLC >= IC else RC
    Total = sum(SC per source_warehouse)
    -----------------------------------------------------------------------------------
    PO's with status "received":
    WH | POs     | PCLIs                                                         | Subtotal | Total
    1  | 7,13,19 | Germany: [IC=1,RC=3,SC=1], [IC=1,RC=3,SC=1], [IC=0,RC=4,SC=0] |    2     |
       |         | France : [IC=5,RC=0,SC=3], [IC=1,RC=2,SC=1], [IC=0,RC=4,SC=0] |    4     |  6
    2  | 4,16,22 | Germany: [IC=4,RC=0,SC=4], [IC=1,RC=3,SC=1], [IC=0,RC=4,SC=0] |    5     |
       |         | France : [IC=4,RC=0,SC=0], [IC=1,RC=2,SC=1], [IC=0,RC=4,SC=0] |    1     |  6
    3  | 6,12,24 | Germany: [IC=4,RC=0,SC=4], [IC=1,RC=3,SC=1], [IC=0,RC=4,SC=0] |    5     |
       |         | France : [IC=4,RC=0,SC=0], [IC=5,RC=0,SC=3], [IC=0,RC=4,SC=0] |    3     |  8
    """

    def setUp(self):
        factory = TestObjectCreator()
        factory.create_skus()
        factory.create_warehouses()
        factory.create_purchase_orders()
        factory.create_plain_carton_line_items()
        factory.make_some_ajustments_to_data()
        self.POST_data = {'action': 'dt_sugg_fba_send_ins'}
        self.test_results = {
            1: {"amazon_de": 2, "amazon_fr": 4},
            2: {"amazon_de": 5, "amazon_fr": 1},
            3: {"amazon_de": 5, "amazon_fr": 3},
        }

    def test_amazon_fba_send_in_suggestions(self):
        response = self.client.post(
            path='/ajax_get_table_data/',
            data=self.POST_data
        ).json()
        for warehouse in response["data"]:
            warehouse_id = warehouse["warehouse_id"]
            test_result = self.test_results[warehouse_id]

            germany_suggestion = test_result["amazon_de"]
            self.assertEquals(warehouse["amazon_de"], germany_suggestion)

            france_suggestion = test_result["amazon_fr"]
            self.assertEquals(warehouse["amazon_fr"], france_suggestion)





