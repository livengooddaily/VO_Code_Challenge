var sku_obj_id;
var modal_dt_id;

$(document).ready(function () {
  import_select_visible_button();
  initialize_active_skus_table();
  bind_events();
  on_load_open_correct_tab_by_id(tab_id);


});


function get_dt_active_skus_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis",}];
  $.merge(columns, basic_sku_info_columns_sku_database);
  $.merge(columns, [
      {"data": "child_skus", "name": "child_skus", className: "child_skus" },
      {"data": "aggregated_to_parent_sku__sku", "name": "aggregated_to_parent_sku__sku", className: "aggregated_to_parent_sku__sku" },
      {"data": "custom_product_id", "name": "custom_product_id", className: "custom_product_id", },
      {"data": "def_product_name_for_invoice", "name": "def_product_name_for_invoice", className: "def_product_name_for_invoice", },
      {"data": "def_c_length", "name": "def_c_length", className: "dt-center def_c_length def_carton_info", },
      {"data": "def_c_width", "name": "def_c_width", className: "dt-center def_c_width def_carton_info", },
      {"data": "def_c_height", "name": "def_c_height", className: "dt-center def_c_height def_carton_info", },
      {"data": "def_c_weight", "name": "def_c_weight", className: "dt-center def_c_weight def_carton_info", },
      {"data": "def_pcs_per_carton", "name": "def_pcs_per_carton", className: "def_pcs_per_carton dt-center def_carton_info" , },
      {"data": "def_purchase_price", "name": "def_purchase_price", className: "def_purchase_price", },
      {"data": "def_landed_cost_EUR", "name": "def_landed_cost_EUR", className: "def_landed_cost_EUR", },
      {"data": "sales_last_30_days_manual", "name": "sales_last_30_days_manual", className: "sales_last_30_days_manual dt-center calc_data", },
      {"data": "max_allowed_send_in_pcs", "name": "max_allowed_send_in_pcs", className: "max_allowed_send_in_pcs dt-center calc_data", },
      {"data": "min_fba_stock", "name": "min_fba_stock", className: "min_fba_stock dt-center min_fba_stock ", },
      {"data": "moq", "name": "moq", className: "moq dt-center", },
      {"data": "product_dimensions", "name": "product_dimensions", className: "product_dimensions ", },
      {"data": "amz_fulfillment_type", "name": "amz_fulfillment_type", className: "amz_fulfillment_type ", },
      {"data": "fba_size_category", "name": "fba_size_category", className: "fba_size_category ", },
      {"data": "fulfillment_network_settings", "name": "fulfillment_network_settings", className: "fulfillment_network_settings", },
      {"data": "fba_send_in_priority_asc", "name": "fba_send_in_priority_asc", className: "fba_send_in_priority_asc"},
      {"data": "to_be_notified_email", "name": "to_be_notified_email", className: "to_be_notified_email"},
      { "name": "actions", className: "actions noVis", width:"100px"},
  ]);

  return columns
}


