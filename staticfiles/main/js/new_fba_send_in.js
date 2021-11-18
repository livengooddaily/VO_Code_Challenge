$(document).ready(function () {
    if(new_fba_send_in === "True"){
        sync_def_email_settings_and_shipfromaddress_for_warehouse();
    }
});

function sync_def_email_settings_and_shipfromaddress_for_warehouse(){

    warehouse_id = $("#id_warehouse").val();
    select_def_email_settings_and_shipfromaddress(warehouse_id);

    $("#id_warehouse").on('change', function() {
       warehouse_id = this.value
      select_def_email_settings_and_shipfromaddress.call(this, warehouse_id)
    });

}

function select_def_email_settings_and_shipfromaddress(warehouse_id){

    for(warehouse of warehouses){

        if(warehouse.id == warehouse_id){

            $("#id_default_email_settings").val(warehouse.default_email_settings_id);
            $("#id_inbound_shipment_shipfromaddress").val(warehouse.inbound_shipment_shipfromaddress_id);
        }
    }

}