$('[data-toggle="tooltip"]').tooltip();


function updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false, table_id = "") {
  $(".loader-wrapper").fadeIn("slow");
  data['csrfmiddlewaretoken'] = csrfmiddlewaretoken
  $.ajax({
    method: 'POST',
    url: url,
    data: data,
    success: function () {
      if (table_id.length > 0) {
        $("#" + table_id).DataTable().ajax.reload();
      }
      if (redirect_url.length > 0) {
        window.location = redirect_url;
      } else if (refresh_var) {
        setTimeout(
          function () {
            location.reload();
          }, 500);
      } else {
        $(".loader-wrapper").fadeOut("slow");
      }
    }
  })
}


function bind_event_to_close_popover_when_clicked_somewhere_else() {
  $("html").on("mouseup", function (e) {
    var l = $(e.target);
    if (l[0].className.indexOf("popover") == -1) {
      $(".popover").each(function () {
        $(this).popover("hide");
        $("html").unbind( "mouseup" );
      });
    }
  });
}

function redirect_blank(url) {
  var a = document.createElement('a');
  a.target="_blank";
  a.href=url;
  a.click();
}

function dt_button_collection_close() {
  $(".dt-button-collection").toggle()
  $(".dt-button-background").toggle()
  $("body").click()
}

function btn_select_unselect_in_datatable(table_id) {
    dt = $("#"+table_id).DataTable()
    if ($(this).hasClass("selected")) {
      $(this).removeClass("fas").addClass("far")
      dt.rows({page: 'current'}).deselect();
    } else {
      $(this).removeClass("far").addClass("fas")
      dt.rows({page: 'current'}).select();
    }
    $(this).toggleClass("selected")
}



function reload_datatable(table_id) {
  $('#' + table_id).DataTable().ajax.reload()
}


function register_datatable_sums_functionality() {
  jQuery.fn.dataTable.Api.register('sum()', function () {
    return this.flatten().reduce(function (a, b) {
      if (typeof a === 'string') {
        a = a.replace(/[^\d.-]/g, '') * 1;
      }
      if (typeof b === 'string') {
        b = b.replace(/[^\d.-]/g, '') * 1;
      }

      return a + b;
    }, 0);
  });
}


function register_order_neutral() {
  $.fn.dataTable.Api.register( 'order.neutral()', function () {
      return this.iterator( 'table', function ( s ) {
          s.aaSorting.length = 0;
          s.aiDisplay.sort( function (a,b) {
              return a-b;
          } );
          s.aiDisplayMaster.sort( function (a,b) {
              return a-b;
          } );
      } );
  } );
}



function get_field_data_from_current_dt_row(result_field_name, current_td_node) {
  var closest_dt = current_td_node.closest("table").DataTable()
  var current_row = closest_dt.cell(current_td_node).index()["row"]
  result = closest_dt.cell(current_row, result_field_name + ":name").data()
  return result
}

function set_field_data_from_current_dt_row(new_value, target_field_name, current_td_node) {
  var closest_dt = current_td_node.closest("table").DataTable()
  var current_row = closest_dt.cell(current_td_node).index()["row"]
  closest_dt.cell(current_row, target_field_name + ":name").data(new_value)
}

function bind_tooltip() {
  $('[data-toggle="tooltip"]').tooltip();
}


function get_input_html(id, name, value, type, additional_spec="", disabled=false) {
  if(type === "number"){
    min_value_str = "min=0"
  } else{
    min_value_str = ""
  }

  if (disabled){
      return `<div class="${additional_spec}"><div class="input-group" >
      <input type="${type}" disabled  name="${name}" ${min_value_str} class="form-control input_change"
      title=""
      id="${id}"
      value="${value}"
      required="">
      </div></div>`
  } else {
    return `<div class="${additional_spec}"><div class="input-group" onclick="show_changes_btn.call(this)">
      <input type="${type}"  name="${name}" ${min_value_str} class="form-control input_change" onchange="show_changes_btn.call(this)"
      title=""
      id="${id}"
      value="${value}"
      required="">
      </div></div>`
  }
}