function get_dt_active_skus_config() {
  var columns = get_dt_active_skus_columns();
  get_ci_as = create_column_map(columns);

  var dt_active_skus_config = {
    "processing": true,
      "language": {
         "processing": gettext("Loading...")
      },
    "serverSide": true,
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      "data": function ( d ) {
        data = {}
        data.json = JSON.stringify(d)
        data.action = "get_active_skus";
        data.csrfmiddlewaretoken = csrfmiddlewaretoken;
        return data;
      }
    },

    // Search Button
    initComplete : function() {
        dt_id = '#dt_active_skus';
        add_search_for_server_side_table.call(this, dt_id)
    },


    rowGroup: {
      dataSrc: ["cat_product_type"]
    },
    orderFixed: [get_ci_as["cat_product_type"], 'asc'],
    "order": [[get_ci_as["cat_product_type"], "asc"], [get_ci_as["cat_size"], "asc"]],

    "columnDefs": [
      {
        "targets": get_ci_as["obj_id"],
        "data": "obj_id",
        "width": "10px",
        "orderable": false,
        "render": function (data, type, row) {
          return ``
        },
      },
      {
        "targets": [
            "obj_id",
            "actions",
            "fba_size_category",
            "fulfillment_network_settings",
            "product_dimensions",
            "variation_name"
        ],
        "searchable":false
      },
      {
        "targets": [
            "obj_id",
            "actions",
            "fba_size_category",
            "fulfillment_network_settings",
            "product_dimensions",
            "variation_name"
        ],
        "orderable":false
      },
      {
        "targets": "amz_title",
        "data": "amz_title",
        "width": "610px",
        "render": function (data, type, row) {
          if (data !== null){
            return `<div style="width: 600px; white-space: normal;">${data}</div>`
          } else{
            return ""
          }
        },
      },
      {
          "targets": "small_image_url",
          "data": "small_image_url",
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).addClass("py-1")
        },
          "render": function (data, type, row) {
            return `<a target="_blank" href="${get_img_url_base()}/dp/${row["ASIN"]}"><img class="m-0" width="50px" src="${data}" alt=""></a>`
          },
        },
      {
        "targets": "cat_product_type",
         "data": "cat_product_type",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "cat_product_type"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "text", additional_spec=' width="100px"')
          } else {
            return data
          }
        },
      },
      {
        "targets": "cat_color",
         "data": "cat_color",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "cat_color"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "text")
          } else {
            return data
          }
        },
      },
      {
        "targets": "cat_size",
         "data": "cat_size",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "cat_size"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "text")
          } else {
            return data
          }
        },
      },
       {
        "targets": "cat_shape",
         "data": "cat_shape",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "cat_shape"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "text")
          } else {
            return data
          }
        },
      },
      {
        "targets": "custom_product_id",
         "data": "custom_product_id",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "custom_product_id"
            var id = row["obj_id"] + "-" + name;
            var value = data;
            return get_input_html(id, name, value, "text")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_product_name_for_invoice",
         "data": "def_product_name_for_invoice",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_product_name_for_invoice"
            var id = row["obj_id"] + "-" + name;
            var value = data;
            return get_input_html(id, name, value, "text")
          } else {
            return data
          }
        },
      },
      {
        "targets": "product_dimensions",
        "data": "product_dimensions",
        "type": "num",
        "createdCell": function (td, cellData, rowData, row, col) {
          if (rowData["man_height_in_cm"] === 0 || rowData["man_length_in_cm"] === 0 ||
            rowData["man_width_in_cm"] === 0 || rowData["man_weight_in_kg"] === 0 || rowData["man_height_in_cm"] === null
            || rowData["man_length_in_cm"] === null || rowData["man_width_in_cm"] === null || rowData["man_weight_in_kg"] === null) {
            $(td).addClass("table-danger")
          }

        },
        "render": function (data, type, row) {
            var product_dimensions_str = `${row["man_height_in_cm"]} x ${row["man_length_in_cm"]} x ${row["man_width_in_cm"]} cm | ${row["man_weight_in_kg"]} kg`;

            if (row["man_height_in_cm"] === 0 || row["man_length_in_cm"] === 0 ||
              row["man_width_in_cm"] === 0 || row["man_weight_in_kg"] === 0 || row["man_length_in_cm"] === null ||
              row["man_width_in_cm"] === null || row["man_weight_in_kg"] === null) {
              return product_dimensions_str + `<div style="display: none">missing_dimensions</div>`
            } else {
              return product_dimensions_str
            }
        },
      },
      {
        "targets": "def_c_length",
         "data": "def_c_length",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_c_length"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_c_width",
         "data": "def_c_width",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_c_width "
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_c_height",
         "data": "def_c_height",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_c_height"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_c_weight",
         "data": "def_c_weight",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_c_weight"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_pcs_per_carton",
         "data": "def_pcs_per_carton",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "def_pcs_per_carton";
            var id = row["obj_id"] + "-" + name;
            var value = data;
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_purchase_price",
         "data": "def_purchase_price",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = 'def_purchase_price" min=0 step=0.01 height="'
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "def_landed_cost_EUR",
         "data": "def_landed_cost_EUR",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = 'def_landed_cost_EUR" min=0 step=0.01 height="'
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "sales_last_30_days_manual",
         "data": "sales_last_30_days_manual",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "sales_last_30_days_manual"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },
      {
        "targets": "min_fba_stock",
         "data": "min_fba_stock",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "min_fba_stock"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },

      {
        "targets": "fba_send_in_priority_asc",
         "data": "fba_send_in_priority_asc",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "fba_send_in_priority_asc"
            var id = row["obj_id"] + "-" + name
            var value = data
            return get_input_html(id, name, value, "number")
          } else {
            return data
          }
        },
      },


      {
        "targets": "child_skus",
        "data": "child_skus",
        "searchable": false,
        "orderable":false,
        "render": function (data, type, row) {
          var tt_title = "";
          row["child_sku_dict_list"].forEach(function (arrayItem) {
            tt_title = tt_title + `<div class='d-flex align-items-center' style="white-space: nowrap">
              <i class="fas fa-arrow-right mr-1"></i>${arrayItem["sku"]}</div>`;
          });

          var add_childs_badge = $(`
                    <div class="badge badge-secondary" style="cursor: pointer" onclick="open_sku_modal_and_assign_ids(${row["obj_id"]})">
                        <i class="fa fa-plus" ></i>
                        ${gettext("Add Childs")}
                    </div>
                 `)

          if(row["aggregated_to_parent_sku__sku"] === ""){
            return tt_title + add_childs_badge.prop('outerHTML');
          } else{
            return tt_title
          }
        },
      },

      {
        "targets": "aggregated_to_parent_sku__sku",
        "data": "aggregated_to_parent_sku__sku",
        "render": function (data, type, row) {
          return data
        },
      },


       {
        "targets": "actions",
        "data": "obj_id",
        "orderable": false,
        "render": function (data, type, row) {
          var archived_button_html = `<i class="fas fa-eye-slash text-primary mr-1" ></i>${gettext("Discontinue")}`

          return `<div class="d-flex align-items-center pl-2">
                        <div class="dropdown show">
                          <button class="btn btn-white btn-sm dropdown-toggle p-0" style="font-size: 0.8rem;" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-bars text-secondary mr-1" title="${gettext("Actions")}" style="cursor: pointer"></i>
                          </button>

                          <div class="dropdown-menu" aria-labelledby="dropdownMenuLink" >
                          <div class="pr-2 pl-2 mt-1" style="cursor: pointer"> <a href="${edit_model_url + row["obj_id"]}/"><i class="fas fa-edit text-primary mr-1"></i>${gettext("Edit")}</a></div>
                          <div class="pr-2 pl-2 mt-1" style="cursor: pointer" onclick="discontinued_sku(${row["obj_id"]})"> <a href="#">${archived_button_html}</a></div>
                          </div>
                        </div>

                        <div id="${row["obj_id"]}-save_changes_btn" class="badge badge-pill badge-success ml-3 p-2 save_changes_btn save_changes_badge" style="display: none" data-toggle="tooltip" title="${gettext("Save row changes")}">
                          <i class="fas fa-save  text-white save_changes_btn" style="display: none"></i>
                        </div>

                        <div id="${row["obj_id"]}-cancel_changes_btn" class="badge badge-pill badge-danger ml-1 p-2 cancel_changes_btn" style="display: none" data-toggle="tooltip" title="${gettext("Revert row changes")}">
                          <i class="fas fa-undo  text-white cancel_changes_btn" style="display: none"></i>
                        </div>

                    </div>
                        `

        },
      },
      {
        "targets": get_ci_as["auto_send_in_suggestion"],
        "data": "auto_send_in_suggestion",
        "orderable": false,
        "render": function (data, type, row) {
          if (data === "enabled") {
            return `
                                <i class="fas fa-magic text-secondary" title="${gettext("Automatic FBA Send In Suggestion Enabled")}" ></i>
                                <a href="${edit_model_url}${row["obj_id"]}/"><i class="fas fa-edit" title="${gettext("Edit SKU Data")}" ></i></a>
                                        `
          } else {
            return ``
          }
        },
      },

      {
        "targets": "max_allowed_send_in_pcs",
        "createdCell": function (td, cellData, rowData, row, col) {
          if (rowData["max_allowed_send_in_pcs"] < rowData["def_pcs_per_carton"]) {
            $(td).addClass('table-danger')
          }
        }
      },

      {
        "targets": [
          "FNSKU",
          // "amz_title",
          "variation_name",
          "def_c_length",
          "def_c_width",
          "def_c_height",
          "def_c_weight",
          "def_pcs_per_carton",
          "sales_last_30_days_manual",
          "max_allowed_send_in_pcs",
          "product_dimensions",
          "min_fba_stock",
          "custom_product_id",
          "def_product_name_for_invoice",
          "def_purchase_price",
          "def_landed_cost_EUR",
          "fulfillment_network_settings",
          "fba_size_category",
          "moq",
          "child_skus",
          "aggregated_to_parent_sku__sku",
          "fba_send_in_priority_asc",
          "to_be_notified_email"
        ],
        "visible": false,
      },

      {
        "targets": [
          "variation_name",
          "def_c_length",
          "def_c_width",
          "def_c_height",
          "def_c_weight",
          "def_pcs_per_carton",
          "sales_last_30_days_manual",
          "max_allowed_send_in_pcs",
          "min_fba_stock",
          "amz_fulfillment_type",
          "def_purchase_price",
          "def_landed_cost_EUR",
        ],
        "width": "85px",
      },
      {
        "targets": [
          "FNSKU",
          "ASIN",
          "Parent_ASIN",
          "custom_product_id",
        ],
        "width": "100px",
      },
      {
        "targets": [
          "amz_title",
        ],
        "width": "610px",
      },
      {
        "targets": [
          "fulfillment_network_settings",
        ],
        "width": "220px",
      },
      {
        "targets": [
          "small_image_url",
          "obj_id",
        ],
        "width": "20px",
      },
      {
        "targets": [
          "cat_product_type",
          "cat_color",
          "cat_size",
          "cat_shape",
          "sku",
          "amz_product_id",
          "def_product_name_for_invoice",
        ],
        "width": "200px",
      },
    ],

    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
      },

      {
        extend: `collection`,
        text: `<i class="fas fa-ellipsis-v"></i>  ${gettext("Actions")}`,
        buttons: [

          {
            text: `<i class="far fa-eye-slash"></i> ${gettext("Discontinue SKU(s)")}`,
            action: function (e, dt, node, config) {
              var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
                return dt.cell(row_indexes, "obj_id:name").data()
              })

              var data = {
                'action': "batch_update_skus",
                't_field': "status",
                'new_value': "Discontinued",
                'obj_ids_list': JSON.stringify(obj_ids_list),
                'csrfmiddlewaretoken': csrfmiddlewaretoken,
              }

              var url = "/ajax_batch_update_values/"
              $.ajax({
                method: 'POST',
                url: url,
                data: data,
                success: function () {
                  // dt.rows('.selected').remove().draw()
                  dt.ajax.reload();
                }
              })
            }
          },
          {
            text: '<hr>',
          },
          {
            text: `<i class="fa fa-magic"></i> ${gettext("Enable FBA Auto Send-In")}`,
            action: function (e, dt, node, config) {
              var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
                return dt.cell(row_indexes, "obj_id:name").data()
              })

              var data = {
                'action': "batch_update_skus",
                't_field': "auto_send_in_suggestion",
                'new_value': "enabled",
                'obj_ids_list': JSON.stringify(obj_ids_list),
              }
              var url = "/ajax_batch_update_values/"
              updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = true)
            }
          },
          {
            text: `<i class="fa fa-minus-circle"></i> ${gettext("Disable FBA Auto Send-In")}`,
            action: function (e, dt, node, config) {
              var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
                return dt.cell(row_indexes, "obj_id:name").data()
              })

              var data = {
                'action': "batch_update_skus",
                't_field': "auto_send_in_suggestion",
                'new_value': "disabled",
                'obj_ids_list': JSON.stringify(obj_ids_list),
              }
              var url = "/ajax_batch_update_values/"
              updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = true)
            }
          },
        ]
      },

      {
            className: "action_button",
            text: `<i class="fa fa-edit"></i> ${gettext("Edit SKU(s)")}`,
            action: function (e, dt, node, config) {
              // hide button dropdown
              $('#sku_bulk_update_modal div').click()
              var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
                return dt.cell(row_indexes, "obj_id:name").data()
              })

              if (obj_ids_list.length > 1){
              $('input[name="obj_ids"]').val(obj_ids_list);
              $('input[name="redirect_url"]').val(batch_update_redirect_url);
              $('#sku_bulk_update_modal').modal('show')}
              else if (obj_ids_list.length){
                window.location = edit_model_url + `${obj_ids_list[0]}/sku_database/`
              } else {
                alert(gettext("Error. No SKUs were selected."))
              }
            }
          },
    ],
    // scrollX: true,
    // scroller: true,
    // scrollCollapse: true,

    "scrollX": "70vh",
    "scrollY": $('.container-fluid').outerHeight() - 180,
    // "scrollY": $('#accordionSidebar').outerHeight() ,
    "lengthMenu": [[100, 500, -1], [100, 500, "All"]],
    // fixedColumns:   {
    //         leftColumns: 1,
    //         rightColumns: 1
    //     },
  };
  dt_active_skus_config["columns"] = columns;
  $.extend(dt_active_skus_config, def_dt_settings);
  dt_active_skus_config["fixedHeader"] = null;
  dt_active_skus_config["info"] = true;
  dt_active_skus_config["bPaginate"] = true;
  dt_active_skus_config["stateSaveParams"] = function (settings, data) {data.search.search = "";};
  return dt_active_skus_config
}

