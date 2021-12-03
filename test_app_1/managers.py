from django.db import models


class PlainCartonLineItemManager(models.Manager):
    warehouse = 'purchase_order__warehouse'
    all_related = 'purchase_order', 'sku_obj', warehouse

    def get_queryset(self):
        return super().get_queryset().all()

    def in_stock(self):
        """
        Acceptance criteria:
            3. Only Cartons with Purchase Order status “Received” are really in stock and can be used.
        Bonus:
            1. Write code with minimal amount of database hits
        """
        return self.get_queryset() \
            .filter(purchase_order__status="Received") \
            .select_related(*self.all_related)
