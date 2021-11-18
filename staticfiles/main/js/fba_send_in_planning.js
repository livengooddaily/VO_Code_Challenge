$(document).ready(function () {
  register_datatable_sums_functionality();
  bind_events();
  bind_on_table_drawn_events();
  initialize_dt_selected_skus_pl();

  updateDisplay();

});

function bind_events() {
  // <!--    Bind field edit function -->
  // $('button[id="btn_commit_fba_send_in"]').on('click', commit_fba_send_in)

  $('#add_fba_send_in_skus_manually_modal').on('shown.bs.modal', function (e) {

    if ( ! $.fn.DataTable.isDataTable( '#dt_add_fba_send_in_skus_manually' ) ) {
          if (initial_category !== "None") {
         initialize_dt_add_fba_send_in_skus_manually('#dt_add_fba_send_in_skus_manually', initial_category);
        } else {
          initialize_dt_add_fba_send_in_skus_manually();
        }
    } else {
        $("#dt_add_fba_send_in_skus_manually").DataTable().ajax.reload();
        $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();

    }

  });
  $('#add_fba_send_in_skus_manually_modal').on('hide.bs.modal', function (e) {
    $("#dt_selected_skus_pl").DataTable().ajax.reload();
  });
  bind_tab_switching_functionality();
  // $('#dt_selected_skus_pl').on('column-visibility.dt', function () {
  //   bind_editable_int_cell_events()
  // });
}

function bind_on_table_drawn_events() {
  $('#dt_selected_skus_pl').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
    $(".tooltip").tooltip('hide')
    $('.popover').popover("hide")
  });
}

function get_dt_selected_skus_pl_columns() {
var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis", width: "5%"},
    {"data": "carton_type", "name": "carton_type", className: "carton_type noVis"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
   {
          "data": "purchase_order__order_name",
          "name": "purchase_order__order_name",
          className: "purchase_order__order_name ",
          width: ""
        },//5
        {"data": "pcs_per_carton", "name": "pcs_per_carton", className: "pcs_per_carton dt-center", width: "8%"},
        {"data": "cartons_left", "name": "cartons_left", className: "cartons_left dt-center", width: "8%"},
        {
          "data": "fba_send_in_qty_cartons",
          "name": "fba_send_in_qty_cartons",
          className: "fba_send_in_qty_cartons dt-center",
          width: "8%"
        },
        {
          "data": "fba_send_in_pcs_total",
          "name": "fba_send_in_pcs_total",
          className: "fba_send_in_pcs_total dt-center",
          width: "10rem",
        },
        {
          "data": "fba_suggested_send_in_pcs_without_max_allowed_limit",
          "name": "fba_suggested_send_in_pcs_without_max_allowed_limit",
          className: "fba_suggested_send_in_pcs_without_max_allowed_limit send-in-calc dt-center",
          width: "8%"
        },
        {
          "data": "max_allowed_send_in_pcs",
          "name": "max_allowed_send_in_pcs",
          className: "max_allowed_send_in_pcs send-in-calc dt-center",
          width: "8%"
        },
        {
          "data": "fba_reach_in_weeks_incl_pending",
          "name": "fba_reach_in_weeks_incl_pending",
          className: "fba_reach_in_weeks_incl_pending send-in-calc dt-center",
          width: "8%"
        },
        {
          "data": "sales_last_30_days",
          "name": "sales_last_30_days",
          className: "sales_last_30_days send-in-calc dt-center",
          width: "8%"
        },
        {
          "data": "TotalSupplyQuantity",
          "name": "TotalSupplyQuantity",
          className: "TotalSupplyQuantity send-in-calc dt-center",
          width: "8%"
        },
        {
          "data": "pcs_per_carton_for_amz",
          "name": "pcs_per_carton_for_amz",
          className: "pcs_per_carton_for_amz dimensions_for_amz editable_int_cell dt-center",
          width: "8%"
        },
        {
          "data": "c_length_for_amz",
          "name": "c_length_for_amz",
          className: "noVis c_length_for_amz dimensions_for_amz editable_int_cell dt-center",
          width: "8%"
        },
        {
          "data": "c_width_for_amz",
          "name": "c_width_for_amz",
          className: "noVis c_width_for_amz dimensions_for_amz editable_int_cell dt-center",
          width: "8%"
        },
        {
          "data": "c_height_for_amz",
          "name": "c_height_for_amz",
          className: "noVis c_height_for_amz dimensions_for_amz editable_int_cell dt-center",
          width: "8%"
        },
        {
          "data": "c_weight_for_amz",
          "name": "c_weight_for_amz",
          className: "noVis c_weight_for_amz dimensions_for_amz editable_int_cell dt-center",
          width: "8%"
        },
        {
          "data": "carton_note",
          "name": "carton_note",
          "className": "carton_note",
          width: "150px"
        },
        {
          "data": "carton_weight",
          "name": "carton_weight",
          "className": "carton_weight",
          width: "150px"
        },
        {"data": 'fba_size_category', "name": 'fba_size_category', className: "fba_size_category"},
        {"data": 'fba_send_in_priority_asc', "name": 'fba_send_in_priority_asc', className: "fba_send_in_priority_asc"},
        {"data": 'main_grouping', "name": 'main_grouping', className: "main_grouping noVis", width: ""},
        {"data": 'main_ordering', "name": 'main_ordering', className: "main_ordering noVis", width: ""},
        {"data": 'fba_mcli_id', "name": 'fba_mcli_id', className: "fba_mcli_id noVis", width: ""},
        {"data": 'fba_send_in_qty_cartons_for_col_sum', "name": 'fba_send_in_qty_cartons_for_col_sum', className: "fba_send_in_qty_cartons_for_col_sum noVis", width: ""},
        {"data": 'carton_weight_for_col_sum', "name": 'carton_weight_for_col_sum', className: "carton_weight_for_col_sum noVis", width: ""},
     {                                      "name": "tags",               className: "tags"             },
    {"name": "actions", className: "actions dt-center noVis", width: ""},
  ]);

  return columns
}