function initialize_active_skus_table() {
  $('#dt_active_skus').DataTable(get_dt_active_skus_config())
}

function show_changes_btn() {
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable()
  var current_row = dt.cell(td_node).index()["row"]
  var obj_id = dt.cell(current_row, "obj_id:name").data()
  show_save_changes_btn(obj_id)
  show_cancel_changes_btn(obj_id)
  $("#save_all_btn").removeAttr("style");
}

function show_save_changes_btn(obj_id) {
  save_changes_btn = $(`#${obj_id}-save_changes_btn`)
  save_changes_btn.attr("style", "pointer: cursor")
  save_changes_btn.attr("onclick", "save_input_changes.call(this)")
  save_changes_btn.find("i").attr("style", "cursor: pointer")
}

function show_cancel_changes_btn(obj_id) {
  cancel_changes_btn = $(`#${obj_id}-cancel_changes_btn`)
  cancel_changes_btn.attr("style", "pointer: cursor")
  cancel_changes_btn.attr("onclick", "cancel_input_changes.call(this)")
  cancel_changes_btn.find("i").attr("style", "cursor: pointer")
}

function remove_save_all(){
    length = $('div.save_changes_badge:not([style*="display: none"])').length
    if(length < 1){
        $("#save_all_btn").hide();
    }
}