function get_po_status_badge_dropdown_html(row) {

  var dropdown = $(`<div class="dropdown show ml-2" style="cursor: pointer; ">
            <span  class="badge mr-2 p-2 dropdown-toggle selected_badge" style="min-width: 90%; min-height: 80%" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">
                           ${po_status_translation_dict[row["status"]]}
                   </span>

        <div class="dropdown-menu p-2" aria-labelledby="dropdownMenuLink">
            <span class="">${gettext("Set order status:")}</span>
                <span class="badge badge-secondary dropdown-item mt-1 p-2" name="change_po_status" 
                      onclick="change_po_status.call(this)"
                      data-po_id="${row["purchase_order_id"]}" data-status="Planned">${gettext("Planned")}</span>
                <span class="badge badge-light dropdown-item mt-1 p-2" name="change_po_status"
                      onclick="change_po_status.call(this)"
                      data-po_id="${row["purchase_order_id"]}" data-status="Ordered">${gettext("Ordered")}</span>
                <span class="badge badge-primary dropdown-item mt-1 p-2" name="change_po_status"
                      onclick="change_po_status.call(this)"
                      data-po_id="${row["purchase_order_id"]}" data-status="Shipped">${gettext("Shipped")}</span>
                <span class="badge badge-success dropdown-item mt-1 p-2" name="change_po_status"
                      onclick="change_po_status.call(this)"
                      data-po_id="${row["purchase_order_id"]}" data-status="Received">${gettext("Received")}</span>
        </div>`);

  if (row["status"] === "Received") {
    $(dropdown).find('.dropdown-menu').remove();
    $(dropdown).find('.dropdown-toggle').toggleClass('dropdown-toggle');
  }


  return dropdown.prop('outerHTML');

}

function open_popover_unit_selection() {
  var current_unit = $(this).data('current_unit')
  var target_field = $(this).data('target_field')
  var d, w, m = ""
  if (current_unit === "d") {
    d = "checked"
  } else if (current_unit === "w") {
    w = "checked"
  } else {
    m = "checked"
  }
  $(".tooltip").tooltip('hide')
  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: gettext("Select unit for reach numbers:"),
    html: true,
    sanitize: false,
    content: `<div>
<!--                            {#<label class="mr-sm-2" for="inlineFormCustomSelect">Select how you would like the reach number to be displayed:</label>#}-->
                <div class="custom-control custom-radio mt-2">
                  <input type="radio" class="custom-control-input" id="radio_select_Days" name="unit_selection" ${d}>
                  <label class="custom-control-label" for="radio_select_Days">${gettext("Days")}</label>
                </div>
  
                <div class="custom-control custom-radio">
                  <input type="radio" class="custom-control-input" id="radio_select_Weeks" name="unit_selection" ${w}>
                  <label class="custom-control-label" for="radio_select_Weeks">${gettext("Weeks")}</label>
                </div>
  
                <div class="custom-control custom-radio">
                  <input type="radio" class="custom-control-input" id="radio_select_Months" name="unit_selection"} ${m}>
                  <label class="custom-control-label" for="radio_select_Months">${gettext("Months")}</label>
                </div>
            </div>
            <div class="mt-2">
                <button  onclick="change_unit.call(this)" data-target_field="${target_field}" class="btn btn-sm btn-success mr-2 mb-2">${gettext("Confirm")}</button>
                <button  onclick="$(this).closest('.popover').remove()" class="btn btn-sm btn-danger mb-2">${gettext("Cancel")}</button>
            </div>
`
  }).popover('show')
}



function get_remove_from_selection_button_html(onclick_func_remove, obj_id, text="Remove") {
  return `
          <button class="btn btn-danger" 
                    type="button" 
                    onclick="${onclick_func_remove}" 
                    style="cursor:pointer;" 
                    name="remove_from_selection" 
                    data-obj_id="${obj_id}" 
                    title="${gettext("Remove from selection")}" >
             <i class="fas fa-trash text-white" ></i> ${gettext(text)}
             </button>
          `
}