function initialize_dt_selected_skus_pl() {
  var columns = get_dt_selected_skus_pl_columns();
  get_ci_sisi = create_column_map(columns);
  dt_selected_skus_pl_config = {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "fba_send_in_id": fba_send_in_id,
        "action": "get_fba_planned_line_items",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },
    },

    "order": [ [ get_ci_sisi["main_ordering"], 'asc' ]],
      "orderFixed": {
        "pre": [ get_ci_sisi["main_grouping"], 'asc' ]
    },

    "columnDefs": [
      {
        "targets": dt_selected_skus_pl_invisible_columns_def,
        "visible": false,
      },
      {
        "targets": [
          "c_length_for_amz",
          "c_width_for_amz",
          "c_height_for_amz",
          "c_weight_for_amz",
          'fba_size_category',
          'fba_send_in_priority_asc',
          'main_ordering',
          'main_grouping',
          'fba_mcli_id',
          'fba_send_in_qty_cartons_for_col_sum',
          'carton_weight_for_col_sum',
          'carton_type',
          'carton_note',
          // 'carton_weight'
        ],
        "visible": false,
      },
      {
        "targets": "obj_id",
        "data": "obj_id",
        "orderable": false,
        "render": function (data, type, row) {
          return ``
        },
      },
       {
         "targets": "carton_weight",
         "data":"carton_weight",
          render: function(data, type, row){
             var carton_weight = `<div style="white-space: nowrap">${data} kg</div>`;

             if(row['carton_type'] === 'mixed_carton'){
                return `<span style='display:none;' data-mc_id=${row["obj_id"]}>${carton_weight}</span>`
              }
              return carton_weight
          },
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
                        onclick="redirect_blank('${get_img_url_base()}/dp/${row["ASIN"]}')"
                        width="40px" 
                        height="40px"
                        >
                    </div>`
        },
      },
      {
          "targets": "fba_send_in_qty_cartons",
          "data": "fba_send_in_qty_cartons",
          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).addClass("editable_int_cell")
          },
          "render": function (data, type, row) {
            if (type === 'display') {
              return editable_td_html(row["obj_id"], "fba_send_in_qty_cartons", row["carton_type"], data)
            } else {
              return parseInt(data)
            }
          },
        },
        {
          "targets": "cartons_left",
          "data": "cartons_left",
          "render": function (data, type, row) {
            if (row["carton_type"] === "mixed_carton" && type==="display") {
              return `<div style="display: none">${data}</div>`
            } else {
              return parseInt(data)
            }
          },
        },
        {
          "targets": "purchase_order__order_name",
          "data": "purchase_order__order_name",
          "render": function (data, type, row) {
            return `<span class="d-inline-block text-truncate" style="max-width: 100%;" title="${data}">${data}<\span>`
          },
        },
        {
          "targets": "sku",
          "data": "sku",
          "render": function (data, type, row) {
            if (row["auto_send_in_suggestion"] === "enabled") {
              return `${data}`
            } else {
              return `${data} <i class="fas fa-minus-circle-circle text-danger" title="${gettext("Automatic FBA Send In Suggestion has been disabled for this SKU")}" ></i>`
            }
          },
        },


        {
          "targets": "fba_send_in_pcs_total",
          "data": "fba_send_in_pcs_total",
          "width": "8rem",
          "render": function (data, type, row) {
            if (row["pcs_total_of_sku_in_fbasi"] <= row["max_allowed_send_in_pcs"] ) {
              return data
            } else{
              return `<div class="d-flex justify-content-center align-items-center table-danger" style="max-width: 100%;"
                        data-toggle="tooltip"
                        data-html="true"
                        title="${row["pcs_total_of_sku_in_fbasi"]} (${gettext("total in send-in")}) vs. ${row["max_allowed_send_in_pcs"]} (${gettext("limit")}) <br>-<br>${gettext("Qty of pcs in send-in exceeds Amazon limit and will likely be rejected. You can lower the submitted qty in the 'PCS / Ctn. (for AMZ)' column.")}">
                        <span class="mr-1">${data}</span>
                        <span><i class="warning_sign text-danger fas fa-ban"></i></span>
                      <\div>`
            }
          },
        },

        {
          "targets": "pcs_per_carton_for_amz",
          "data": "pcs_per_carton_for_amz",

          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
          },
          "render": function (data, type, row) {
            return editable_td_html(row["obj_id"], "pcs_per_carton_for_amz", row["carton_type"], data)
          },
        },

        {
          "targets": "c_length_for_amz",
          "data": "c_length_for_amz",
          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
          },
          "render": function (data, type, row) {
            return editable_td_html(row["obj_id"], "c_length_for_amz", row["carton_type"], data)
          },
        },

        {
          "targets": "c_width_for_amz",
          "data": "c_width_for_amz",
          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
          },
          "render": function (data, type, row) {
            return editable_td_html(row["obj_id"], "c_width_for_amz", row["carton_type"], data)
          },
        },

        {
          "targets": "c_height_for_amz",
          "data": "c_height_for_amz",
          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
          },
          "render": function (data, type, row) {
            return editable_td_html(row["obj_id"], "c_height_for_amz", row["carton_type"], data)
          },
        },

        {
          "targets": "c_weight_for_amz",
          "data": "c_weight_for_amz",
          "createdCell": function (td, cellData, rowData, row, col) {
            $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
          },
          "render": function (data, type, row) {
            return editable_td_html(row["obj_id"], "c_weight_for_amz", row["carton_type"], data)
          },
        },

              {
          "targets": "fba_size_category",
          "data": "fba_size_category",
          "render": function (data, type, row) {
            if (type === "display") {
              return data[1]
            } else {
              return data[0]
            }
          },
        },

        {
          "targets": "fba_reach_in_weeks_incl_pending",
          "render": function (data, type, row) {
            return (data * 7).toFixed(2)
          },
        },

        {
          "targets": "tags",
          "width": "1%",
          "render": function ( data, type, row ) {
            return `${tags_creator_fba_send_ins(row)}`
          },
        },
        {
          "targets": "actions",
          "data": "obj_id",
          "width": "1%",

          "render": function (data, type, row) {
            if (row["carton_type"] === "plain_carton") {
              return `
                      <i class="fa fa-trash text-danger text-center mr-1" onclick="remove_selected_fba_pcli_from_list.call(this)" style="cursor:pointer;" name="remove_from_selection" data-obj_id="${row["obj_id"]}" title="${gettext("Remove SKU from selection")}"></i>
                      <a href="${sku_stock_history_url}${row["sku_id"]}"> <i class="fas fa-list text-secondary mr-1" title="${gettext("See history log")}" style="cursor: pointer"></i> </a>
                      `
            } else if (row["carton_type"] === "mixed_carton") {
              return `
                      `
            }
          },
        },

      ],

      buttons: [
        {
          extend: 'colvis',
          columns: ':not(.noVis)',
          text: `<i class="fas fa-columns mr-1"></i>${gettext("Select Columns")}`,
        },
        {
          extend: 'collection',
          text: `<i class="fas fa-ellipsis-v mr-1"></i>${gettext("Actions")}`,
          buttons: [
            {
              text: `<i class="fas fa-magic mr-1"></i>${gettext("Set send in carton quantity to max. for selected")}`,
              action: function (e, dt, node, config) {
                $.ajax({
                  method: 'POST',
                  url: ajax_batch_update_values_url,
                  data_type: "json",
                  data: {
                    'obj_ids_list': JSON.stringify(create_obj_ids_list_for_fba_pclis_and_fba_mcs(dt)),
                    "action": "set_selected_fba_send_in_items_to_max",
                    "csrfmiddlewaretoken": csrfmiddlewaretoken,
                  },
                  success: function () {
                    dt.ajax.reload()
                  },
                  error: function () {
                    alert(gettext("Error. Something went wrong."))
                  }
                })

              }
            },

            {
              text: `<i class="fas fa-trash mr-1"></i>${gettext("Remove selected SKUs from current Send In")}`,
              action: function (e, dt, node, config) {
                var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
                  return dt.cell(row_indexes, "obj_id:name").data()
                })
                var data = {
                  'action': "batch_delete_fba_send_in_plain_carton_line_item",
                  'obj_ids_list': JSON.stringify(obj_ids_list),
                }
                var url = "/ajax_call/"
                updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = true)
                dt.rows('.selected').remove().draw()
              }
            },

            {
              text: `<i class="fas fa-columns mr-1"></i>${gettext("Save current columns as default")}`,
              action: function (e, dt, node, config) {
                dt_button_collection_close()
                save_invisible_columns_as_default_to_db(get_ci_sisi, "dt_selected_skus_pl")
              }
            },

          ]
        }
      ],

    rowGroup: {
      dataSrc: "main_grouping",
      startRender: function (rows, group, level) {
        if (level === 0) {
          if (rows.data()[0]["carton_type"] === "plain_carton") {
            return `<i class="fas fa-box text-secondary mr-1"></i>` + gettext("Plain Cartons")
            // return rows.data()[0]["cat_product_type"]
          } else if (rows.data()[0]["carton_type"] === "mixed_carton") {

            if(rows.data()[0]["mcli_id"] === "n.k."){
              class_empty = "empty"
            } else {
              class_empty = ""
            }

            return $(`<tr class="mixed_carton_group ${class_empty}"></tr>`)
              .append(`<td colspan="100%">
                              <div class="d-flex">
                                <span><i class="fas fa-box-open text-secondary mr-1"></i></span>
                                <span>${gettext("Mixed Carton ID")}${rows.data()[0]["obj_id"]}</span>
                                <span class="badge badge-pill bg-danger ml-auto mr-lg-4 py-2 d-flex align-items-center text-white"  
                                      onclick="delete_selected_fba_mc_from_list.call(this, ${rows.data()[0]["obj_id"]})" 
                                      style="cursor:pointer;"  
                                      name="remove_from_selection"  
                                      title="${gettext("Remove mixed carton from selection")}">
                                  <i class="mx-1 fa fa-trash  text-center"></i>
                                </span>
                              </div>
                        </td>`)
          }
        }
      }
    },

"createdRow": function (row, data, dataIndex) {
      if (data["cartons_left"] < data["fba_send_in_qty_cartons"] ){
        $(row).addClass("table-danger");
        $(row).attr("data-toggle", "tooltip");
        $(row).attr("title", gettext("You don't have enough cartons. Please reduce send in carton quantity!"));
        $("#btn_commit_fba_send_in").attr("disabled", true)
        $("#btn_commit_fba_send_in").attr("data-toggle", "tooltip");
        $("#btn_commit_fba_send_in").attr("title", gettext("You don't have enough cartons. Please reduce send in carton quantity!"));
      }
    },
      drawCallback: function () {
        var api = this.api();

        var pcs_sum_by_fba_size_category = calculate_pcs_sum_by_fba_size_category(api.table().rows({page : 'current'}));
        var ctns_sum = Math.round(api.column(get_ci_sisi["fba_send_in_qty_cartons_for_col_sum"], {page: 'current'}).data().sum());
        var ctns_weight_sum = Math.round(api.column(get_ci_sisi["carton_weight"], {page: 'current'}).data().sum());

        $(api.table().column(get_ci_sisi["fba_send_in_qty_cartons"]).footer()).html( `${ctns_sum} ${gettext("Ctns")}`);
        $(api.table().column(get_ci_sisi["fba_send_in_qty_cartons"]).footer()).attr("style", "vertical-align: top;");
        $(api.table().column(get_ci_sisi["fba_send_in_pcs_total"]).footer()).html(render_pcs_sum_by_fba_size_category(pcs_sum_by_fba_size_category));
        $(api.table().column(get_ci_sisi["carton_weight"]).footer()).html( `${ctns_weight_sum} ${gettext("kg")}`);

        // bind_editable_int_cell_events();
        $('span[name="editable_int_cell"]').on('click', edit_cell)
        $('[data-toggle="tooltip"]').tooltip({
          container: 'body',
        })
      }
    };

  dt_selected_skus_pl_config["columns"] = columns;
  $.extend(dt_selected_skus_pl_config, def_dt_settings_for_scroller);
  dt_selected_skus_pl_config["scrollY"] = "70vh";
  $('#dt_selected_skus_pl').DataTable( dt_selected_skus_pl_config );

}

function render_pcs_sum_by_fba_size_category(pcs_sum_by_fba_size_category) {
  var div_c = $('<div></div>');

  row = $('<div class="row bor border-bottom-custom-fbasi-sum" style="white-space: nowrap"></div>');
  var total_pcs = pcs_sum_by_fba_size_category["standard_size"] + pcs_sum_by_fba_size_category["oversize"] + pcs_sum_by_fba_size_category["unknown"];
  $(row).append(`<span class="col-6 text-left" title="${gettext("Total")}" data-toggle="tooltip">${gettext("Total")}</span>`);
  $(row).append(`<span class="col-6 text-right">${total_pcs} ${gettext("pcs")}</span>`);
  $(div_c).append(row);

  var row = $('<div class="row" style="white-space: nowrap"></div>');
  $(row).append(`<span class="col-6 text-left" title="${gettext("Standard Size")}" data-toggle="tooltip">${gettext("Standard")}</span>`);
  $(row).append(`<span class="col-6 text-right">${pcs_sum_by_fba_size_category["standard_size"]} ${gettext("pcs")}</span>`);
  $(div_c).append(row);

  row = $('<div class="row" style="white-space: nowrap"></div>');
  $(row).append(`<span class="col-6 text-left" title="${gettext("Oversize")}" data-toggle="tooltip">${gettext("Oversize")}</span>`);
  $(row).append(`<span class="col-6 text-right">${pcs_sum_by_fba_size_category["oversize"]} ${gettext("pcs")}</span>`);
  $(div_c).append(row);

  if(pcs_sum_by_fba_size_category["unknown"] > 0){
      row = $('<div class="row" style="white-space: nowrap"></div>');
      $(row).append(`<span class="col-6 text-left" title="${gettext("Unknown")}" data-toggle="tooltip">${gettext("??")}</span>`);
      $(row).append(`<span class="col-6 text-right">${pcs_sum_by_fba_size_category["unknown"]} ${gettext("pcs")}</span>`);
      $(div_c).append(row);
  }


  return $(div_c).prop('outerHTML')
}

function calculate_pcs_sum_by_fba_size_category(rows) {
  var pcs_sum_by_fba_size_category = {
    "standard_size": 0,
    "oversize": 0,
    "unknown": 0,
  };
  rows.data().each(function (r) {
    pcs_sum_by_fba_size_category[r["fba_size_category"][0]] += r["fba_send_in_pcs_total"];
  });
  return pcs_sum_by_fba_size_category
}


function get_dt_add_fba_send_in_skus_manually_columns() {
  var dt_add_fba_send_in_skus_manually_config_columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis", width: "5%"}];
  $.merge(dt_add_fba_send_in_skus_manually_config_columns, basic_sku_info_columns);
  $.merge(dt_add_fba_send_in_skus_manually_config_columns, [
    {
      "data": "purchase_order__order_name",
      "name": "purchase_order__order_name",
      className: "purchase_order__order_name cut_text",
      width: ""
    },
    {"data": "cartons_left", "name": "cartons_left", className: "cartons_left  dt-center", width: "5%"},
    {"data": "pcs_left", "name": "pcs_left", className: "pcs_left  dt-center", width: "5%"},
    {"data": "pcs_per_carton", "name": "pcs_per_carton", className: "pcs_per_carton  dt-center", width: "5%"},
    {
      "data": "fba_suggested_send_in_pcs_without_max_allowed_limit",
      "name": "fba_suggested_send_in_pcs_without_max_allowed_limit",
      className: "fba_suggested_send_in_pcs_without_max_allowed_limit send-in-calc dt-center",
      width: "5%"
    },
    {
      "data": "fba_reach_in_weeks_incl_pending",
      "name": "fba_reach_in_weeks_incl_pending",
      className: "fba_reach_in_weeks_incl_pending send-in-calc dt-center",
      width: "5%"
    },
    {
      "data": "sales_last_30_days",
      "name": "sales_last_30_days",
      className: "sales_last_30_days send-in-calc dt-center",
      width: "5%"
    },
    {
      "data": "TotalSupplyQuantity",
      "name": "TotalSupplyQuantity",
      className: "TotalSupplyQuantity send-in-calc dt-center",
      width: "5%"
    },
    {"data": "qty_ctn", "name": "qty_ctn", className: "qty_ctn text-center", width: "8%"},
    {"data": "carton_note", "name": "carton_note", className: "carton_note text-center", width: "150px"},
    {"data": "main_ordering", "name": "main_ordering", className: "main_ordering noVis"},
    {"data": "mcli_id", "name": "mcli_id", className: "mcli_id noVis"},
    {className: "text-center actions noVis", width: ""},
  ]);

  return dt_add_fba_send_in_skus_manually_config_columns
}


function initialize_dt_add_fba_send_in_skus_manually(dt_id="#dt_add_fba_send_in_skus_manually", category="") {
  var columns = get_dt_add_fba_send_in_skus_manually_columns();
  get_ci_asm = create_column_map(columns);

  var dt_add_fba_send_in_skus_manually_config = {
      "processing": true,
      "language": {
         "processing": gettext("Loading...")
      },
      "serverSide": true,

      "ajax": {
        url: ajax_get_table_data_url,
        method: "POST",
        dataType: 'json',
//        data: {
//          "fba_send_in_id": fba_send_in_id,
//          "action": "get_available_skus_for_send_in",
//          "category":category,
//          "csrfmiddlewaretoken": csrfmiddlewaretoken,
//        },
          "data": function ( d ) {
            data = {};
            data.json = JSON.stringify(d);

            data.fba_send_in_id = fba_send_in_id;
            data.action = "get_available_skus_for_send_in";
            data.category = category;
            data.csrfmiddlewaretoken = csrfmiddlewaretoken;
            return data;
          }
      },
    // Search Button
        initComplete : function() {
            add_search_for_server_side_table.call(this, dt_id)
        },

//      orderFixed: [
//        [get_ci_asm["main_ordering"], 'asc'],
//      ],
      orderFixed: [
        [get_ci_asm["cat_product_type"], 'asc'],
      ],

      "stateSave": false,
      "stateDuration": 0,

      "columnDefs": [
          {
            "targets": [
                "obj_id",
                "actions",
                "cartons_left",
                "pcs_left",
                "fba_suggested_send_in_pcs_without_max_allowed_limit",
                "fba_reach_in_weeks_incl_pending",
                "TotalSupplyQuantity",
                 "variation_name",
                "main_ordering",
                "mcli_id",
            ],
            "searchable":false
          },
          {
            "targets": [
                "pcs_per_carton",
                "carton_note",
            ],
            "visible":false
          },
          {
            "targets": [
              "obj_id",
              "actions",
              "cartons_left",
              "pcs_left",
              "fba_suggested_send_in_pcs_without_max_allowed_limit",
              "fba_reach_in_weeks_incl_pending",
              "TotalSupplyQuantity",
//              "variation_name",
              "main_ordering",
              "mcli_id",
              "purchase_order__order_name",
              // "sku",
              "sales_last_30_days",
              "small_image_url",
//              "cat_product_type",
//              "cat_color",
//              "cat_size",
//              "cat_shape",
//              "amz_title",
//               "FNSKU",
//               "ASIN",
//               "amz_product_id",
//               "Parent_ASIN",
              "pcs_per_carton",
              "carton_note",
            ],
            "orderable":false
          },
        {
          "targets": "obj_id",
          "data": "obj_id",
          "orderable": false,
          "render": function (data, type, row) {
            return ``
          },
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
                        onclick="redirect_blank('${get_img_url_base()}/dp/${row["ASIN"]}')"
                        width="50px" 
                        height="50px"
                        >
                    </div>`
      },
    },
        {
          "targets": "actions",
          "data": "obj_id",
          "render": function (data, type, row) {
            if (row["carton_type"] === "mixed_carton") {
              return ""
            } else {
              if (row["in_fbasi"]) {
                return `
                        <div class="add_buttons d-flex justify-content-end mr-2">
                           ${get_remove_from_selection_button_html(`remove_fba_pcli_by_pcli_id.call(this)`, data)}
                         </div>
                        `
              } else {
                return `
                        <div class="add_buttons d-flex justify-content-end mr-2">
                          ${get_add_to_selection_button_html(`add_selected_pcli_to_list.call(this)`, data)}
                         </div>
                        `
              }

            }
          },
        },

        {
          "targets": "purchase_order__order_name",
          "data": "purchase_order__order_name",
          "render": function (data, type, row) {
            return `<span class="d-inline-block text-truncate" style="max-width: 100%;" title="${data}">${data}<span>`
          },
        },
        {
          "targets": "sku",
          "data": "sku",
          "render": function (data, type, row) {
            if (row["auto_send_in_suggestion"] === "enabled") {
              return `${data}`
            } else {
              return `${data} <i class="fas fa-minus-circle-circle text-danger" title="${gettext("Automatic FBA Send In Suggestion has been disabled for this SKU")}" ></i>`
            }
          },
        },

        {
          "targets": "sales_last_30_days",
          "render": function (data, type, row) {
            return data.toFixed(2)
          },
        },

        {
          "targets": "fba_reach_in_weeks_incl_pending",
          "render": function (data, type, row) {
            return (data * 7).toFixed(2)
          },
        },
        {
          "targets": "qty_ctn",
          "data": "qty_ctn",
          "defaultContent": 1,
          "orderable": false,
          "searchable":false,
          "render": function (data, type, row) {
            return get_input_html("qty_ctn", "qty_ctn", 1, "number")
          }
        },
        {
          "targets": [
            "p_size",
            "cat_size",
            "cat_shape",
            "variation_name",
            "FNSKU",
            "ASIN",
            "cat_product_type",
            "cat_color",
            "main_ordering",
            "mcli_id",
          ],
          "visible": false,
        }
      ],

    rowGroup: {
      dataSrc: "main_ordering",
      startRender: function (rows, group, level) {
        if (level === 0) {
          if (rows.data()[0]["carton_type"] === "plain_carton") {
            return rows.data()[0]["cat_product_type"]
          } else if (rows.data()[0]["carton_type"] === "mixed_carton") {

            if (rows.data()[0]["mcli_id"] === "n.k.") {
              class_empty = "empty"
            } else {
              class_empty = ""
            }

            if(rows.data()[0]["in_fbasi"]){
              pill_btn = get_remove_from_selection_pill_button_mc_html(`delete_selected_fba_mc_from_list_by_mc_id.call(this, ${rows.data()[0]["obj_id"]})`, rows.data()[0]["obj_id"])
            } else{
              pill_btn = get_add_to_selection_pill_button_mc_html(`add_mixed_carton_to_fba_send_in.call(this, ${rows.data()[0]["obj_id"]})`, rows.data()[0]["obj_id"])
            }

            return $(`<tr class="mixed_carton_group ${class_empty}"></tr>`)
              .append(`<td colspan="100%">
                              <div class="d-flex add_buttons">
                                <span><i class="fas fa-box-open text-secondary mr-1"></i></span>
                                <span>${gettext("Mixed Carton ID")}${rows.data()[0]["obj_id"]}</span>
                                <div class="add_buttons ml-auto mr-2 ">${pill_btn}</div>

                              </div>
                        </td>`)
          }
        }
      }
    },



      buttons: [
        {
          extend: 'colvis',
          columns: ':not(.noVis)',
          text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
        },
        {
          text: `<i class="fas fa-plus-circle"></i> ${gettext("Add selected")}`,
          action: function (e, dt, node, config) {
            var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {

                qty_ctn = $(dt.cell(row_indexes, "qty_ctn:name").node()).find("input").val()
                pcli_id = dt.cell(row_indexes, "obj_id:name").data()

              return {"pcli_id": pcli_id, "qty_ctn":qty_ctn}
            })

            var data = {
              'action': "batch_add_fba_send_in_plain_carton_line_item",
              'obj_ids_list': JSON.stringify(obj_ids_list),
              'fba_send_in_id': fba_send_in_id,
            }
            var url = "/ajax_batch_update_values/"

            updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false)
            dt.rows('.selected').remove().draw()
          },
        },


      ],
      scrollY: '65vh',
      "lengthMenu": [[25, 50, 100, 500, -1], [25, 50, 100, 500, "All"]]

    };

  dt_add_fba_send_in_skus_manually_config["columns"] = columns
  $.extend(dt_add_fba_send_in_skus_manually_config, def_dt_settings);
  dt_add_fba_send_in_skus_manually_config["bPaginate"] = true;


  $(dt_id).DataTable(dt_add_fba_send_in_skus_manually_config);
}


