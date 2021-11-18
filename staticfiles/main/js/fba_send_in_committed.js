$(document).ready( function () {
  register_datatable_sums_functionality()
  initialize_dt_selected_skus_committed()
  updateProgress()
  updateDisplay()
  bind_on_table_drawn_events()
} );


function get_dt_selected_skus_committed_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis no_export", width: "5%"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
        {"data": "purchase_order__order_name", "name": "purchase_order__order_name",   className: "purchase_order__order_name  cut_text"  },
        {"data": "fba_send_in_qty_cartons",    "name": "fba_send_in_qty_cartons",      className: "fba_send_in_qty_cartons dt-center"     },
        {"data": "fba_send_in_pcs_total",      "name": "fba_send_in_pcs_total",        className: "fba_send_in_pcs_total dt-center"       },
        {"data": "est_stock_value_EUR",         "name": "est_stock_value_EUR",         className: "est_stock_value_EUR  dt-center"             },
        {"data": "pcs_per_carton_for_amz",     "name": "pcs_per_carton_for_amz",       className: "pcs_per_carton_for_amz  dt-center"             },
        {                                       "name": "c_dimensions",                className: "c_dimensions "},
        {"data": "cartons_left",               "name": "cartons_left",                 className: "cartons_left  dt-center"     },
        {"data": "carton_note",               "name": "carton_note",                 className: "carton_note "     , width: "150px"},
        {
          "data": "carton_weight",          "name": "carton_weight",                className: "carton_weight",
        },
        {                                      "name": "tags",                         className: "tags no_export"              },
        {"data": "send_in_status",             "name": "send_in_status",               className: "send_in_status  dt-center text-center"  , width: "150px"           },
        {"data": "send_in_error_message",      "name": "send_in_error_message",        className: "send_in_error_message noVis no_export"           },
        {"data": "qty_cartons_not_found",      "name": "qty_cartons_not_found",        className: "qty_cartons_not_found noVis no_export"           },
        {"data": "ShipmentName",               "name": "ShipmentName",                 className: "ShipmentName  noVis"                   },
        {"data": "ShipmentStatus",             "name": "ShipmentStatus",               className: "ShipmentStatus  noVis"                 },
        {"data": "ShipmentId",                 "name": "ShipmentId",                   className: "ShipmentId  noVis"                     },
        {"data": "main_ordering",                 "name": "main_ordering",                   className: "main_ordering  noVis no_export"                     },
        {"data": "fba_mcli_id",                 "name": "fba_mcli_id",                   className: "fba_mcli_id  noVis"                     },
        {"data": "fba_send_in_qty_cartons_for_col_sum",                 "name": "fba_send_in_qty_cartons_for_col_sum",                   className: "fba_send_in_qty_cartons_for_col_sum  noVis no_export"                     },
        {"data": "carton_weight_for_col_sum",                 "name": "carton_weight_for_col_sum",                   className: "carton_weight_for_col_sum  noVis no_export"                     },
  ]);

  return columns
}