function save_input_changes() {
    var btn = $(this)
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable()
    var current_row = dt.cell( td_node ).index()["row"]

    var cat_product_type = $(dt.cell( current_row, "cat_product_type:name").node()).find("input").val()
    var cat_color = $(dt.cell( current_row, "cat_color:name").node()).find("input").val()
    var cat_size = $(dt.cell( current_row, "cat_size:name").node()).find("input").val()
    var cat_shape = $(dt.cell( current_row, "cat_shape:name").node()).find("input").val()
    // var amz_product_id = $(dt.cell( current_row, "amz_product_id:name").node()).find("input").val()
    var custom_product_id = $(dt.cell( current_row, "custom_product_id:name").node()).find("input").val()
    var def_product_name_for_invoice = $(dt.cell( current_row, "def_product_name_for_invoice:name").node()).find("input").val()
    var def_c_length = $(dt.cell( current_row, "def_c_length:name").node()).find("input").val()
    var def_c_width = $(dt.cell( current_row, "def_c_width:name").node()).find("input").val()
    var def_c_height = $(dt.cell( current_row, "def_c_height:name").node()).find("input").val()
    var def_c_weight = $(dt.cell( current_row, "def_c_weight:name").node()).find("input").val()
    var def_pcs_per_carton = $(dt.cell( current_row, "def_pcs_per_carton:name").node()).find("input").val()
    var def_purchase_price = $(dt.cell( current_row, "def_purchase_price:name").node()).find("input").val()
    var def_landed_cost_EUR = $(dt.cell( current_row, "def_landed_cost_EUR:name").node()).find("input").val()
    var sales_last_30_days_manual = $(dt.cell( current_row, "sales_last_30_days_manual:name").node()).find("input").val()
    var min_fba_stock = $(dt.cell( current_row, "min_fba_stock:name").node()).find("input").val()
    var fba_send_in_priority_asc = $(dt.cell( current_row, "fba_send_in_priority_asc:name").node()).find("input").val()

    var sku_id = dt.cell( current_row, "obj_id:name").data()

  td_node.find('.cancel_changes_btn').attr("style", "display: none")
  $(this).find("i").attr("style", "display: none")
  $(this).append(`<span id="spinner_import_all_skus_csv_file" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)
  td_node.find('.save_changes_btn').removeAttr("edit")

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "action": "save_sku_log_row_changes",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
      "sku_id": sku_id,
      "cat_product_type": cat_product_type,
      "cat_color": cat_color,
      "cat_size": cat_size,
      "cat_shape": cat_shape,
      "custom_product_id": custom_product_id,
      "def_product_name_for_invoice": def_product_name_for_invoice,
      "def_c_length": def_c_length,
      "def_c_width": def_c_width,
      "def_c_height": def_c_height,
      "def_c_weight": def_c_weight,
      "def_pcs_per_carton": def_pcs_per_carton,
      "sales_last_30_days_manual": sales_last_30_days_manual,
      "def_purchase_price": def_purchase_price,
      "def_landed_cost_EUR": def_landed_cost_EUR,
      "min_fba_stock": min_fba_stock,
      "fba_send_in_priority_asc": fba_send_in_priority_asc
    },
    success: function () {
      btn.find("span").remove()
      btn.attr("style", "display: none")
      $(".tooltip").tooltip('hide')
      remove_save_all()
    },
    error: function () {
      alert(gettext("Error. Changes could not be saved."))
    },
  })
}


function cancel_input_changes() {
    var btn = $(this)
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable()
    var current_row = dt.cell( td_node ).index()["row"]

    var cat_product_type = $(dt.cell( current_row, "cat_product_type:name").node()).find("input").val()
    var cat_color = $(dt.cell( current_row, "cat_color:name").node()).find("input").val()
    var cat_size = $(dt.cell( current_row, "cat_size:name").node()).find("input").val()
    var cat_shape = $(dt.cell( current_row, "cat_shape:name").node()).find("input").val()
    // var amz_product_id = $(dt.cell( current_row, "amz_product_id:name").node()).find("input").val()
    var def_c_length = $(dt.cell( current_row, "def_c_length:name").node()).find("input").val()
    var def_c_width = $(dt.cell( current_row, "def_c_width:name").node()).find("input").val()
    var def_c_height = $(dt.cell( current_row, "def_c_height:name").node()).find("input").val()
    var def_c_weight = $(dt.cell( current_row, "def_c_weight:name").node()).find("input").val()
    var def_pcs_per_carton = $(dt.cell( current_row, "def_pcs_per_carton:name").node()).find("input").val()
    var sales_last_30_days_manual = $(dt.cell( current_row, "sales_last_30_days_manual:name").node()).find("input").val()
    var min_fba_stock = $(dt.cell( current_row, "min_fba_stock:name").node()).find("input").val()

    $(dt.cell( current_row, "cat_product_type:name").node()).find("input").val(cat_product_type)
    $(dt.cell( current_row, "cat_color:name").node()).find("input").val(cat_color)
    $(dt.cell( current_row, "cat_size:name").node()).find("input").val(cat_size)
    $(dt.cell( current_row, "cat_shape:name").node()).find("input").val(cat_shape)
    // $(dt.cell( current_row, "amz_product_id:name").node()).find("input").val(amz_product_id)
    $(dt.cell( current_row, "def_c_length:name").node()).find("input").val(def_c_length)
    $(dt.cell( current_row, "def_c_width:name").node()).find("input").val(def_c_width)
    $(dt.cell( current_row, "def_c_height:name").node()).find("input").val(def_c_height)
    $(dt.cell( current_row, "def_c_weight:name").node()).find("input").val(def_c_weight)
    $(dt.cell( current_row, "def_pcs_per_carton:name").node()).find("input").val(def_pcs_per_carton)
    $(dt.cell( current_row, "sales_last_30_days_manual:name").node()).find("input").val(sales_last_30_days_manual)
    $(dt.cell( current_row, "min_fba_stock:name").node()).find("input").val(min_fba_stock)

    td_node.find('.save_changes_btn').attr("style", "display: none")
    td_node.find('.cancel_changes_btn').attr("style", "display: none")
    $(".tooltip").tooltip('hide')

    remove_save_all()

}

function discontinued_sku(sku_id) {
  $("#"+sku_id+"-row").remove()
  $.ajax({
    method:'POST',
    url:sku_deactivate_url,
    data: {
      "sku_id" : sku_id,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
       $("#dt_active_skus").DataTable().ajax.reload();
    },
    error:function(){
      alert(gettext("Error. Sku could not be deactivated."))
    },
  })
}

function get_dt_new_skus_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis", width: "5%"}];
  $.merge(columns, basic_sku_info_columns_sku_database);
  $.merge(columns, [
      {"data": "amz_fulfillment_type", "name": "amz_fulfillment_type", className: "amz_fulfillment_type"},
      {"data": "amz_listing_status", "name": "amz_listing_status", className: "amz_listing_status"},
  ]);

  return columns
}

function get_dt_new_skus_config() {
  var columns = get_dt_new_skus_columns();
  var dt_new_skus_config = {
      "ajax": {
        url: ajax_get_table_data_url,
        method: "POST",
        dataType: 'json',
        data: {
          "action": "get_new_skus",
          "csrfmiddlewaretoken": csrfmiddlewaretoken,
        },
      },
      "lengthMenu": [[300, 500, -1], [300, 500, "All"]],

      "columnDefs": [
        {
          "visible": false,
          "targets": [
            "small_image_url",
            "cat_product_type",
            "cat_size",
            "cat_shape",
            "cat_color",
            "Parent_ASIN",
            "child_skus",
            "aggregated_to_parent_sku__sku",
          ],
        },
        {
          "visible": true,
          "targets": [
            "amz_title",
            "FNSKU",
            "ASIN",
          ],
        },
        {
          "searchPanes":{
            show: true,
            controls: false,
          },
          "targets": [
            "Parent_ASIN",
            "amz_fulfillment_type",
            "amz_listing_status",
          ],
        },
        {
          "searchPanes":{ show: false },
          "targets": [
            "obj_id",
            "small_image_url",
            "cat_product_type",
            "cat_color",
            "cat_size",
            "cat_shape",
            "amz_title",
            "variation_name",
            "sku",
            "ASIN",
            "FNSKU",
          ],
        },
      {
          "targets": "small_image_url",
          "data": "small_image_url",
          "render": function (data, type, row) {
            return `<a target="_blank" href="${get_img_url_base()}/dp/${row["ASIN"]}"><img width="50px" src="${data}" alt=""></a>`
          },
        },
        {
          "targets": "ASIN",
          "data": "ASIN",
          "render": function (data, type, row) {
            return `${data} <a target="_blank" href="${get_img_url_base()}/dp/${data}"><i class="fa fa-link"></i></a>`
          },
        },
        {
          "targets": 0,
          "data": "obj_id",
          "width": "10px",
          "orderable": false,
          "render": function (data, type, row) {
            return ``
          },
        },

      ],
      buttons: [
        {
          extend: 'colvis',
          columns: ':not(.noVis)',
          text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
        },
        {
          text: `<i class="fa fa-plus-square"></i> ${gettext("Activate SKU(s)")}`,
          action: function (e, dt, node, config) {
            var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
              return dt.cell(row_indexes, "obj_id:name").data()
            })

            var data = {
              'action': "batch_update_skus",
              't_field': "status",
              'new_value': "active",
              'obj_ids_list': JSON.stringify(obj_ids_list),
              'csrfmiddlewaretoken': csrfmiddlewaretoken,
            }
            var url = "/ajax_batch_update_values/"
            $.ajax({
              method: 'POST',
              url: url,
              data: data,
              success: function () {
                dt.rows('.selected').remove().draw()
                // dt.ajax.reload();
                dt.searchPanes.rebuildPane();
              }
            })

          }
        },
        {
          text: `<i class="far fa-eye-slash"></i> ${gettext("Discontinue SKU(s)")}`,
          action: function (e, dt, node, config) {
            var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
              return dt.cell(row_indexes, "obj_id:name").data()
            });

            var data = {
              'action': "batch_update_skus",
              't_field': "status",
              'new_value': "Discontinued",
              'obj_ids_list': JSON.stringify(obj_ids_list),
              'csrfmiddlewaretoken': csrfmiddlewaretoken,
            };

            var url = "/ajax_batch_update_values/"
            $.ajax({
              method: 'POST',
              url: url,
              data: data,
              success: function () {
                dt.rows('.selected').remove().draw()
                dt.searchPanes.rebuildPane();
              }
            })
          }
        },

      ],

    };

  dt_new_skus_config["columns"] = columns;
  $.extend(dt_new_skus_config, def_dt_settings);
  dt_new_skus_config["dom"] = dom_w_search_panes;
  dt_new_skus_config["info"] = true;
  dt_new_skus_config["bPaginate"] = true;
  return dt_new_skus_config
}

function initialize_new_skus_table() {
  $('#dt_new_skus').DataTable(get_dt_new_skus_config());
}

function initialize_discontinued_skus_table() {
  var dt_discontinued_skus_config = get_dt_new_skus_config();
  dt_discontinued_skus_config["ajax"].data["action"] = "get_discontinued_skus";
  dt_discontinued_skus_config["buttons"] = [
        {
          extend: 'colvis',
          columns: ':not(.noVis)',
          text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
        },
        {
          text: `<i class="fa fa-undo"></i> ${gettext("Activate selected SKUs again")}`,
          action: function (e, dt, node, config) {
            var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
              return dt.cell(row_indexes, "obj_id:name").data()
            })

            var data = {
              'action': "batch_update_skus",
              't_field': "status",
              'new_value': "active",
              'obj_ids_list': JSON.stringify(obj_ids_list),
            }
            var url = "/ajax_batch_update_values/"

            updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false)
            dt.rows('.selected').remove().draw();
            dt.searchPanes.rebuildPane();
          }
        },

      ];

  $('#dt_discontinued_skus').DataTable(dt_discontinued_skus_config);
}

function on_load_open_correct_tab_by_id(tab_id) {
  if (tab_id !== "") {
    $(`#${tab_id}`).click()
  }
}