function click_on_span_editable_int_cell() {
  edit_cell.call($(this).find('span[name="editable_int_cell"]'))
}


function editable_td_html(obj_id, t_field, carton_type, input_value) {
  if (carton_type === "mixed_carton" && t_field !== "pcs_per_carton_for_amz"){
    display = "style='display:none'"
  } else {
    display = ""
  }

  return `<div class="border border-light" ${display} onclick="click_on_span_editable_int_cell.call(this)" style="cursor: text">
          <span name="editable_int_cell" id="${obj_id}-${t_field}-${carton_type}-value" data-obj_id="${obj_id}" data-t_field="${t_field}" data-carton_type="${carton_type}" value=${input_value}>${input_value}</span>
          </div>`

}

function edit_cell() {
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var value = $(`span[id="${obj_id}-${t_field}-${carton_type}-value"]`).html();
  var td = $(this).closest("td")

  var ds_id = `${obj_id}-${t_field}-${carton_type}`
  var data_content = ` data-obj_id="${obj_id}" 
                  data-t_field="${t_field}" 
                  data-carton_type="${carton_type}" 
                   `

  td.html(
    `<input 
          id="${ds_id}-input" 
          class="result form-control" 
          ${data_content} 
          type="number" 
          min="0" 
          value="${value}"
          onfocus="this.select();"
          >`
  )
  $(`input[id="${ds_id}-input"]`).focus()

  td.attr('id', `${ds_id}-cell`);
  td.attr('data-t_field', t_field);

  handle_plain_carton_input_change.call(this, obj_id, t_field, carton_type)

  $(`input[id="${ds_id}-input"]`).keyup(function(event) {
    if (event.keyCode === 13) {
        btn_save.call(this);
    }
  });


  td.popover({
    placement: 'bottom',
    container: 'body',
    html: true,
    sanitize: false,
    show: true,
    content:  `<button id="${ds_id}-btn-save" onclick="btn_save.call(this)" class="btn btn-sm btn-success mr-2" ${data_content} name="table_edit_save_button">${gettext("Save")}</button>` +
              `<button id="${ds_id}-btn-cancel" onclick="btn_cancel.call(this)" class="btn btn-sm btn-danger" ${data_content} data-value_before="${value}" name="table_edit_cancel_button">${gettext("Cancel")}</button>`
  })
  td.popover().off('click')
  td.popover("show")
}