function get_add_to_selection_button_html(onclick_func, obj_id, text=null, disabled=false) {
    if (text === null){
    text = gettext("Add")
  }
    if(disabled === true){
      return `
          <button class="btn btn-success"
                  type="button"
                  onclick="${onclick_func}"
                  style="cursor:pointer;"
                  name="add_to_selection"
                  data-obj_id="${obj_id}"
                  disabled
                  title="${gettext("Add to selection")}" >
           <i class="fas fa-plus-circle text-white" ></i>  ${text}
           </button>
          `
    }
  return `
          <button class="btn btn-success" 
                  type="button" 
                  onclick="${onclick_func}" 
                  style="cursor:pointer;" 
                  name="add_to_selection" 
                  data-obj_id="${obj_id}" 
                  title="${gettext("Add to selection")}" >
           <i class="fas fa-plus-circle text-white" ></i>  ${text} 
           </button>
          `
}
function get_after_add_to_selection_button_html(onclick_func, obj_id, text=null) {
  if (text === null){
    text = gettext("Add")
  }
  return `
          <button class="btn btn-secondary mr-1" 
                  type="button" 
                  onclick="${onclick_func}" 
                  style="cursor:pointer;" 
                  name="add_to_selection" 
                  data-obj_id="${obj_id}" 
                  title="${gettext("Add to selection")}">
           <i class="fas fa-plus-circle text-white" ></i> ${text}
           </button>
          `
}



function get_after_added_to_selection_button_html(onclick_func_add, onclick_func_remove, obj_id) {
  return `
            ${get_after_add_to_selection_button_html(onclick_func_add, obj_id)}
            ${get_remove_from_selection_button_html(onclick_func_remove, obj_id)}
          `
}


function get_remove_from_selection_pill_button_mc_html(onclick_func_remove, obj_id) {
  return `
          <span class="badge badge-pill bg-danger d-flex align-items-center text-white" 
                onclick="${onclick_func_remove}"
                style="cursor:pointer;" 
                name="remove_mixed_carton_to_fba_send_in" 
                data-obj_id="${obj_id}"
                title="${gettext("Remove mixed carton")}">
              <i class="m-1 my-2 fa fa-trash text-center" ></i> ${gettext("Remove Mixed Carton")} 
          </span>
          `
}

function get_add_to_selection_pill_button_mc_html(onclick_func_add, obj_id) {
  return `
          <span class="badge badge-pill bg-success d-flex align-items-center text-white" 
                onclick="${onclick_func_add}"
                style="cursor:pointer;" 
                name="add_mixed_carton_to_fba_send_in" 
                data-obj_id="${obj_id}"
                title="${gettext("Add mixed carton to FBA send-in")}">
              <i class="m-1 my-2 fa fa-plus text-center" ></i> ${gettext("Add Mixed Carton")}
          </span>
          `
}

function bind_modal_dt_columns_adujst_event(modal_id) {
  $(`#${modal_id}`).on('shown.bs.modal', function (e) {
    $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();
  });
}

function bind_refresh_on_model_hide_event(modal_id, refresh_url) {
  $(`#${modal_id}`).on('hide.bs.modal', function (e) {
    window.location = refresh_url
  });
}


po_status_translation_dict = {
  "Planned" : gettext("Planned") ,
  "Ordered" : gettext("Ordered") ,
  "Shipped" : gettext("Shipped") ,
  "Received" : gettext("Received") ,
}

