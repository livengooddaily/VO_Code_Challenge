from django.db import models

# Create your models here.


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