function import_select_visible_button() {
  $.fn.dataTable.ext.buttons.select_visible = {
    className: 'buttons-select-visible',
    text: 'Select Visible',
    action: function (e, dt) {
      // action: function ( e, dt, node, config ) {
      dt.rows({page: 'current'}).select();
    }
  };
}

function bind_events() {
  $('#tab-list a').on('click', function (e) {
    e.preventDefault()
    add_switch_tabs_functionality.call(this)

    add_switch_modal_tabs_functionality.call(this)
  })

    $('#skus_mapping_category_tabs_modal').on("hide.bs.modal", function () {
        $('#dt_active_skus').DataTable().ajax.reload();
    });

  bind_save_all_button_show_events();


  $('td[name="editable_str_cell"]').on('mouseenter', function () {
    $(this).find('i.fa-edit').attr('style', 'visibility: visible; cursor: pointer;');
  });

  $('td[name="editable_str_cell"]').on('mouseleave', function () {
    $(this).find('i.fa-edit').attr('style', 'visibility: hidden');
  });


  $("#form_sku_cat_info_csv").submit(function (e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    var spinner = `<span id="spinner_btn_sku_cat_info_csv" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>`
    $('#btn_sku_cat_info_csv > span#spinner_sku_cat_info_csv').html(spinner)
    ajax_upload_sku_cat_info_csv_file.call(this)
  });

  $('i[name="editable_str_cell"]').on('click', edit_str_cell);

  $('#btn_sku_import').on('click', function (e) {
    var spinner = `<span id="spinner_btn_sku_import" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>`
    $('#btn_sku_import > span#spinner_span_sku_import').html(spinner)
  });

  $('.custom-file-input').on('change', function () {
    //get the file name
    var fileName = $(this).val();
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
  })

  $('#dt_active_skus').on( 'draw.dt', function () {
    $('#dt_active_skus').DataTable().columns.adjust();
} );

  $('#dt_active_skus').on( 'column-visibility.dt', function ( e, settings, column, state ) {
    $('#dt_active_skus').DataTable().columns.adjust();
} );


}