function handle_plain_carton_input_change(obj_id, t_field, carton_type) {
  if (t_field === "fba_send_in_qty_cartons") {
    $(`input[id="${obj_id}-${t_field}-${carton_type}-input"]`).on('change',
      function () {
        sync_total_pcs_with_ctn_qty_on_change.call(this)
        var value = $(this).val()
        if (check_if_not_higher_than_available_ctn_qty(value, obj_id, t_field, carton_type) === false) {
          alert(gettext(`You are trying to send in more cartons of this purchase order line item than you have.
            Please reduce send-in quantity or click on 'Add SKUs' in case you would like to add other purchase
            order line items (e.g. with the same SKUs).`))
        }
      }
    )
  }

  if (t_field === "pcs_per_carton_for_amz") {
    $(`input[id="${obj_id}-${t_field}-${carton_type}-input"]`).on('change',
      function () {
        sync_send_in_pcs_total_with_pcs_in_ctn_for_amz_on_change.call(this)
        var value = $(this).val()
        if (value < 1) {
          alert(gettext("There should be at least one pcs in the carton."))
        }
      }
    )
  }
}



function btn_save() {
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var ds_id = `${obj_id}-${t_field}-${carton_type}`
  var input_value = $(`#${ds_id}-input`).val()

  td = $(`td[id="${ds_id}-cell"]`)
  $(`button[id="${ds_id}-btn-save"]`).html(`<div class="spinner-border spinner-border-sm text-white" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`)


  if (t_field === "fba_send_in_qty_cartons") {
      if (check_if_not_higher_than_available_ctn_qty(input_value, obj_id, t_field, carton_type)) {
      } else {
        alert(gettext(`You are trying to send in more cartons of this purchase order line item than you have.
            Please reduce send-in quantity or click on 'Add SKUs' in case you would like to add other purchase
            order line items (e.g. with the same SKUs).`));
        return
      }
    }

  if (carton_type === "plain_carton") {
    action = "update_fba_planned_line_item"

  } else if (carton_type === "mixed_carton") {

    if (t_field === "fba_send_in_qty_cartons") {
      action = "update_fba_mixed_carton_planned"

    } else if (t_field === "pcs_per_carton_for_amz") {
      action = "update_fba_mixed_carton_line_item_planned"
      var td_node = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)
      obj_id = get_field_data_from_current_dt_row("fba_mcli_id", td_node)
    }
  }

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "obj_id": obj_id,
      "t_field": t_field,
      "input_value": input_value,
      "action": action,
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
    },
        success: function () {
      td.html(editable_td_html(obj_id, t_field, carton_type, input_value))
      $('#dt_selected_skus_pl').DataTable().ajax.reload();
      $("td").popover('hide')
      $(".tooltip").tooltip('hide')
      $('span[name="editable_int_cell"]').on('click', edit_cell)
    },
    error: function (request) {
      try {
        alert(request.responseJSON["error"]);
      } catch (e) {
        alert(gettext("Error. Line item could not be updated."))
      }
      $("td").popover('hide')
      $(".tooltip").tooltip('hide')
    }

  });

}

