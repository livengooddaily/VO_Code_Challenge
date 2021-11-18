from test_app_1.models import *

class TestObjectCreator:
    def create_test_objects(self):
        self.delete_existing_objects()
        self.create_skus()
        self.create_warehouses()
        self.create_purchase_orders()
        self.create_plain_carton_line_items()
        self.make_some_ajustments_to_data()

    def delete_existing_objects(self):
        Warehouse.objects.all().delete()
        Purchase_Order.objects.all().delete()
        SKU.objects.all().delete()
        Plain_Carton_Line_Item.objects.all().delete()

    def create_skus(self):
        self.sku1 = SKU.objects.create(
            sku="flip_flops_green",
            required_pcs_fba_send_in_GERMANY=40,
            required_pcs_fba_send_in_FRANCE=32,
        )

        self.sku2 = SKU.objects.create(
            sku="flip_flops_blue",
            required_pcs_fba_send_in_GERMANY=5,
            required_pcs_fba_send_in_FRANCE=50,
        )

        self.sku3 = SKU.objects.create(
            sku="flip_flops_yellow",
            required_pcs_fba_send_in_GERMANY=5,
            required_pcs_fba_send_in_FRANCE=6,
        )

        self.sku4 = SKU.objects.create(
            sku="flip_flops_red",
            required_pcs_fba_send_in_GERMANY=0,
            required_pcs_fba_send_in_FRANCE=0,
        )

    def create_warehouses(self):
        self.wh1 = Warehouse.objects.create(
            warehouse_name="Mountain Warehouse"
        )
        self.wh2 = Warehouse.objects.create(
            warehouse_name="Beach Warehouse"
        )
        self.wh3 = Warehouse.objects.create(
            warehouse_name="City Warehouse"
        )

    def create_purchase_orders(self):
        self.po1_wh1 = Purchase_Order.objects.create(
            order_name="Big Order May 2021",
            warehouse=self.wh1,
            status="Received",
        )

        self.po2_wh1 = Purchase_Order.objects.create(
            order_name="Quick Order Sep 2021",
            warehouse=self.wh1,
            status="Shipped",
        )

        self.po1_wh2 = Purchase_Order.objects.create(
            order_name="Small Order Apr 2021",
            warehouse=self.wh2,
            status="Ordered",
        )

        self.po2_wh2 = Purchase_Order.objects.create(
            order_name="Self Produced Stock Mai 2021",
            warehouse=self.wh2,
            status="Received",
        )


        self.po1_wh3 = Purchase_Order.objects.create(
            order_name="Future Order Dec 2021",
            warehouse=self.wh3,
            status="Planned",
        )

        self.po2_wh3 = Purchase_Order.objects.create(
            order_name="Urgent Stock Mai 2021",
            warehouse=self.wh3,
            status="Received",
        )

    def create_plain_carton_line_items(self):
        sku_objs = SKU.objects.all()
        pos = Purchase_Order.objects.all()

        for sku_obj in sku_objs:
            for po in pos:
                Plain_Carton_Line_Item.objects.create(
                    purchase_order=po,
                    qty_cartons=5,
                    cartons_left_cached=5,
                    sku_obj=sku_obj,
                    pcs_per_carton=10,
                )


    def make_some_ajustments_to_data(self):
        Plain_Carton_Line_Item.objects.filter(purchase_order__status="Received").update(cartons_left_cached=4)
        Plain_Carton_Line_Item.objects.filter(sku_obj_id=self.sku3.id, purchase_order__warehouse_id=self.wh3.id).delete()
        Plain_Carton_Line_Item.objects.filter(sku_obj_id=self.sku2.id, purchase_order__warehouse_id=self.wh2.id).delete()
        Plain_Carton_Line_Item.objects.filter(sku_obj_id=self.sku1.id, purchase_order__warehouse_id=self.wh1.id).delete()