function initialize_dt_selected_skus_committed(){
  var columns = get_dt_selected_skus_committed_columns();
  get_ci_sic = create_column_map(columns);

  var dt_selected_skus_committed_config = {
      "ajax": {
        url: ajax_get_table_data_url,
        method: "POST",
        dataType: 'json',
        data: {
          "fba_send_in_id" : fba_send_in_id,
          "action": "get_fba_committed_skus",
          "csrfmiddlewaretoken": csrfmiddlewaretoken,
        },
      },

      "columnDefs": [
        {
          "targets": dt_selected_skus_committed_invisible_columns_def,
          "visible": false,
        },
        {
          "targets": [
            "main_ordering",
            "fba_mcli_id",
            "fba_send_in_qty_cartons_for_col_sum",
            "carton_weight_for_col_sum",
            "c_dimensions",
            "carton_note",
          ],
          "visible": false,
        },
        {
          "targets": [
            "fba_send_in_qty_cartons",
            "fba_send_in_pcs_total",
            "pcs_per_carton",
            "send_in_status",
          ],
          "width": "10%",
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
         "targets": "c_dimensions",
         "data":null,
          render: function(data, type, row){
             var dims = `<div style="white-space: nowrap">${row["c_length"]} x ${row["c_width"]} x ${row["c_height"]} cm | ${row["c_weight"]} kg</div>`;

             if(row['carton_type'] === 'mixed_carton'){
                return `<span style='display:none;' data-mc_id=${row["obj_id"]}>${dims}</span>`
              }
              return dims
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
          "targets": "tags",
          "width": "1%",
          "render": function ( data, type, row ) {
            return `${tags_creator_fba_send_ins(row)}`
          },
        },
        {
          "targets": "fba_mcli_id",
          "render": function ( data, type, row ) {
            if(type === "export"){
              if(data === "n.a."){
                return ""
              } else{
                return gettext("Mixed Carton") + `ID - ${row["obj_id"]}`
              }
            } else {
              return data
            }
          },
        },
        {
          "targets": "send_in_status",
          "data": "send_in_status",
          "render": function ( data, type, row ) {
            if (type === "export"){
              return data
            } else {
              return `${send_in_status_to_icons_mapper(data, row)}`
            }
          },
        },

        {
          "targets": "fba_send_in_qty_cartons",
          "data": "fba_send_in_qty_cartons",
          "createdCell": function (td, cellData, rowData, row, col) {
            if ( rowData["qty_cartons_not_found"] > 0  ) {$(td).addClass('text-danger');}
          },
          "render": function ( data, type, row ) {
            if (type === "display"){
              if (row["carton_type"] === "mixed_carton") {
                display = "style='display:none'"
              } else {
                display = ""
              }

              var really_sent = data - row["qty_cartons_not_found"]
              if (row["qty_cartons_not_found"] > 0){
                return `<div ${display}>${really_sent} (${row["qty_cartons_not_found"]} ${gettext("ctns. not found")})</div>`
              }
              else {
                return `<div ${display}>${data}</div>`
              }
            } else{
                return data
            }
          },
        },

        {
          "targets": "cartons_left",
          "data": "cartons_left",
          "render": function (data, type, row) {
            if (type === "display") {
              if (row["carton_type"] === "mixed_carton") {
                display = "style='display:none'"
              } else {
                display = ""
              }
              return `<div ${display}>${data}</div>`
            } else {
              return data
            }
          },
        },
        {
          "targets": "sku",
          "data": "sku",
          "render": function ( data, type, row ) {
            if (row["auto_send_in_suggestion"] === "enabled"){
              return `<span class="d-inline-block text-truncate" style="max-width: 100%;" title="${data}">
                                     ${data}
                                <\span>`
            }
            else {
              return `${data}`
            }
          },
        },

        {
          "targets": "purchase_order__order_name",
          "data": "purchase_order__order_name",
          "render": function ( data, type, row ) {
            return `<span class="d-inline-block text-truncate" style="max-width: 100%;" title="${data}">${data}<\span>`
          },
        },

      ],

    "createdRow": function (row, data, index) {
      if (data["carton_type"] === "mixed_carton") {
        $(row).addClass("mixed_carton")
      }

      if (data["send_in_status"] === "cancelled") {
        $(row).addClass('cancelled');
        $(row).addClass('table-secondary');
      } else if (data["send_in_status"] === "failed") {
        $(row).addClass('table-danger');
      } else if (data["send_in_status"] === "success") {
      }
      if (data["send_in_error_message"].length > 0) {
      }
      if (data["qty_cartons_not_found"] > 0) {
        $(row).addClass('partially');
      }
    },

      buttons: [
        {
          extend: 'colvis',
          columns: ':not(.noVis)',
          text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
        },
        {
        extend: 'collection',
        text: '<i class="fas fa-file-export mr-1"></i>' + gettext("Export"),

        buttons: [
          {text: `<i class="fa fa-eye mr-1"></i><strong>${gettext('Export visible columns:')}</strong>`},
          {
            extend: 'copy',
            text: gettext('Copy to Clipboard'),
            exportOptions: {
              columns: [':visible:not(.no_export)' ],
              orthogonal: 'export',
            }
          },
          {
            extend: 'excel',
            text: 'Excel',
            exportOptions: {
              columns: ':visible:not(.no_export)',
              orthogonal: 'export',
            }
          },
          {text: "<hr class='p-0 m-0'>"},
          {text: `<strong>${gettext('Export all columns:')}</strong>`},
          {
            extend: 'copy',
            text: gettext('Copy to Clipboard'),
            exportOptions: {
              columns: ['th:not(.no_export)' ],
              orthogonal: 'export',
            }
          },
          {
            extend: 'excel',
            text: 'Excel',
            exportOptions: {
              columns: 'th:not(.no_export)',
              orthogonal: 'export',
            }
          },
        ]
      },
        {
          extend: `collection`,
          text: `<i class="fas fa-ellipsis-v"></i>  ${gettext("Actions")}`,
          buttons: [
            {
              text: `<i class="fas fa-trash"></i> ${gettext("Cancel failed line items")}`,
              action: function ( e, dt, node, config ) {
                var data = {
                  'action': "cancel_failed_fba_send_in_line_items",
                  'fba_send_in_id': fba_send_in_id,
                }
                var url = "/ajax_call/"
                updatePOST(url, data, headers={}, redirect_url="", refresh_var=true)
              }
            },

            {   text: `<i class="fas fa-columns"></i> ${gettext("Save current columns as default")}`,
                action: function ( e, dt, node, config ) {
              dt_button_collection_close()
              save_invisible_columns_as_default_to_db(get_ci_sic, "dt_selected_skus_committed")
            }},

          ]
        }
      ],

    orderFixed: [
      [get_ci_sic["ShipmentName"], 'asc'],
      [get_ci_sic["main_ordering"], 'asc'],
    ],

    order: [
      [get_ci_sic["sku"], 'asc'],
    ],

    rowGroup: {
      dataSrc: ["ShipmentName", "main_ordering"],
      startRender: function (rows, group, level) {
        if (level === 0) {
          if (rows.data()[0]["error_message"] !== "n.a.") {
            error_msg = `<span class="px-1">
                            <i  class="ml-2 fas fa-exclamation-triangle text-danger error_popup" 
                                style="font-size: 1.8rem; 
                                cursor: pointer" 
                                title="${gettext("Error Response from Amazon")}" 
                                data-error_msg="${rows.data()[0]["error_message"]}" 
                                >
                            </i>
                         </span>`
          }
          else {
            error_msg = ""
          }

          if (rows.data()[0]["TransportFeeCurrency"] !== "n/a") {

            if (rows.data()[0]["TransportFeeAmount_per_Carton"] > 3.33){
              high_cost_warning = `<i class="fa fa-exclamation-triangle text-danger"></i>`;
              high_cost = gettext("Above average")
             } else {
              high_cost_warning = "";
              high_cost = "";
            }

            fee_info = `<span class="px-1" 
                            data-toggle="tooltip" data-html="true"
                            title="${high_cost} ${gettext("Amazon Transport Fees for Inbound Shipment.")}<br>
                                    ${gettext("Total: ")}${rows.data()[0]["TransportFeeAmount"]} ${rows.data()[0]["TransportFeeCurrency"]} | 
                                    ${gettext("Per Carton: ")}${rows.data()[0]["TransportFeeAmount_per_Carton"]} ${rows.data()[0]["TransportFeeCurrency"]}">
                            - ${rows.data()[0]["TransportFeeAmount_per_Carton"]} ${rows.data()[0]["TransportFeeCurrency"]} / ${gettext("Ctn.")}
                            ${high_cost_warning}
                         </span>`
          } else {
            fee_info = ""
          }

          var url_base = "sellercentral-europe.amazon.com";
          if (target_marketplace === "amazon.com"){
            url_base = "sellercentral.amazon.com";
          }
          var amz_inbound_shipment_id = rows.data()[0]["amz_inbound_shipment_id"]
          var cancel_shipm_btn = $(`<span class=" badge  badge-danger p-2" 
                                        data-html="true"
                                        data-toggle="tooltip"
                                        title="${gettext("Cancel complete shipment in VentoryOne and in SellerCentral.<br>Shipment fees will be voided, if possible.")}"
                                        style="display: None; width:9em; height: 2.4em; cursor: pointer"
                                        onclick="cancel_whole_shipment(amz_inbound_shipment_id=${amz_inbound_shipment_id})">
                                      <div class="text-center"><i class="fa fa-times mr-1"></i>${gettext("Void")}</div>
                                  </span>`)

          var shipm_status_badge = $(`<span class="badge badge-${ShipmentStatus_to_color_mapper(rows.data()[0]["ShipmentStatus"])} p-2 d-flex justify-content-around align-items-center" style="width:9em; height: 2.4em">
                                      <div class="text-center">${rows.data()[0]["ShipmentStatus"]}</div>
                                  </span>`)

          if (!["DELETED", "CANCELLED"].includes(rows.data()[0]["ShipmentStatus"]) && !isNaN(amz_inbound_shipment_id) && api_processing_status!=="running"){
            cancel_shipm_btn.addClass("cancel_shipm_btn")
            shipm_status_badge.addClass("shipment_status_badge")
          }

          return $('<tr class="rowg shipment_details_row_group"></tr>')
            .append(`<td colspan="100%">
                            <div class="d-flex align-items-center">
                                <span>${rows.data()[0]["ShipmentName"]} - </span>
                                <span class="ml-1"><a target="_blank" href="https://${url_base}/gp/fba/inbound-shipment-workflow/index.html#${rows.data()[0]["ShipmentId"]}/summary/shipmentEvent">${rows.data()[0]["ShipmentId"]}</a></span>
                                ${error_msg}
                                ${fee_info}
                                <span class="ml-auto d-flex justify-content-around align-items-center" data-amz_inbound_shipment_id=${rows.data()[0]["amz_inbound_shipment_id"]}>
                                  ${cancel_shipm_btn.prop("outerHTML")}
                                  ${shipm_status_badge.prop("outerHTML")}
                                </span>
                            </div>
                          </td>`)
        } else if (level === 1) {
          if (rows.data()[0]["carton_type"] === "plain_carton") {
            return
          } else if (rows.data()[0]["carton_type"] === "mixed_carton") {
            if (rows.data()[0]["send_in_error_message"] !== "n.a." && rows.data()[0]["send_in_error_message"] !== "") {
              error_msg = `<span class="px-1">
                              <i  class="ml-2 fas fa-exclamation-triangle text-danger error_popup" 
                                  style="font-size: 0.9rem; cursor: pointer" 
                                  title="${gettext("Error Response from Amazon")}" 
                                  data-error_msg="${rows.data()[0]["send_in_error_message"]}" 
                                  >
                              </i>
                            </span>`
            } else {
              error_msg = ""
            }
            return $('<tr class="rowg mixed_carton_group"></tr>').append(`<td colspan="100%"><div class="d-flex">
                                <span><i class="fas fa-box-open text-secondary mr-1"></i></span>
                                <span>${gettext("Mixed Carton ID")}${rows.data()[0]["obj_id"]}</span>
                                ${error_msg}
                              </div></td>`)
          }
        }
      },
      endRender: function (rows, group) {
      },
    },

      drawCallback: function () {
        var api = this.api(),
          ctn_qty_sum_not_cancelled = 0, ctn_qty_sum_total = 0,
          pcs_sum_not_cancelled = 0, pcs_sum_total = 0, sum_est_stock_value_EUR = 0;

        api.rows(":not('.cancelled'):not('.failed')").every(function() {
          ctn_qty_sum_not_cancelled += parseFloat(this.data()["fba_send_in_qty_cartons_for_col_sum"]-this.data()["qty_cartons_not_found"]);
          sum_est_stock_value_EUR += parseFloat(this.data()["est_stock_value_EUR"]);
        });

        api.rows().every(function() {
          ctn_qty_sum_total += parseFloat(this.data()["fba_send_in_qty_cartons_for_col_sum"]);
        });

        $( api.table().column('.fba_send_in_qty_cartons').footer() ).html( Math.round(ctn_qty_sum_not_cancelled) + " " + gettext("of") +" "+ Math.round(ctn_qty_sum_total) + " " + gettext("Ctns."));

        api.rows(":not('.cancelled'):not('.failed')").every(function() {
          pcs_sum_not_cancelled += parseFloat(this.data()["fba_send_in_pcs_total"]-this.data()["qty_cartons_not_found"]*this.data()["pcs_per_carton"]);
        });

        api.rows().every(function() {
          pcs_sum_total += parseFloat(this.data()["fba_send_in_pcs_total"]);
        });
        $( api.table().column('.fba_send_in_pcs_total').footer() ).html( Math.round(pcs_sum_not_cancelled) + " " + gettext("of") +" "+ Math.round(pcs_sum_total) + " " + gettext("Pcs."));
        $( api.table().column('.est_stock_value_EUR').footer() ).html(format_number(sum_est_stock_value_EUR, decimals=2) + " " + main_currency_sign);
        update_shipment_creation_progress_bar(api)

        var ctns_weight_sum = Math.round(api.column(".carton_weight_for_col_sum", {page: 'current'}).data().sum());
        $(api.table().column(".carton_weight").footer()).html( `${ctns_weight_sum} ${gettext("kg")}`);
      }

    };

  dt_selected_skus_committed_config["columns"] = columns;
  $.extend(dt_selected_skus_committed_config, def_dt_settings_for_scroller);
  $('#dt_selected_skus_committed').DataTable(dt_selected_skus_committed_config);

}

function updateProgress ()  {
  fetch(check_progress_url).then(function(response) {
    response.json().then(function(data) {
      api_processing_status = data.api_processing_status;
      completion_percentage = data.completion_percentage;
      process_status_description = data.process_status_description;

      $('#shipment_creation_progress_bar').attr("style",`width: ${completion_percentage}%`)
      $('#shipment_progress_status_description').html(process_status_description)
      $('#dt_selected_skus_committed').DataTable().ajax.reload();

      if (api_processing_status === "running") {
        setTimeout(updateProgress, 3000);
      } else if (api_processing_status === "completed"){
        $('#shipment_creation_progress_bar').attr("class", "progress-bar bg-success")
      } else if (api_processing_status === "failed"){
        $('#shipment_creation_progress_bar').attr("class", "progress-bar bg-danger")
        solve_issue_button = `<button class='btn btn-danger ml-auto' style='float:right; margin-bottom:5px;'
                                onclick="window.open('https://intercom.help/ventoryone/de/collections/2896002-fba-einsendungen-fehlermeldung-von-amazon-rotes-dreieck','_blank')">
                                <i class="fa fa-arrow-right mr-1"></i>${gettext('Solve Issue')}
                              </button>`
        $('#progress_description_container').append(solve_issue_button)
      }

    });
  });
}


function ShipmentStatus_to_color_mapper(ShipmentStatus) {
  if (ShipmentStatus ==="WORKING"){
    return "warning"
  }

  else if (ShipmentStatus ==="SHIPPED"){
    return "primary"
  }

  else if (ShipmentStatus ==="RECEIVING"){
    return "success"
  }

  else if (ShipmentStatus ==="DELETED"){
    return "danger"
  }
  else if (ShipmentStatus ==="CANCELLED"){
    return "danger"
  }
  else if (ShipmentStatus ==="NOT_EXISTENT"){
    return "light"
  }
  else if (ShipmentStatus ==="DELIVERED"){
    return "success"
  }

}

function send_in_status_to_icons_mapper(data, row) {
  carton_type = row["carton_type"]

  if (data === "successful"){
    return `<div class="row justify-content-center align-items-center">
                    <span class="m-1"> <i class="fas fa-circle text-success" title="${gettext("Successfully created in Amazon")}"></i></span>
                    <span class="m-1"><i class="fas fa-trash text-danger" data-toggle="tooltip" title="${gettext("Cancel this carton. It will then return to your available stock.")}" data-obj_id="${row["obj_id"]}" onclick="cancel_committed_fba_send_in_line_item.call(this, '${carton_type}')" style="cursor:pointer;"></i></span>
                </div>`
  }
  else if (data === "possible"){
    if (api_processing_status === "running"){
      return `<div class="row justify-content-center ">
                        <span class="m-1">
                            <div class="spinner-grow spinner-grow-sm text-warning" title="${gettext("In progress")}" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </span>
                    </div>
                    `
    } else {
      return `<div class="row justify-content-center ">
                    <span class="m-1"><i class="fas fa-circle text-warning" data-toggle="tooltip" title="${gettext("Failed, but potentially still possible. Please check the error message.")}" ></i></span>
                    <span class="m-1"><i class="fas fa-trash text-danger" data-toggle="tooltip" title="${gettext("Cancel this carton")}" data-obj_id="${row["obj_id"]}" onclick="cancel_committed_fba_send_in_line_item.call(this, '${carton_type}')" style="cursor:pointer;"></i></span>
                </div>`
    }
  } else if (data === "failed") {
    if (row["send_in_error_message"] !== "") {
      error_msg = `. ${gettext("Line item currently not permitted by Amazon. Reason:")} ${row["send_in_error_message"]}`
    } else {
      error_msg = ""
    }
    return `<div class="row justify-content-center ">
                    <span class="m-1"><i class="fas fa-circle text-danger" data-toggle="tooltip" title="${gettext("Cancelled")}${error_msg}" ></i></span>
                    <span class="m-1"><i class="fas fa-trash text-danger" data-toggle="tooltip" title="${gettext("Cancel this carton")}" data-obj_id="${row["obj_id"]}" onclick="cancel_committed_fba_send_in_line_item.call(this, '${carton_type}')" style="cursor:pointer;"></i></span>
                </div>`

  } else if (data === "cancelled") {
    if (row["send_in_error_message"]!== ""){
      error_msg = `. ${gettext("Line item currently not permitted by Amazon. Reason:")} ${row["send_in_error_message"]}`
    } else{
      error_msg = ""
    }
    return `<div class="row justify-content-center ">
                    <span class="m-1"><i class="fas fa-circle text-danger" data-toggle="tooltip" title="${gettext("Cancelled")}${error_msg}" ></i></span>
<!--                    <span class="m-1"></span>-->
                </div>`
  }
  else if (data === "not_attempted"){
    return `<div class="row justify-content-center ">
                    <span class="m-1"><i class="fas fa-circle text-secondary" data-toggle="tooltip" title="${gettext("Not tried to create in Amazon, yet")}" ></i></span>
                    <span class="m-1"><i class="fas fa-trash text-danger" data-toggle="tooltip" title="${gettext("Cancel this line item")}" data-obj_id="${row["obj_id"]}" onclick="cancel_committed_fba_send_in_line_item.call(this, '${carton_type}')" style="cursor:pointer;"></i></span>
                </div>`
  }
  else{
    return data
  }

}


function shipment_reset_complete() {
  var ShipmentId = $(this).data("shipmentid")
}

function shipment_reset_keep_id() {
  var ShipmentId = $(this).data("shipmentid")
  var table_id = $(this).closest("table").attr("id")
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "ShipmentId" : ShipmentId,
      "action": "shipment_reset_keep_id",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      if (table_id.length > 0){$("#"+table_id).DataTable().ajax.reload();}
    }
  })
}