function btn_cancel() {
  $("td").popover('hide')
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var value_before = $(this).data('value_before')
  var td = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)

    if (t_field === "fba_send_in_qty_cartons") {
    reset_total_pcs_on_btn_cancel_ctn_qty(value_before, obj_id, t_field, carton_type)
  } else if (t_field === "pcs_per_carton_for_amz") {
    reset_total_pcs_on_btn_cancel_pcs_per_ctn_for_amz(value_before, obj_id, t_field, carton_type)
  }
  td.html(editable_td_html(obj_id, t_field, carton_type, value_before))
  $('span[name="editable_int_cell"]').on('click', edit_cell)
}

//
// function handle_btn_cancel(value_before, obj_id, t_field, carton_type) {
//
// }
//
//
// function handle_btn_save(input_value, obj_id, t_field, carton_type) {
//
// }

function check_if_not_higher_than_available_ctn_qty(fba_send_in_qty_cartons, obj_id, t_field, carton_type) {
  var td_node = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)
  return get_field_data_from_current_dt_row("cartons_left", td_node) >= fba_send_in_qty_cartons
}

function sync_total_pcs_with_ctn_qty_on_change() {
  var fba_send_in_qty_cartons = $(this).val()
  var pcs_in_carton = get_field_data_from_current_dt_row("pcs_per_carton_for_amz", $(this).closest("td"))
  var fba_send_in_pcs_total = fba_send_in_qty_cartons * pcs_in_carton
  set_field_data_from_current_dt_row(fba_send_in_pcs_total, "fba_send_in_pcs_total", $(this).closest("td"))
}