event_log_translation_dict = {
"Purchase Order": gettext("Purchase Order",),
"FBA Send In": gettext("FBA Send In",),
"Not found": gettext("Not found",),
"Cancelled FBA Send In": gettext("Cancelled FBA Send In",),
}

  // $('#btn_select_visible_rows').on('click', function () {
  //   var table_id = $(this).data('table_id')
  //   dt = $("#"+table_id).DataTable()
  //   if ($(this).hasClass("selected")) {
  //     $(this).removeClass("fas").addClass("far")
  //     dt.rows({page: 'current'}).deselect();
  //   } else {
  //     $(this).removeClass("far").addClass("fas")
  //     dt.rows({page: 'current'}).select();
  //   }
  //   $(this).toggleClass("selected")
  // });


function ShipmentStatus_to_color_mapper(ShipmentStatus) {
  if (ShipmentStatus === "WORKING") {
    return "warning"
  } else if (ShipmentStatus === "SHIPPED") {
    return "primary"
  } else if (ShipmentStatus === "RECEIVING") {
    return "success"
  } else if (ShipmentStatus === "DELETED") {
    return "danger"
  } else if (ShipmentStatus === "NON_EXISTENT") {
    return "light"
  }else if (ShipmentStatus === "DELIVERED") {
    return "success"
  } else if (ShipmentStatus === "CLOSED") {
    return " bg-white"
  }


}

function Purchase_Order_Status_to_color_mapper(status) {
  if (status === "Received") {
    return "success"
  } else if (status === "Ordered") {
    return " table-primary"
  } else if (status === "Shipped") {
    return "primary"
  } else if (status === "Planned") {
    return "secondary"
  }

}


function reach_cat_td_coloring_and_title(td, reach_cat) {
  if (reach_cat === "Out of Stock") {
    $(td).find("div").addClass('badge-dark');
    $(td).find("div").attr("title", gettext("Out of stock"));
  }
  if (reach_cat === "Critical") {
    $(td).find("div").addClass('table-danger');
    $(td).find("div").attr("title", gettext("Critical stock level - reach less than lead time, OOS likely"));
  }
  if (reach_cat === "Low") {
    $(td).find("div").addClass('table-warning');
    $(td).find("div").attr("title", gettext("Low stock level - stock should be replenished in order to maintain target reach"));
  }
  if (reach_cat === "Good") {
    $(td).find("div").addClass('badge-success');
    $(td).find("div").attr("title", gettext("Good stock level"));
  }
  if (reach_cat === "High") {
    $(td).find("div").addClass('table-primary');
    $(td).find("div").attr("title", gettext("High stock level"));
  }
  if (reach_cat === "Overstock") {
    $(td).find("div").addClass('badge-primary');
    $(td).find("div").attr("title", gettext("Overstock"));
  }
}

var basic_sku_info_columns = [
  {"data": "small_image_url", "name": "small_image_url", className: "small_image_url"},
  {"data": "cat_product_type", "name": "cat_product_type", className: "cat_product_type ", visible: false},
  {"data": "cat_color", "name": "cat_color", className: "cat_color ", visible: false},
  {"data": "cat_size", "name": "cat_size", className: "cat_size ", visible: false},
  {"data": "cat_shape", "name": "cat_shape", className: "cat_shape ", visible: false},
  {"data": "variation_name", "name": "variation_name", className: "variation_name ", visible: false},
  {"data": "amz_title", "name": "amz_title", className: "amz_title ", visible: false, width: "40%"},
  {"data": "sku", "name": "sku", className: "sku "},
  {"data": "FNSKU", "name": "FNSKU", className: "FNSKU"},
  {"data": "ASIN", "name": "ASIN", className: "ASIN", visible: false},
  {"data": "amz_product_id", "name": "amz_product_id", className: "amz_product_id", visible: false},
  {"data": "custom_product_id", "name": "custom_product_id", className: "custom_product_id", visible: false},
  {"data": "Parent_ASIN", "name": "Parent_ASIN", className: "Parent_ASIN", visible: false},
];