function bind_save_all_button_show_events() {

  $("#save_all_btn").click(function () {
    $(".save_changes_badge").each(function () {
      $(this).trigger("click");
      $(".save-all").attr("style", "display: none");
      $("#save_all_btn").attr("style", "display: none");
    });
  });

  $('.input_change').on('change', function () {
    $("#save_all_btn").attr("style", "display: block");
  })

}

function ajax_upload_amz_restock_report_txt_file(){
  $('#btn_amz_restock_report_txt').prop('disabled', true);
  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_amz_restock_report_txt_file_url,
    data: data,
    cache: false,
    processData: false,
    contentType: false,
    data: data,
    success: function(data)
    {
      $('#btn_amz_restock_report_txt > span#spinner_amz_restock_report_txt').html("");
      alert(gettext("File successfully uploaded!"));
      $('#btn_amz_restock_report_txt').prop('disabled', false);
    },
    error: function (request, status, error) {
        try {
          alert(request.responseJSON["error"]);
        }
        catch (e) {
          alert(gettext("Error. File could not be uploaded."));
        }
        $('#btn_amz_restock_report_txt > span#spinner_amz_restock_report_txt').html("");
        $('#btn_amz_restock_report_txt').prop('disabled', false);
    }
  });
}

$("#form_amz_restock_report_txt").submit(function(e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.
  var spinner = `<span id="spinner_btn_amz_restock_report_txt" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>`
  $('#btn_amz_restock_report_txt > span#spinner_amz_restock_report_txt').html(spinner)
  ajax_upload_amz_restock_report_txt_file.call(this)
});