function sync_send_in_pcs_total_with_pcs_in_ctn_for_amz_on_change() {
  var pcs_in_carton = $(this).val()
  var fba_send_in_qty_cartons = get_field_data_from_current_dt_row("fba_send_in_qty_cartons", $(this).closest("td"))
  var fba_send_in_pcs_total = fba_send_in_qty_cartons * pcs_in_carton
  set_field_data_from_current_dt_row(fba_send_in_pcs_total, "fba_send_in_pcs_total", $(this).closest("td"))
}

function reset_total_pcs_on_btn_cancel_ctn_qty(fba_send_in_qty_cartons, obj_id, t_field, carton_type) {
  var td_node = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)
  var pcs_in_carton = get_field_data_from_current_dt_row("pcs_per_carton_for_amz", td_node)
  var fba_send_in_pcs_total = fba_send_in_qty_cartons * pcs_in_carton
  set_field_data_from_current_dt_row(fba_send_in_pcs_total, "fba_send_in_pcs_total", td_node)
}

function reset_total_pcs_on_btn_cancel_pcs_per_ctn_for_amz(pcs_per_carton_for_amz, obj_id, t_field, carton_type) {
  var td_node = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)
  var pcs_per_carton_for_amz = pcs_per_carton_for_amz
  var fba_send_in_qty_cartons = get_field_data_from_current_dt_row("fba_send_in_qty_cartons", td_node)
  var fba_send_in_pcs_total = fba_send_in_qty_cartons * pcs_per_carton_for_amz
  set_field_data_from_current_dt_row(fba_send_in_pcs_total, "fba_send_in_pcs_total", td_node)
}