function check_shipment_status(obj_id){
  $(".loader-wrapper").fadeIn("slow");
  $.ajax({
    method:'POST',
    url: ajax_call_url,
    data: {
      "fba_send_in_id" : obj_id,
      "action": "refresh_amz_inbound_shipment_status",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      window.location= redirect_fba_send_in_url
    }
  })
}

function open_error_msg_popover(keep_open=false) {
  error_msg = $(this).data('error_msg')
  $(this).popover({
            placement: 'bottom',
            container: 'body',
            html: true,
            sanitize: false,
            content: error_msg
        })
  $(this).popover('show');

  if (keep_open === false){
    $(this).on("mouseleave", function (e) {
      $(this).popover("hide");}
    )
  }
  $("html").on("mouseup", function (e) {
    var l = $(e.target);
    if (l[0].className.indexOf("popover") == -1) {
      $(".popover").each(function () {
        $(this).popover("hide");
      });
    }
  });
}



function cancel_committed_fba_send_in_line_item(carton_type) {
  var obj_id = $(this).data('obj_id')
  var table_id = $(this).closest("table").attr("id")

  $(this).replaceWith(`<div class="spinner-border spinner-border-sm text-danger" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "fba_send_in_line_item_id" : obj_id,
      "action": "cancel_committed_fba_send_in_line_item",
      "carton_type": carton_type,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      if (table_id.length > 0){$("#"+table_id).DataTable().ajax.reload();}
    }
  })
}



function hide_popover_of_elem_with_id(ele_id) {
  $(`#${ele_id}`).popover('hide');
}

function confirm_cancellation_of_fba_line_item(obj_id) {
  var qty_cartons_lost = $(`#${obj_id}-amount_cancelled_cartons-input`).val();

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "action": "set_lost_fba_pcli",
      "fba_pcli_id" : obj_id,
      "qty_cartons_lost" : qty_cartons_lost,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $("#dt_selected_skus_committed").DataTable().ajax.reload();
    }
  })

  hide_popover_of_elem_with_id(`${obj_id}-cancel-icon`)
}