function ajax_upload_sku_cat_info_csv_file(){
  var data = new FormData($(this).get(0));
  upload_button = $('#btn_sku_cat_info_csv');
  upload_button.prop('disabled', true);
  $.ajax({
    type: "POST",
    url: submit_sku_cat_info_csv_file_url,
    data: data,
    cache: false,
    processData: false,
    contentType: false,
    data: data,
    success: function(data)
    {
      $('#btn_sku_cat_info_csv > span#spinner_sku_cat_info_csv').html("")
      if(data.is_background_task){
        alert(gettext("Your file will be processed in the background. You will receive a success or error mail after completion."));
      } else {
        alert(gettext("File successfully uploaded!"));
      }
      upload_button.prop('disabled', false);
    },
    error: function (request, status, error) {
        alert(request.responseJSON["error"]);
        $('#btn_sku_cat_info_csv > span#spinner_sku_cat_info_csv').html("")
        upload_button.prop('disabled', false);
    }
  });
}



function add_switch_tabs_functionality() {
  $(this).tab('show');
  if ($(this).attr("aria-controls") === "discontinued_skus_tab") {

    if (!$.fn.DataTable.isDataTable('#dt_discontinued_skus')) {
      initialize_discontinued_skus_table()
    } else {
      $("#dt_discontinued_skus").DataTable().ajax.reload();
    }
  }

  if ($(this).attr("aria-controls") === "active_skus_tab") {

    if (!$.fn.DataTable.isDataTable('#dt_active_skus')) {
      initialize_active_skus_table()
    } else {
      $("#dt_active_skus").DataTable().ajax.reload();
    }
  }

  if ($(this).attr("aria-controls") === "new_skus_tab") {

    if (!$.fn.DataTable.isDataTable('#dt_new_skus')) {
      initialize_new_skus_table()
    } else {
      $("#dt_new_skus").DataTable().ajax.reload();
    }
  }
}

function edit_str_cell() {
  var sku_id = $(this).data('sku_id')
  var t_field = $(this).data('t_field')
  var value = $(`span[id="${sku_id}-${t_field}-value"]`).html().replace(/(\r\n|\n|\r)/gm, "").replace(/(\r\n|\n|\r)/gm, "");
  $(`td[id="${sku_id}-${t_field}-cell"]`).html(
    `<input id="${sku_id}-${t_field}-input" name="edit_input_field" class="result form-control" data-sku_id="${sku_id}" data-t_field="${t_field}" type="text" maxlength="300" value="${value}">`
  )

  $('input[name="edit_input_field"]').keyup(function (event) {
    if (event.keyCode === 13) {
      btn_save.call(this);
    }
  });

  $(`td[id="${sku_id}-${t_field}-cell"]`).popover({
    placement: 'bottom',
    container: 'body',
    html: true,
    sanitize: false,
    content: `<button id="${sku_id}-${t_field}-btn-save" onclick="btn_save.call(this)" class="btn btn-sm btn-info mr-2" data-sku_id="${sku_id}" data-t_field="${t_field}"  name="table_edit_save_button">${gettext("Save")}</button>` +
      `<button id="${sku_id}-${t_field}-btn-cancel" onclick="btn_cancel.call(this)" class="btn btn-sm btn-danger" data-sku_id="${sku_id}" data-t_field="${t_field}" data-value_before="${value}" name="table_edit_cancel_button">${gettext("Cancel")}</button>`
  })
}

function btn_cancel() {
  var sku_id = $(this).data('sku_id')
  var t_field = $(this).data('t_field')
  var value_before = $(this).data('value_before')

  $(`td[id="${sku_id}-${t_field}-cell"]`).html(
    `<span id="${sku_id}-${t_field}-value" data-sku_id="${sku_id}" data-t_field="${t_field}">${value_before}</span>` +
    `<i class="fas fa-edit text-secondary" name="editable_str_cell" data-sku_id="${sku_id}" data-t_field="${t_field}" style="visibility: hidden"></i>`
  )
  $(`td[id="${sku_id}-${t_field}-cell"]`).popover('hide')
  $('i[name="editable_str_cell"]').on('click', edit_str_cell)
}

function btn_save() {
  var sku_id = $(this).data('sku_id')
  var t_field = $(this).data('t_field')
  var input_value = $(`#${sku_id}-${t_field}-input`).val()

  $(`td[id="${sku_id}-${t_field}-cell"]`).html(
    `<span id="${sku_id}-${t_field}-value" data-sku_id="${sku_id}" data-t_field="${t_field}">${input_value}</span>` +
    `<i class="fas fa-edit text-secondary" name="editable_str_cell" data-sku_id="${sku_id}" data-t_field="${t_field}" style="visibility: hidden"></i>`
  )

  var url = '/update_sku/'
  data = {
    "sku_id": sku_id,
    "t_field": t_field,
    "input_value": input_value,
  }
  updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false)

  $(`td[id="${sku_id}-${t_field}-cell"]`).popover('hide')
  $('i[name="editable_str_cell"]').on('click', edit_str_cell)
}


function create_new_rule() {

}


function initialize_dt_sku_mp_mapping_sku(dt_id="#dt_skus_mappings", category=""){
  modal_dt_id = dt_id;
  if (!$.fn.DataTable.isDataTable(dt_id)) {
    $(dt_id).DataTable(get_config_dt_sku_mp_mapping_sku(mc_id=null, category, dt_id));
    $(dt_id).DataTable().columns.adjust();
  }else{
    $(dt_id).DataTable().ajax.reload();
    $(dt_id).DataTable().columns.adjust();
  }
}

function add_switch_modal_tabs_functionality() {
  $(this).tab('show');
  dt_id =  $(this).data('dt_id');
  modal_dt_id = dt_id;
    if (!$.fn.DataTable.isDataTable(dt_id)) {
      var category =  $(this).data('category');
      initialize_dt_sku_mp_mapping_sku(dt_id, category)
    } else {
      $(dt_id).DataTable().ajax.reload();
    }
}

function get_dt_sku_mp_mapping_sku_columns() {
  var columns = [];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [{name: "actions", className: "actions noVis text-center"}]);

  return columns
}