function remove_selected_fba_pcli_from_list() {
  var fba_pcli_id = $(this).data('obj_id')
  var table_id = $(this).closest("table").attr("id")
  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "fba_pcli_id": fba_pcli_id,
      "action": "remove_selected_fba_pcli_from_list",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      if (table_id.length > 0) {
        $("#" + table_id).DataTable().ajax.reload();
      }
    }
  })
}


function remove_fba_pcli_by_pcli_id() {
  var pcli_id = $(this).data('obj_id')

  $(this).closest("div.add_buttons").html(get_add_to_selection_button_html(`add_selected_pcli_to_list.call(this)`, pcli_id))

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "pcli_id": pcli_id,
      "fba_send_in_id": fba_send_in_id,
      "action": "remove_fba_send_in_plain_carton_line_item_by_pcli_id",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert(gettext("Error. SKU was not deleted from FBA Send-In."))
    }
  })
}

function add_selected_pcli_to_list() {
  var obj_id = $(this).data('obj_id')
  var qty_ctn = $(this).closest("tr").find("#qty_ctn").val();

  var dt = $(this).closest("table").DataTable();
  var td_node = $(this).closest("td");
  var current_row = dt.cell(td_node).index()["row"];
  var cartons_left = dt.cell(current_row, "cartons_left:name").data()

  if(qty_ctn > cartons_left){
    alert(gettext("Carton quantity is more than cantons left of purchase order."))
    return;
  }

  $(this).closest("div.add_buttons").html(get_remove_from_selection_button_html(`remove_fba_pcli_by_pcli_id.call(this)`, obj_id))

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "plain_carton_line_item_id": obj_id,
      "fba_send_in_id": fba_send_in_id,
      "qty_ctn": qty_ctn,
      "action": "add_fba_send_in_plain_carton_line_item",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert(gettext("Error. SKU was not added to FBA Send-In."))
    }
  })
}