var basic_sku_info_columns_sku_database = [
  {"data": "small_image_url", "name": "small_image_url", className: "small_image_url"},
  {"data": "cat_product_type", "name": "cat_product_type", className: "cat_product_type "},
  {"data": "cat_color", "name": "cat_color", className: "cat_color "},
  {"data": "cat_size", "name": "cat_size", className: "cat_size "},
  {"data": "cat_shape", "name": "cat_shape", className: "cat_shape ", visible: false},
  {"data": "variation_name", "name": "variation_name", className: "variation_name ", visible: false},
  {"data": "amz_title", "name": "amz_title", className: "amz_title ", visible: true, width: "40%"},
  {"data": "sku", "name": "sku", className: "sku "},
  {"data": "FNSKU", "name": "FNSKU", className: "FNSKU"},
  {"data": "ASIN", "name": "ASIN", className: "ASIN", visible: true},
  {"data": "amz_product_id", "name": "amz_product_id", className: "amz_product_id", visible: false},
  {"data": "custom_product_id", "name": "custom_product_id", className: "custom_product_id", visible: false},
  {"data": "Parent_ASIN", "name": "Parent_ASIN", className: "Parent_ASIN", visible: false},
];

// default_dom = "Bfrtip";
var default_dom = "<'row mt-1'<'col-sm-12 col-md-9 mb-2 'B><'col-sm-12 col-md-3'f>>" +
        "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>" +
        "<'row'<'col-sm-12 col-md-12'l>>";

var dom_w_search_panes = "<'row'<'col-sm-12 col-md-12 m-0 mb-2 p-0' P>>" +
        "<'row mt-1'<'col-sm-12 col-md-5 mb-2 'B><'col-sm-12 col-md-7'f>>" +
        "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>" +
        "<'row'<'col-sm-12 col-md-12'l>>";

var default_select = {
        style: 'multi+shift',
        selector: 'td:first-child'
      };

var default_fixedHeader = {
      headerOffset: $('#navbar-container').outerHeight()
    };

var default_language = {
    "decimal": gettext("."),
    "emptyTable": gettext("No data available in table"),
    "info": gettext("Showing _START_ to _END_ of _TOTAL_ entries"),
    "infoEmpty": gettext("Showing 0 to 0 of 0 entries"),
    "infoFiltered": gettext("(filtered from _MAX_ total entries)"),
    // "infoPostFix": gettext(""),
    "thousands": gettext(","),
    "lengthMenu": gettext("Show _MENU_ entries"),
    "loadingRecords": gettext("Loading..."),
    "processing": gettext("Processing..."),
    "search": gettext("Search:"),
    "zeroRecords": gettext("No matching records found"),
    "paginate": {
      "first": gettext("First"),
      "last": gettext("Last"),
      "next": gettext("Next"),
      "previous": gettext("Previous"),
    },
    "aria": {
      "sortAscending": gettext(": activate to sort column ascending"),
      "sortDescending": gettext(": activate to sort column descending"),
    }
};

var def_dt_settings = {
    "select": default_select,
    "language": default_language,
    "dom": default_dom,
    "fixedHeader": default_fixedHeader,
    "stateSave": true,
    "stateDuration": 0,
    "bPaginate": false,
    "info": false,
    "bFilter": true,
    "scrollX": true
};

var def_dt_settings_for_scroller = {
    "select": default_select,
    "language": default_language,
    "dom": default_dom,
    "stateSave": true,
    "stateDuration": 0,
    "bPaginate": false,
    "info": false,
    "bFilter": true,
    "scrollX": true,
    "scrollY": "75vh",
};

var minimal_dt_settings = {
    "language": default_language,
    "lengthChange": false,
    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": false,
};


var column_Def_small_image_url =
   {
        "targets": "small_image_url",
        "data": "small_image_url",
        "width": "20px",
        "orderable": false,
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).addClass("p-0")
        },
        "render": function (data, type, row) {
          return `<div class="d-flex justify-content-center m-0"><img
                        src="${row["small_image_url"]}"
                        data-toggle="popover-hover"
                        data-img="${row["small_image_url"]}"
                        style="cursor: pointer" 
                        onclick="redirect_blank('${get_img_url_base()}/dp/${row["ASIN"]}')"
                        width="35px" 
                        height="35px"
                        >
                    </div>`
        },
      };