function get_config_dt_sku_mp_mapping_sku(mc_id=null, category="", dt_id="#dt_skus_mappings") {
  columns = get_dt_sku_mp_mapping_sku_columns();
  // get_ci_am = create_column_map(columns);

  var dt_sku_mp_mapping_sku__config =  {
  "processing": true,
     "language": {
        "processing": gettext("Loading...")
     },
  "serverSide": true,
  "ajax": {
    url: ajax_get_table_data_url,
    method: "POST",
    dataType: 'json',
  "data": function ( d ) {
    data = {}
    data.json = JSON.stringify(d)
    data.action = "get_po_add_skus_manually";
    data.mc_id = mc_id;
    data.category = category;
    data.csrfmiddlewaretoken = csrfmiddlewaretoken;
    return data;
    }
  },
  // Search Button
  initComplete : function() {
      add_search_for_server_side_table.call(this, dt_id)
  },
  "lengthMenu": [[100, 500, -1], [100, 500, "All"]],

  "orderFixed": {
        "pre": [1, 'asc' ]
  },
  "columnDefs": [
    {
      "targets": -1,
      "data": "obj_id",
      "searchable":false,
      "orderable":false,
      "render": function ( data, type, row ) {
          if (row["parent_sku_id"] == sku_obj_id){
              return `
              <div class="add_buttons d-flex justify-content-center">
                ${get_remove_from_selection_button_html(`remove_child.call(this)`, data, gettext("Remove as child SKU"))}
               </div>
              `
          }
          else if (row["obj_id"] == sku_obj_id){
          return `
              <div class="add_buttons d-flex justify-content-center">
                ${get_add_to_selection_button_html(`add_child.call(this)`, data, gettext("Add as child SKU"), true)}
               </div>
             `
          }
          else if(row["parent_sku_id"] != "" && row["parent_sku_id"] != null){
              return `
              <div class="add_buttons d-flex justify-content-center">
                ${get_after_add_to_selection_button_html(`add_child.call(this)`, data, gettext("Add as child SKU"))}
               </div>
              `
          }
          return `
          <div class="add_buttons d-flex justify-content-center">
            ${get_add_to_selection_button_html(`add_child.call(this)`, data, gettext("Add as child SKU"))}
           </div>
          `
      }
    },

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
                        onclick="redirect_blank('https://www.amazon.de/dp/${row["ASIN"]}')"
                        width="50px"
                        height="50px"
                        >
                    </div>`
      },
    },

    {
      "targets": [
        "cat_product_type",
        "cat_color",
        "cat_size",
        "p_shape",
        "amz_title",
        "Parent_ASIN",
        "child_skus",
        "aggregated_to_parent_sku__sku",
      ],
      "visible": false,
    },
    {
      "targets": [
        "ASIN",
        "amz_title",
      ],
      "visible": true,
    }
  ],
  buttons : [
    {
      extend: 'colvis',
      columns: ':not(.noVis)',
      text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
    },
            {
      text: `<i class="fas fa-plus-circle"></i> ${gettext("Disable Grouping")}`,
      action: function ( e, dt, node, config ) {
        if (dt.rowGroup().enable){
          dt.rowGroup().disable().draw();
          dt.order.fixed( {
          } );
        } else {
          dt.rowGroup().enable().draw();
        }
      },
    }
  ],

  rowGroup: {
    dataSrc: "cat_product_type"
  },
  scrollY:        '60vh',
  };

  dt_sku_mp_mapping_sku__config["columns"] = columns;
  $.extend(dt_sku_mp_mapping_sku__config, def_dt_settings);
  dt_sku_mp_mapping_sku__config["info"] = true;
  dt_sku_mp_mapping_sku__config["bPaginate"] = true;
  return dt_sku_mp_mapping_sku__config

}


function open_sku_modal_and_assign_ids(selected_sku_obj_id) {
    sku_obj_id = selected_sku_obj_id;
    $('#skus_mapping_category_tabs_modal').modal("show");
    initialize_dt_sku_mp_mapping_sku(modal_dt_id, initial_category);
}

function add_child(){
  var child_sku_id = $(this).attr("data-obj_id");
  var btn = $(this);

  btn.append(`<span id="saving_btn_spinner" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "child_sku_id" : child_sku_id,
      "parent_sku_id" : sku_obj_id,
      "action": "add_child_sku",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(resp){
      if(resp.data.success){
          var td_node = btn.closest("td");
          var dt = btn.closest("table").DataTable();
          var current_row = dt.cell(td_node).index()["row"];

          var row_data = dt.row(current_row).data()
          row_data.parent_sku_id = sku_obj_id;
          dt.row(current_row).data(row_data);
//          $('#dt_active_skus').DataTable().ajax.reload();

          btn.find("#saving_btn_spinner").remove()
//        $('#skus_mapping_category_tabs_modal').modal("hide");
      }
    },
    error:function(){
      alert(gettext("Error. Something went wrong."))
      btn.find("#saving_btn_spinner").remove()
    }
  })
}


function remove_child(){
  var child_sku_id = $(this).attr("data-obj_id");
  var btn = $(this);

  btn.append(`<span id="saving_btn_spinner" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "child_sku_id" : child_sku_id,
      "parent_sku_id" : sku_obj_id,
      "action": "remove_child_sku",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(resp){
      if(resp.data.success){
          var td_node = btn.closest("td");
          var dt = btn.closest("table").DataTable();
          var current_row = dt.cell(td_node).index()["row"];

          var row_data = dt.row(current_row).data()
          row_data.parent_sku_id = null;
          dt.row(current_row).data(row_data);
//          $('#dt_active_skus').DataTable().ajax.reload();

          btn.find("#saving_btn_spinner").remove()
//        $('#skus_mapping_category_tabs_modal').modal("hide");
      }
    },
    error:function(){
      alert(gettext("Error. Something went wrong."))
      btn.find("#saving_btn_spinner").remove()
    }
  })
}