function add_mixed_carton_to_fba_send_in(mc_id) {
  $(this).closest("div.add_buttons").html(get_remove_from_selection_pill_button_mc_html(`delete_selected_fba_mc_from_list_by_mc_id.call(this, ${mc_id})`, mc_id))

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "mc_id": mc_id,
      "fba_send_in_id": fba_send_in_id,
      "action": "add_mixed_carton_to_fba_send_in",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert(gettext("Error. Mixed carton could not be added to FBA send-in."))
    },
  })
}

function delete_selected_fba_mc_from_list_by_mc_id(mc_id) {
  $(this).closest("div.add_buttons").html(get_add_to_selection_pill_button_mc_html(`add_mixed_carton_to_fba_send_in.call(this, ${mc_id})`, mc_id))
  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "mc_id": mc_id,
      "fba_send_in_id": fba_send_in_id,
      "action": "delete_selected_fba_mc_from_list_by_mc_id",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert(gettext("Error. Mixed carton could not be deleted to FBA send-in."))
    },
  })
}

function delete_selected_fba_mc_from_list(fba_mc_id) {
  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "fba_mc_id": fba_mc_id,
      "fba_send_in_id": fba_send_in_id,
      "action": "delete_selected_fba_mc_from_list",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      $('#dt_selected_skus_pl').DataTable().ajax.reload()
    },
    error: function () {
      alert(gettext("Error. Mixed carton could not be deleted to FBA send-in."))
    },
  })
}

function updateDisplay ()  {
  fetch(check_display_url).then(function(response) {
    response.json().then(function(data) {
      processing_status = data.display_type;
      if (processing_status === "working") {
        setTimeout(updateDisplay, 500);
      } else if (processing_status === "standard" && processing_status !== display_type){
        location.reload();
      } else if (processing_status === "failed" && processing_status !== display_type){
        location.reload();
      }else if (processing_status === "standard"){

      }
    });
  });
}


function bind_tab_switching_functionality() {
  $('.nav-tabs a').on('click', function (e) {
    e.preventDefault();
    add_switch_modal_tabs_functionality.call(this)
  });
}

function add_switch_modal_tabs_functionality() {
  $(this).tab('show');
  dt_id =  $(this).data('dt_id');
    if (!$.fn.DataTable.isDataTable(dt_id)) {
      var category =  $(this).data('category');
      initialize_dt_add_fba_send_in_skus_manually(dt_id, category)
    } else {
      $(dt_id).DataTable().ajax.reload();
    }
}

function create_obj_ids_list_for_fba_pclis_and_fba_mcs(dt) {
  return $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    console.log()
    if (["plain_carton"].includes(dt.cell(row_indexes, "carton_type:name").data())) {
      return dt.cell(row_indexes, "obj_id:name").data() + "." + dt.cell(row_indexes, "carton_type:name").data()
    } else if (dt.cell(row_indexes, "carton_type:name").data() === "mixed_carton") {
      return dt.cell(row_indexes, "obj_id:name").data() + "." + dt.cell(row_indexes, "carton_type:name").data()
    }
  })
}

function show_changes_btn(){
}