var btn_column_selection =  {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
      };

function create_column_map(columns) {
  var col_idx = {};
  $.each(columns, function (index, value) {
    col_idx[value["name"]] = index
  });
  return col_idx
}



function tags_creator_fba_send_ins(row) {
  var div_c = $('<div class="d-flex align-items-center"></div>')

  if(row["def_amz_prep_instructions_labelling"] === "AMAZON"){
    label = `<span class="badge badge-pill badge-warning p-2" data-toggle="tooltip" title="${gettext("FNSKU barcodes will be attached by Amazon (Prep. instruction)")}"><i class="fas fa-barcode mr-1"></i>${gettext("AMZ Labeling")}</span>`
    $(div_c).append(label)
  }

  return div_c.prop('outerHTML');
}

function format_number(n, decimals=0) {
  return (n).toLocaleString('en-US', {maximumFractionDigits: decimals, minimumFractionDigits: decimals})
}


function init_fba_stock_details_table_html(sku_id) {

  return `<table class="table table-sm">
    <thead>
    <tr>
        <th>${gettext("Status")}</th>
        <th>${gettext("PCS")}</th>
        <th>${gettext("CBM")}</th>
    </tr>
    </thead>

    <tbody>
    <tr id="fba_stock_fulfillable_${sku_id}">
        <td>${gettext("Fulfillable")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_unsellable_${sku_id}">
        <td>${gettext("Unsellable")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_reserved_${sku_id}">
        <td>${gettext("Reserved")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>



    <tr id="fba_stock_inbound_working_${sku_id}">
        <td>${gettext("Inbound working")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_inbound_shipped_${sku_id}">
        <td>${gettext("Inbound shipped")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_inbound_receiving_${sku_id}">
        <td>${gettext("Inbound receiving")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_inbound_manual_correction_${sku_id}" class="text-dark">
        <td>${gettext("Inbound Manual Correction")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    <tr id="fba_stock_total_${sku_id}" class="font-weight-bold">
        <td>${gettext("Total")}</td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
        <td>
            <div class="spinner-grow text-secondary" role="status">
                <span class="sr-only">${gettext("Loading...")}</span>
            </div>
        </td>
    </tr>

    </tbody>
</table>`
}



function fill_fba_stock_detail_table(sku_id, fba_stock_dict) {
 $(`#fba_stock_fulfillable_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_fulfillable"]["pcs"])
  $(`#fba_stock_unsellable_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_unsellable"]["pcs"])
  $(`#fba_stock_reserved_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_reserved"]["pcs"])
  // $(`#fba_stock_warehouse_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_warehouse"]["pcs"])
  $(`#fba_stock_inbound_working_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_inbound_working"]["pcs"])
  $(`#fba_stock_inbound_shipped_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_inbound_shipped"]["pcs"])
  $(`#fba_stock_inbound_receiving_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_inbound_receiving"]["pcs"])
  $(`#fba_stock_inbound_manual_correction_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_inbound_manual_correction"]["pcs"])
  $(`#fba_stock_total_${sku_id} > td:nth-child(2)`).html(fba_stock_dict["fba_stock_total"]["pcs"])

  $(`#fba_stock_fulfillable_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_fulfillable"]["cbm"])
  $(`#fba_stock_unsellable_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_unsellable"]["cbm"])
  $(`#fba_stock_reserved_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_reserved"]["cbm"])
  // $(`#fba_stock_warehouse_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_warehouse"]["cbm"])
  $(`#fba_stock_inbound_working_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_inbound_working"]["cbm"])
  $(`#fba_stock_inbound_shipped_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_inbound_shipped"]["cbm"])
  $(`#fba_stock_inbound_receiving_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_inbound_receiving"]["cbm"])
  $(`#fba_stock_inbound_manual_correction_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_inbound_manual_correction"]["cbm"])
  $(`#fba_stock_total_${sku_id} > td:nth-child(3)`).html(fba_stock_dict["fba_stock_total"]["cbm"])
}


function open_popover_fba_stock_detail_table(sku_id, fba_source_marketplace) {

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: gettext("FBA Stock Details:"),
    html: true,
    sanitize: false,
    content: init_fba_stock_details_table_html(sku_id)
  }).popover('show')

  bind_event_to_close_popover_when_clicked_somewhere_else()

  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "sku_id": sku_id,
      "fba_source_marketplace": fba_source_marketplace,
      "chart_id": "current_fba_stock_chart_individual_sku",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      fill_fba_stock_detail_table(sku_id, data["chart_data"]["fba_stock_dict"])
    }
  })
}


function refresh_page_cache(page_name, page_id=null) {
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "action": "refresh_page_cache",
      "page_name" : page_name,
      "page_id" : page_id,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $('#header_cache_button_container').html(`
      <button class="btn btn-outline-light cache_update_button"
                data-toggle="tooltip"
                data-html="true"
                title="${gettext('The data is currently being updated..')}">
            <div class="spinner-border  text-dark" role="status"></div>
        </button>
      `);
      cache_update_status = "running";
      check_refresh_page_cache_status(page_name, page_id);
      $('[data-toggle="tooltip"]').tooltip();
    $(".tooltip").tooltip('hide');
    },
    error:function(){
      alert(gettext("Error. Something went wrong."))
    }
  })
}