function cancel_whole_shipment(amz_inbound_shipment_id) {
  $(`[data-amz_inbound_shipment_id=${amz_inbound_shipment_id}]`).html(`<span class=" badge  badge-danger p-2"
                                        style=" width:9em; height: 2.4em">
                                      <div class="spinner-border text-white spinner-border-sm" style="width: 1rem; height: 1rem;" role="status">
                                <span class="sr-only">${gettext("Loading...")}</span>
                              </div>
                                  </span>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "action": "cancel_whole_shipment",
      "amz_inbound_shipment_id" : amz_inbound_shipment_id,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $("#dt_selected_skus_committed").DataTable().ajax.reload();
      alert(gettext("Shipment has been successfully cancelled."))
    },
    error:function(){
      alert(gettext("Error. Something went wrong."))
    }
  })
}

function open_popover_shipped_fba_line_item(obj_id) {
  $(this).popover({
    placement : 'bottom',
    container: 'body',
    html:true,
    sanitize: false,
    content :  `<div>
                        <label class="mr-sm-2" for="inlineFormCustomSelect">${gettext("How many cartons could not be found?")}</label>
                        <input id="${obj_id}-amount_cancelled_cartons-input" class="result form-control" type="number" min="0" value="0">\`
                    </div>
                    <div>
                        <button  onclick="confirm_cancellation_of_fba_line_item.call(this, ${obj_id})" class="btn btn-sm btn-info mr-2">${gettext("Confirm")}</button>
                        <button  onclick="hide_popover_of_elem_with_id('${obj_id}-cancel-icon')" class="btn btn-sm btn-danger">${gettext("Cancel")}</button>
                    </div>
`
  }).popover('show')
}

