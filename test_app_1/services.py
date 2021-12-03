from test_app_1.models import Plain_Carton_Line_Item


class FBASendInSuggestionService:
    """
    Accepts a dictionary of key=priority level 0..n, value=domain name (i.e amazon.de).
    Domain names are mapped with SKU attributes to retreive correct required_pcs_fba_send_in
    attributes.
    ---------------------------------------
    CALCULATIONS
    required_pcs_fba_send_in (RPFSI)
    cartons_left_cached (CLC)
    Ideal Cartons     (IC) = ceil(RPFSI/CLC)
    Remaining Cartons (RC) = (CLC - IC) if satisfiable else 0
    Suggested Cartons (SC) = IC if CLC >= IC else RC
    Total = sum(SC per source warehouse)
    """
    AMAZON_WAREHOUSE_ATTRIBUTE_MAPPING = {
        "amazon.de": 'required_pcs_fba_send_in_GERMANY',
        "amazon.fr": 'required_pcs_fba_send_in_FRANCE',
    }

    def __init__(self, amazon_fba_warehouse_priority: dict):
        """
        Initialize class with amazon domain priorty dict, in_stock pcli query and ensure all warehouses are mapped
        to an SKU attribute.
        """
        self.amazon_fba_warehouse_priority = amazon_fba_warehouse_priority
        self.in_stock_line_items = Plain_Carton_Line_Item.objects.in_stock()
        for domain in amazon_fba_warehouse_priority.values():
            if domain not in self.AMAZON_WAREHOUSE_ATTRIBUTE_MAPPING.keys():
                raise Exception(f"DOMAIN UNRECOGNIZED, MAP {domain} TO AN SKU OBJECT ATTRIBUTE TO RESOLVE")

    def calculate_suggestions(self):
        pass

    def source_warehouses(self):
        pass

    def carton_qty_for_matrix(self):
        pass

    def skus_that_need_to_be_sent(self):
        pass

    def plain_carton_line_items(self):
        pass


