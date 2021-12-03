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
        self.calculated_suggestions = self.calculate_suggestions()

    def domain_warehouse_suggestion(self, domain, warehouse):
        try:
            return self.calculated_suggestions[domain]['source_warehouses'][warehouse.id]['carton_qty_for_matrix']
        except KeyError as e:
            print(e)
            return 0

    def calculate_suggestions(self):
        """
        The class should output a dict like this (slide 4)
        """
        results = {}
        amazon_warehouse_count = self.get_amazon_fba_warehouse_count()
        ###
        # 5. Germany has priority over France. Pcs requirements of Germany need to be fulfilled first
        # Ranked dictionary takes care of this.
        ###
        for i in range(amazon_warehouse_count):
            amazon_warehouse = self.amazon_fba_warehouse_priority[i]
            result = {
                "source_warehouses": self.source_warehouses(amazon_warehouse=amazon_warehouse)
            }
            results[amazon_warehouse] = result

        return results

    def source_warehouses(self, amazon_warehouse):
        results = {}
        for source_warehouse in self.unique_source_warehouses():
            # Nice to have (Additional detail level) Slide 4
            source_warehouse_purchase_orders = {
                "skus_that_need_to_be_send": self.skus_that_need_to_be_sent(
                    amazon_warehouse=amazon_warehouse,
                    source_warehouse=source_warehouse
                )
            }
            source_warehouse_purchase_orders["carton_qty_for_matrix"] = self.carton_qty_for_matrix(
                source_warehouse_purchase_orders
            )
            results[source_warehouse.id] = source_warehouse_purchase_orders
        return results

    def carton_qty_for_matrix(self, source_warehouse_pos: dict):
        total_carton_quantity = 0
        for purchase_order in source_warehouse_pos["skus_that_need_to_be_send"]:
            pclis = source_warehouse_pos["skus_that_need_to_be_send"][purchase_order]["plain_carton_line_items"]
            for pcli in pclis:
                total_carton_quantity += pclis[pcli]["qty_cartons_in_plan"]
        return total_carton_quantity

    def skus_that_need_to_be_sent(self, amazon_warehouse, source_warehouse):
        return {
            purchase_order.id: {
                "plain_carton_line_items": self.plain_carton_line_items(
                    amazon_warehouse=amazon_warehouse,
                    purchase_order=purchase_order
                )
            } for purchase_order in self.unique_purchase_orders()
            if purchase_order.warehouse is source_warehouse
        }

    def plain_carton_line_items(self, amazon_warehouse, purchase_order):
        return {
            pcli.id: {
                "id": pcli.id,
                "qty_cartons_in_plan": pcli.calculate_suggested_send_in_amount(
                    attribute_name=self.AMAZON_WAREHOUSE_ATTRIBUTE_MAPPING[amazon_warehouse]
                )
            } for pcli in self.plain_carton_line_items_by_purchase_order(purchase_order)
        }

    def get_amazon_fba_warehouse_count(self):
        return len(self.amazon_fba_warehouse_priority.keys())

    def plain_carton_line_items_by_purchase_order(self, purchase_order):
        return set([pcli for pcli in self.in_stock_line_items if pcli.purchase_order == purchase_order])

    def unique_source_warehouses(self):
        return set([pcli.warehouse for pcli in self.in_stock_line_items])

    def unique_purchase_orders(self):
        return set([pcli.purchase_order for pcli in self.in_stock_line_items])