function updateDisplay()  {
  fetch(check_display_url).then(function(response) {
    response.json().then(function(data) {
      processing_status = data.display_type;
      if (processing_status === "working") {
        setTimeout(updateDisplay, 2000);
      } else if (processing_status === "standard" && processing_status !== display_type){
        window.location = redirect_fba_send_in_url
      } else if (processing_status === "failed" && processing_status !== display_type){
        window.location = redirect_fba_send_in_url
      }else if (processing_status === "failed_create_location_outbound_events" && processing_status !== display_type){
        window.location = redirect_fba_send_in_url
      }else if (processing_status === "standard"){

      }
    });
  });
}

function bind_on_table_drawn_events() {
  $('#dt_selected_skus_committed').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
    $(".tooltip").tooltip('hide');

    $(".error_popup").on('mouseover', function () {
      open_error_msg_popover.call(this)
    })

    $(".error_popup").on('click', function () {
      $(this).unbind("mouseover")
      $(this).unbind("mouseleave")
      open_error_msg_popover.call(this, true)
    })


  });
}

function update_shipment_creation_progress_bar(api){
        failed_shipments = 0;
        shipment_ids = []
        api.rows().every(function() {
            if(this.data()["error_message"] !== "n.a." && !shipment_ids.includes(this.data()["ShipmentId"]) ){
                failed_shipments += 1;
                shipment_ids.push(this.data()["ShipmentId"])
            }
        });
        progress = (failed_shipments / api.rows().count()) * 100
        if(failed_shipments > 0){
            // $("#shipment_creation_progress_bar").attr('class', 'bg-success');
            $("#shipment_creation_progress_bar").attr('aria-valuenow', progress);

            $("#shipment_progress_status_description").append(`<span class="d-flex align-items-center text-secondary">
                                ${gettext("Some shipments were not created")} (${failed_shipments}) 
                                <i  class="ml-1 fas fa-exclamation-triangle text-danger"></i>
                            </span>`)
        }
}