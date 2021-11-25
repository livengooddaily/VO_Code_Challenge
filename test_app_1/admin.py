from django.contrib import admin

# Register your models here.
from test_app_1.models import SKU, Warehouse, Purchase_Order, Plain_Carton_Line_Item

admin.site.register(SKU)
admin.site.register(Warehouse)
admin.site.register(Purchase_Order)
admin.site.register(Plain_Carton_Line_Item)