function check_refresh_page_cache_status(page_name, page_id=null) {
  fetch(ajax_call_url + "check_refresh_page_cache_status/", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-CSRFToken": csrfmiddlewaretoken
    },
    body: JSON.stringify({
      "page_name": page_name,
      "page_id": page_id,
    }),
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data.data.status)
      var status = data.data.status;
      if (status === "running") {
        setTimeout(check_refresh_page_cache_status, 1000, page_name, page_id);
      } else if (status === "completed" && status !== cache_update_status){
         cache_update_status =status;
         window.location = refresh_url
      } else if (status === "failed" && status !== cache_update_status){
         cache_update_status =status;
         window.location = refresh_url
      } else {
      }

    });
  });
}

function get_date_picker_input_html(id, name, value) {
  return `<div class=""><div class="input-group date">
    <input type="text" name="${name}" class="form-control input_change" onclick="show_changes_btn.call(this)"
    title="" 
    id="${id}"
    value="${value}" 
    required="" 
    dp_config="{
    &quot;id&quot;: &quot;dp_4&quot;, 
    &quot;picker_type&quot;: &quot;DATE&quot;, 
    &quot;linked_to&quot;: null, 
    &quot;options&quot;: 
    {&quot;showClose&quot;: false, 
      &quot;showClear&quot;: false, 
      &quot;showTodayButton&quot;: false, 
      &quot;format&quot;: &quot;YYYY-MM-DD&quot;}
      }">
    </div></div>`
}


function get_re_order_suggestion_pcs_cell_content(row) {
  var div_c = $(`<div class="d-flex justify-content-center align-items-center"
                         style="cursor: pointer; "></div>`);
  if (row["reorder_pcs_suggest_raw"] !== row["suggested_re_order_pcs__display__before_moq"]) {
    $(div_c).append(`<span>${row["reorder_pcs_suggest_raw"]}</span>`);

    $(div_c).append(`<span class="ml-1 text-secondary"
                            data-toggle="tooltip"
                            title="${gettext("Suggestion without MOQ restrictions")}" 
                            style="border-bottom: 1px dotted; cursor: pointer;"
                            onclick="open_popover_reorder_suggested_pcs_calc_table.call(this, ${row["obj_id"]})" >
                        (${row["suggested_re_order_pcs__display__before_moq"]})
                      </span>`);
  } else {
    $(div_c).append(`<span class="ml-1" style="border-bottom: 1px dotted;"
                           onclick="open_popover_reorder_suggested_pcs_calc_table.call(this, ${row["obj_id"]})" style="cursor: pointer">
                            ${row["reorder_pcs_suggest_raw"]}
                      </span>`);
  }
  return div_c.prop('outerHTML');
}


