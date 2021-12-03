import math

from django.db import models

# Create your models here.
from test_app_1.managers import PlainCartonLineItemManager


class SKU(models.Model):
    sku = models.CharField(max_length=300)
    required_pcs_fba_send_in_GERMANY = models.IntegerField(default=0) # Prio 1
    required_pcs_fba_send_in_FRANCE = models.IntegerField(default=0) # Prio 2

    def __str__(self):
        return self.sku[:50]

class Warehouse(models.Model):
    warehouse_name = models.CharField(max_length=300)

    def __str__(self):
        return self.warehouse_name[:50]

class Purchase_Order(models.Model):
    order_name = models.CharField(max_length=300)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True,
                                  default=None)
    status = models.CharField(max_length=20, default="Planned", choices=(
        ("Planned", "Planned"),
        ("Ordered", "Ordered"),
        ("Shipped", "Shipped"),
        ("Received", "Received"),
    )
                              )

    def __str__(self):
        return self.order_name[:50]

class Plain_Carton_Line_Item(models.Model):
    purchase_order = models.ForeignKey(Purchase_Order, on_delete=models.CASCADE)
    qty_cartons = models.PositiveIntegerField(default=0)
    cartons_left_cached = models.IntegerField(null=True, default=None)
    sku_obj = models.ForeignKey(SKU, on_delete=models.SET_NULL, null=True, default=None)
    pcs_per_carton = models.PositiveIntegerField(default=0)
    objects = PlainCartonLineItemManager()

    @property
    def warehouse(self):
        return self.purchase_order.warehouse

    def calculate_ideal_cartons_to_fulfill_pcli(self, required_pcs_fba_send_in):
        return math.ceil(float(required_pcs_fba_send_in) / float(self.pcs_per_carton))

    def satisfies_required_cartons(self, ideal_cartons_to_fulfill_pcli):
        return True if ideal_cartons_to_fulfill_pcli <= self.cartons_left_cached else False

    def use_all_cartons_left_cached(self):
        result = self.cartons_left_cached
        self.cartons_left_cached = 0
        return result

    def calculate_suggested_send_in_amount(self, attribute_name):
        """
        Suggest send in amount for specific domain name / country based on current cartons_left_cached.
        If min cartons to fulfill PCLI can be satisfied, remove amount from cartons_left_cached and
        return as suggested send in amount.  Otherwise remove and return all remaining cartons_left_cached.
        """
        required_pcs = self.sku_obj.__getattribute__(attribute_name)
        ideal_carton_amt = self.calculate_ideal_cartons_to_fulfill_pcli(required_pcs)
        if self.satisfies_required_cartons(ideal_carton_amt):
            self.cartons_left_cached -= ideal_carton_amt
            return ideal_carton_amt
        else:
            return self.use_all_cartons_left_cached()

# Example output of class:
# {
#     "amazon.de": {
#         "source_warehouses": {
#             1 : {
#                 "carton_qty_for_matrix": 15,
#                 "skus_that_need_to_be_send": { -- skus_to_send or skus_that_need_to_be_sent would be grammatically correct
#                     1 : {
#                         "plain_carton_line_items": {
#                             123: {"id": 123, "qty_cartons_in_plan": 3},
#                             456: {"id": 456, "qty_cartons_in_plan": 6},
#                         }
#                     },
#                     2 : {
#                         "plain_carton_line_items": {
#                             789: {"id": 789, "qty_cartons_in_plan": 5},
#                             845: {"id": 845, "qty_cartons_in_plan": 1},
#                         }
#                     },
#                     ...
#                 },
#             ...
#             }
#         }
#     },
#     ...
# }