function open_popover_reorder_suggested_pcs_calc_table(sku_id) {

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: gettext("Suggested re-order calculation:"),
    html: true,
    sanitize: false,
    content: init_reorder_suggested_pcs_calc_table_html(sku_id)
  }).popover('show')

  bind_event_to_close_popover_when_clicked_somewhere_else()

  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "sku_id": sku_id,
      "chart_id": "reorder_suggested_pcs_calc_table",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      $(`#container_reorder_suggested_pcs_calc_table_${sku_id}`).html(data["table_html"])
      $('[data-toggle="tooltip"]').tooltip({container:"body"});
    }
  })
}

function init_reorder_suggested_pcs_calc_table_html(sku_id) {
    return `<div id="container_reorder_suggested_pcs_calc_table_${sku_id}">
              <div class="d-flex justify-content-center p-5">
                <div class="spinner-grow text-secondary" role="status">
                    <span class="sr-only">${gettext("Loading...")}</span>
                </div>
              </div>
            </div>`
}

function save_invisible_columns_as_default_to_db(idx_dict, datatable_id) {

  invisible_column_names = get_invisible_column_names(idx_dict, datatable_id)
  // console.log(invisible_column_names)
  var data = {
              'action': "save_invisible_columns_as_default_to_db",
              'dt_table': datatable_id,
              'invisible_column_names':JSON.stringify(invisible_column_names),
            }
  var url = "/ajax_call/"
  updatePOST(url, data, headers={}, redirect_url="", refresh_var=true)
}


function get_invisible_column_names(idx_dict, datatable_id){
  dt = $(`#${datatable_id}`).DataTable()

  list_of_invisible_columns_names = []
  for (const [ col_name, col_idx ] of Object.entries(idx_dict)) {
    if (dt.columns(col_idx).visible()[0] === false){
      list_of_invisible_columns_names.push(col_name)
    }
  }
 return list_of_invisible_columns_names
}

function add_search_for_server_side_table(dt_id){
        $(dt_id+'_wrapper .dataTables_filter input').unbind().hide();
            var self = this.api(),
            searchContainer = $('<div class="input-group mb-3 col-10"></div>'),
            input = $('<input type="text" class="form-control mx-0" ></input>'),
            searchButton = $('<div class="input-group-append"><button class="btn btn-light py-1"><i class="fas fa-arrow-right"></i></button></div>')
                       .click(function() {
                          self.search(input.val()).draw();
                       });
        searchContainer.append(input);
        searchContainer.append(searchButton);
        $(dt_id+'_wrapper .dataTables_filter').addClass("row");
        $(dt_id+'_wrapper .dataTables_filter').append(searchContainer);
        $(dt_id+'_wrapper .dataTables_filter input').bind('keypress', function (e)
                        {
                            if (e.which == 13) {
                                self.search($(this).val()).draw();
                            }
                        });
        $(dt_id+'_wrapper .dataTables_filter label').addClass("col-2 py-2 px-0").css('text-align','right')

        $(dt_id+'_wrapper .dataTables_filter input').val(self.search())

}

function get_img_url_base(mp="not_spefified"){
  if(mp === "not_spefified"){
    mp = selected_amazon_region;
  }

  var mapping = {
    "amazon.de": "https://www.amazon.de",
    "EU": "https://www.amazon.de",
    "amazon.fr": "https://www.amazon.fr",
    "amazon.it": "https://www.amazon.it",
    "amazon.es": "https://www.amazon.es",
    "amazon.co.uk": "https://www.amazon.co.uk",
    "amazon.com": "https://www.amazon.com",
    "US": "https://www.amazon.com",
  }

  return mapping[mp]
}