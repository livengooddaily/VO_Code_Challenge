function bind_on_table_drawn_events() {

  $('#dt_fba_send_ins_log').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="tooltip"]').tooltip("hide");
  });

}


function open_and_init_csv_upload_modal(warehouse_id){
  $('#fba_send_in_from_csv_modal').modal('show');
  $('#csv_upload_warehouse_id').val(warehouse_id);
}

  $("#fba_send_in_from_csv_form").submit(function (e) {
    e.preventDefault();
    ajax_upload_fba_send_in_from_csv.call(this)
  });


function ajax_upload_fba_send_in_from_csv(){
  $('#btn_import_fba_send_in_from_csv_file').prop('disabled', true);
  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_fba_send_in_from_csv_url,
    cache: false,
    processData: false,
    contentType: false,
    data: data,
    success: function(data)
    {
      console.log(data)

      $('#btn_import_fba_send_in_from_csv_file').prop('disabled', false);
      $('#btn_import_fba_send_in_from_csv_file > span#spinner_import_fba_send_in_from_csv_file').html("")
      window.location = data.redirect_url
    },
    error: function (request, status, error) {
        alert(request.responseJSON["error"]);
        $('#btn_import_fba_send_in_from_csv_file').prop('disabled', false);
        $('#btn_import_fba_send_in_from_csv_file > span#spinner_import_fba_send_in_from_csv_file').html("")
    }
  });
}



function re_initialize_dt_amz_shipments_summary_log_and_open_modal(fba_send_in_id) {
    if (!$.fn.DataTable.isDataTable('#dt_amz_shipments_summary_log')) {
    initialize_dt_amz_shipments_summary_log(fba_send_in_id)
  } else {
    var table = $("#dt_amz_shipments_summary_log");
    table.DataTable().destroy()
    initialize_dt_amz_shipments_summary_log(fba_send_in_id)
  }
    $('#dt_amz_shipments_summary_log_modal').modal('show')

}

var collapsedGroups = {};
var top = '';

function initialize_dt_amz_shipments_summary_log(fba_send_in_id) {
  collapsedGroups = {};
  top = '';
  var dt_amz_shipments_summary_log_config_instance = Object.assign({}, get_dt_amz_shipments_summary_log_config());
  dt_amz_shipments_summary_log_config_instance["ajax"].data["fba_send_in_id"] = fba_send_in_id;

  $('#dt_amz_shipments_summary_log').DataTable(dt_amz_shipments_summary_log_config_instance);
}

function toggle_fba_send_in_overview() {
  $('#dt_fba_send_ins_log_wrapper').toggle();
  $('#btn_show_detailed_view').toggleClass("hide");
  $('#dt_amz_shipments_complete_log_wrapper').toggle();
  $('#btn_show_overview').toggleClass("hide");
}

function get_dt_config_for_dt_amz_shipments_complete_log() {
  var dt_amz_shipments_complete_log_config_instance = Object.assign({}, get_dt_amz_shipments_summary_log_config());
   dt_amz_shipments_complete_log_config_instance["rowGroup"] = {
      dataSrc: ["fba_send_in_id", "ShipmentName"],
      startRender: function (rows, group, level) {
        var all;

        if (level === 0) {
          top = group;
          all = group;
        } else {
          if (!!collapsedGroups[top]) {
            return;
          }
          all = top + group;
        }

        var collapsed = !!collapsedGroups[all];

        rows.nodes().each(function (r) {
          r.style.display = collapsed ? 'none' : '';
        });

        if (level === 0) {
          rowg = $(`<tr class="" style="cursor: pointer" onclick="window.location='${fba_send_ins_url + rows.data()[0]["fba_send_in_id"]}'"></tr>` );
          td = $('<td class="" colspan="100%" style="border-top: 40px solid white; border-bottom: 10px solid white;"></td>');
          $(td).append(`<div class="d-flex align-items-center" ><i class="fa fa-dolly fa-2x mr-3"></i>${rows.data()[0]["fba_send_in_name"]}</div>`);

          $(rowg).append(td);

          return rowg
        }
        else{
          return $('<tr class="rowg"></tr>')
            .append(`<td class="py-1" colspan="100%" style="padding-left: 0.7em !important;">
                        <div class="d-flex align-items-center font-weight-bold">
                            <span>${rows.data()[0]["ShipmentName"]} - </span>
                            <span class="ml-1"><a target="_blank" href="https://sellercentral-europe.amazon.com/gp/fba/inbound-shipment-workflow/index.html#${rows.data()[0]["ShipmentId"]}/summary/shipmentEvent">${rows.data()[0]["ShipmentId"]}</a></span>
                            <span class="badge badge-${ShipmentStatus_to_color_mapper(rows.data()[0]["ShipmentStatus"])} ml-auto p-2 d-flex justify-content-around align-items-center" style="width:9em">
                                <div class="text-center">${rows.data()[0]["ShipmentStatus"]}</div>
                            </span>
                        </div>
                      </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        }
      },
   };

  dt_amz_shipments_complete_log_config_instance["orderFixed"] = [1, 'desc'];
  return dt_amz_shipments_complete_log_config_instance
}


function get_dt_amz_shipments_summary_log_columns() {
var columns = [
    {"data": "shipm_issue_category", "name": "shipm_issue_category", className: "shipm_issue_category noVis"},
      {"data": "fba_send_in_id", "name": "fba_send_in_id", className: "fba_send_in_id noVis"},
      {"data": "age", "name": "age", className: "age noVis"},
      {"data": "ShipmentName", "name": "ShipmentName", className: "ShipmentName noVis"},
      {"data": "ShipmentStatus", "name": "ShipmentStatus", className: "ShipmentStatus noVis"},
      {"data": "ShipmentId", "name": "ShipmentId", className: "ShipmentId noVis"},
]
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
      {"data": "QuantityShipped", "name": "QuantityShipped", className: "QuantityShipped dt-center"},
      {"data": "QuantityReceived", "name": "QuantityReceived", className: "QuantityReceived dt-center"},
      {"data": "QuantityReceived", "name": "QuantityDifference", className: "QuantityDifference dt-center"},
  ]);

  return columns
}


function initialize_dt_amz_shipments_complete_log() {
  $('#dt_amz_shipments_complete_log').attr("style", "");
  toggle_fba_send_in_overview();
  $('#btn_show_detailed_view').attr("onclick", "toggle_fba_send_in_overview.call(this)");
  $('#dt_amz_shipments_complete_log').DataTable(get_dt_config_for_dt_amz_shipments_complete_log());
}

function get_dt_amz_shipments_summary_log_config() {
  var columns = get_dt_amz_shipments_summary_log_columns();

  var dt_amz_shipments_summary_log_config = {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_dt_amz_shipments_summary_log",
        "fba_send_in_id": null,
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },
    },

    rowGroup: {
      dataSrc: ["shipm_issue_category", "ShipmentName"],
      startRender: function (rows, group, level) {
        var all;

        if (level === 0) {
          top = group;
          all = group;
        } else {
          // if parent collapsed, nothing to do
          if (!!collapsedGroups[top]) {
            return;
          }
          all = top + group;
        }

        var collapsed = !!collapsedGroups[all];

        rows.nodes().each(function (r) {
          r.style.display = collapsed ? 'none' : '';
        });

        if (level === 0) {
          rowg = $('<tr class=""></tr>')
          td = $('<td class="text-white" colspan="100%" style="border-top: 40px solid white; border-bottom: 10px solid white;"></td>')
          if (rows.data()[0]["shipm_issue_category"] === "0_missing items") {
            $(td).addClass("bg-danger")
            $(td).append(`<i class="fas fa-search"></i> ${gettext("Shipments with missing items")}`)
          } else if (rows.data()[0]["shipm_issue_category"] === "1_too many") {
            $(td).addClass("bg-primary")
            $(td).append(`<i class="fas fa-question"></i> ${gettext("Shipments with unexpected items")}`)
          } else if (rows.data()[0]["shipm_issue_category"] === "2_in progress") {
            $(td).addClass("bg-secondary")
            $(td).append(`<i class="fas fa-shipping-fast"></i> ${gettext("Shipments in progress")}`)
          } else if (rows.data()[0]["shipm_issue_category"] === "3_completed successfully") {
            $(td).addClass("bg-success")
            $(td).append(`<i class="fas fa-check"></i> ${gettext("Shipments completed without issues")}`)
          }

          $(rowg).append(td)

          return rowg
        } else {
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

          if (!["DELETED", "CANCELLED"].includes(rows.data()[0]["ShipmentStatus"]) && !isNaN(amz_inbound_shipment_id)){
            cancel_shipm_btn.addClass("cancel_shipm_btn")
            shipm_status_badge.addClass("shipment_status_badge")
          }


          return $('<tr class="rowg shipment_details_row_group"></tr>')
            .append(`<td class="py-1" colspan="100%" style="padding-left: 0.7em !important;">
                              <div class="d-flex align-items-center font-weight-bold">
                                  <span>${rows.data()[0]["ShipmentName"]} - </span>
                                  <span class="ml-1"><a target="_blank" href="https://sellercentral-europe.amazon.com/gp/fba/inbound-shipment-workflow/index.html#${rows.data()[0]["ShipmentId"]}/summary/shipmentEvent">${rows.data()[0]["ShipmentId"]}</a></span>
                                  <span class="ml-auto d-flex justify-content-around align-items-center" data-amz_inbound_shipment_id=${rows.data()[0]["amz_inbound_shipment_id"]}>
                                    ${cancel_shipm_btn.prop("outerHTML")}
                                    ${shipm_status_badge.prop("outerHTML")}
                                </span>
                              </div>
                            </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        }


      },
    },
    orderFixed: [0, 'asc'],

    "columnDefs": [
      {
        "targets": [
          "shipm_issue_category",
          "ShipmentName",
          "ShipmentStatus",
          "ShipmentId",
          "cat_product_type",
          "cat_color",
          "cat_size",
          "cat_shape",
          "variation_name",
          "fba_send_in_id",
          "age",
        ],
        "visible": false,
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
        "targets": "QuantityShipped",
        "data": "QuantityShipped",
        "render": function (data, type, row) {
          if (type === 'display') {
            return data
          } else {
            return parseFloat(data)
          }
        },
      },

      {
        "targets": "QuantityReceived",
        "data": "QuantityReceived",
        "render": function (data, type, row) {
          if (type === 'display') {
            return data
          } else {
            return parseFloat(data)
          }
        },
      },

      {
        "targets": "QuantityDifference",
        "data": "QuantityReceived",
        "autoWidth": false,
        "createdCell": function (td, cellData, rowData, row, col) {
          if (rowData["QuantityReceived"] !== "n/a") {
            if (rowData["QuantityReceived"] - rowData["QuantityShipped"] < 0) {
              $(td).addClass('table-danger')
            } else if (rowData["QuantityReceived"] - rowData["QuantityShipped"] > 0) {
              $(td).addClass('table-success')
            }
          } else {
            // $(td).addClass('table-warning')
          }
        },
        "render": function (data, type, row) {
          QuantityDifference = parseFloat(row["QuantityReceived"] - row["QuantityShipped"])
          if (type === 'display') {
            if (QuantityDifference === 0) {
              return '<i class="fas fa-check text-success"></i>'
            } else if (Number.isNaN(QuantityDifference)) {
              return '<i class="fas fa-question text-warning"></i>'
            } else {
              return QuantityDifference
            }
          } else {
            return QuantityDifference
          }
        },
      },


    ],

    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
      },
    ],
    drawCallback: function () {
    },
  };
  dt_amz_shipments_summary_log_config["columns"] = columns;
  $.extend(dt_amz_shipments_summary_log_config, def_dt_settings);
  return dt_amz_shipments_summary_log_config
}




function re_initialize_dt_fba_send_ins_log_for_archived(){
    if ( $("#btn_show_detailed_view").css('display') == 'none' || $("#btn_show_detailed_view").css("visibility") == "hidden"){
      toggle_fba_send_in_overview()
    };

    $(this).html(`<i class='fas fa-dolly mr-1'></i> ${gettext("Show Non-Archived FBA Send-Ins")}`);
    $(this).attr("onclick","re_initialize_dt_fba_send_ins_log_for_non_archived.call(this)");
    var table = $("#dt_fba_send_ins_log");
    table.DataTable().destroy();
    dt_fba_send_ins_log_config["ajax"].data = function ( d ) {
        var data = {}
        data.json = JSON.stringify(d);

        data.action = "get_fba_send_ins_log";
        data.archived = "true";
        data.csrfmiddlewaretoken = csrfmiddlewaretoken;
        return data;
      }

  $('#dt_fba_send_ins_log').DataTable(dt_fba_send_ins_log_config);
}

function re_initialize_dt_fba_send_ins_log_for_non_archived(){
    $(this).html(`<i class='fas fa-archive mr-1'></i> ${gettext("Show Archived FBA Send-Ins")}`);
    $(this).attr("onclick","re_initialize_dt_fba_send_ins_log_for_archived.call(this)");
    var table = $("#dt_fba_send_ins_log");
    table.DataTable().destroy()
    dt_fba_send_ins_log_config["ajax"].data = function ( d ) {
        var data = {}
        data.json = JSON.stringify(d);

        data.action = "get_fba_send_ins_log";
        data.archived = "false";
        data.csrfmiddlewaretoken = csrfmiddlewaretoken;
        return data;
      }

  $('#dt_fba_send_ins_log').DataTable(dt_fba_send_ins_log_config);
}


dt_fba_send_ins_log_config = {

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
        var data = {}
        data.json = JSON.stringify(d);

        data.action = "get_fba_send_ins_log";
        data.archived = "false";
        data.csrfmiddlewaretoken = csrfmiddlewaretoken;
        return data;
      }
    },

    // Search Button
    initComplete : function() {
        dt_id = '#dt_fba_send_ins_log';
        add_search_for_server_side_table.call(this, dt_id)
    },

    "columns": [
      {"data": "fba_send_in_id", "name": "fba_send_in_id", className: "fba_send_in_id noVis"},
      {"data": "date_added", "name": "date_added", className: "date_added "},
      {"data": "api_combined_status", "name": "api_combined_status", className: "api_combined_status "},
      {"data": "fba_send_in_name", "name": "fba_send_in_name", className: "fba_send_in_name "},
      {"data": "preview_images", "name": "preview_images", className: "preview_images"},
      {"data": "list_of_ShipmentIds", "name": "list_of_ShipmentIds", className: "list_of_ShipmentIds"},
      {"data": "list_of_ShipmentIds", "name": "list_of_ShipmentIds_for_search", className: "list_of_ShipmentIds_for_search noVis"},
      {"data": "pcs_shipped", "name": "pcs_shipped", className: "pcs_shipped"},
      {"data": "TransportFeeAmount_per_Carton", "name": "TransportFeeAmount_per_Carton", className: "TransportFeeAmount_per_Carton"},
      {"data": "pcs_received", "name": "pcs_received", className: "pcs_received"},
      {"data": "prc_received", "name": "prc_received", className: "prc_received"},
      {"data": "age", "name": "age", className: "age"},
      {"data": "warehouse_name", "name": "warehouse_name", className: "warehouse_name "},
      {"name": "actions", className: "actions noVis"},
    ],
    fixedHeader: {
      headerOffset: $('#navbar-container').outerHeight()
    },

    order: [0, 'desc'],
    dom: "<'row mt-1'<'col-sm-12 col-md-9 mb-2 'B><'col-sm-12 col-md-3'f>>" +
      "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>" +
      "<'row'<'col-sm-12 col-md-12'l>>",

    "columnDefs": [
      {
        "targets": [
          "fba_send_in_id",
          "warehouse_name",
          "date_added",
          "list_of_ShipmentIds",
          "list_of_ShipmentIds_for_search",
          "pcs_shipped",
          "pcs_received",
          "TransportFeeAmount_per_Carton",
        ],
        "visible": false,
      },

      {
        "targets": "api_combined_status",
        "data": "api_combined_status",
        "width": "3.2rem",
        "orderable": false,
        "searchable":false,
        "createdCell": function (td, cellData, rowData, row, col) {
        },
        "render": function (data, type, row) {
          return api_combined_status_html(row)
        },
      },

      {
        "targets":"list_of_ShipmentIds_for_search",
        "searchable":false,
        "orderable":false
      },
      {
        "targets": "preview_images",
        "data": "preview_images",
        "width": "1rem",
        "orderable": false,
        "searchable":false,
        "createdCell": function (td, cellData, rowData, row, col) {
        },
        "render": function (data, type, row) {
          var div_c = $(`<div class="d-flex justify-content-start"></div>`);
          row["preview_images"].forEach(function (item) {
            var img = $(`<img
                        class="mr-1"
                        src="${item[0]}"
                        data-toggle="tooltip"
                        title="${item[1]}"
                        width="35px" 
                        height="35px"
                        >`);
            div_c.append(img);
          });

          return div_c.prop("outerHTML")
        },
      },
      {
        "targets": "fba_send_in_name",
        "data": "fba_send_in_name",
        "width": "20%",

        "render": function (data, type, row) {
          if (type === "display") {
            var div_c = $(`<div></div>`);
            var span_c = $(`<span>${data}</span>`);
            span_c.attr("onclick", `window.location = "${fba_send_ins_url}${row["fba_send_in_id"]}"`)
            span_c.attr("style", "cursor: pointer")
            div_c.append(span_c);

            if (row["fba_send_in_notes"] !== "") {
              var notes_c = $('<span></span>')
              notes_c.attr("title", row["fba_send_in_notes"].replaceAll("\n", "<br>"));
              notes_c.attr("onclick", `window.location='${edit_fba_send_in_url + row["fba_send_in_id"]}'`);
              notes_c.attr("style", `cursor: pointer;`);
              notes_c.attr("data-toggle", `tooltip`);
              notes_c.attr("data-html", `true`);
              notes_c.append($('<i class="ml-2 fa fa-file-alt text-secondary"></i>'));
              div_c.append(notes_c);
            }

            if (row["target_marketplace"].includes("transfer_to_wh_")) {
              var non_fba_send_in_icons = $('<span></span>')
              non_fba_send_in_icons.append($(`
                                    <i class="fa fa-warehouse text-secondary"></i>
                                    <i class="fa fa-angle-double-right text-secondary"></i>
                                    <i class="mr-2 fa fa-warehouse text-secondary"></i>
                                    `));
              non_fba_send_in_icons.attr("data-toggle", `tooltip`);
              non_fba_send_in_icons.attr("title", gettext("Warehouse Transfer"));
              div_c.prepend(non_fba_send_in_icons);
            }

            if (row["target_marketplace"].includes("loose_stock")) {
              var non_fba_send_in_icons = $('<span></span>')
              non_fba_send_in_icons.append($(`
                                    <i class="fa fa-box text-secondary"></i>
                                    <i class="fa fa-angle-double-right text-secondary"></i>
                                    <i class="mr-2 fa fa-box-open text-secondary"></i>
                                    `));
              non_fba_send_in_icons.attr("data-toggle", `tooltip`);
              non_fba_send_in_icons.attr("title", gettext("Carton to Loose Stock Conversion"));
              div_c.prepend(non_fba_send_in_icons);
            }


            return div_c.prop("outerHTML")
          } else {
            return data
          }
        },
      },
      {
        "targets": "list_of_ShipmentIds",
        "data": "list_of_ShipmentIds",
        "searchable":false,
        "orderable":false,
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).attr("title", cellData.join(", "))
          $(td).addClass("text-secondary")
        },
        "render": function (data, type, row) {
          var list_of_ShipmentIds = data.slice(0, 3).map(i => {
              return `<a target="_blank" href=https://sellercentral-europe.amazon.com/gp/fba/inbound-shipment-workflow/index.html#${i}/summary/shipmentEvent>${i}</a>`
          })
          list_of_ShipmentIds = list_of_ShipmentIds.join(", ")
          if (data.length > 3){
            list_of_ShipmentIds = list_of_ShipmentIds + " ..."
          }
          return list_of_ShipmentIds
        },
      },

      {
        "targets": "TransportFeeAmount_per_Carton",
        "data": "TransportFeeAmount_per_Carton",
        "searchable":false,
        "orderable":false,
        "render": function (data, type, row) {
          if (type === "display") {
            if (row["TransportFeeCurrency"] !== "n/a") {

              if (row["max_fee_per_carton"] > 3.33) {
                high_cost_warning = `<i class="fa fa-exclamation-triangle text-danger"></i>`;
                high_cost = gettext("Some shipments have above average")
              } else {
                high_cost_warning = "";
                high_cost = "";
              }

              return  `<span class="px-1" 
                            data-toggle="tooltip" data-html="true"
                            title="${high_cost} ${gettext("Amazon Transport Fees for Inbound Shipment.")}<br>
                                    ${gettext("Total: ")}${row["TransportFeeAmount"]} ${row["TransportFeeCurrency"]} | 
                                    ${gettext("Per Carton: ")}${row["TransportFeeAmount_per_Carton"]} ${row["TransportFeeCurrency"]}">
                            ${row["TransportFeeAmount_per_Carton"]} ${row["TransportFeeCurrency"]} / ${gettext("Ctn.")}
                            ${high_cost_warning}
                         </span>`
            } else {
              return ""
            }
          } else {
            return data
          }
        },
      },
      {
        "targets": "pcs_shipped",
        "data": "pcs_shipped",
        "searchable":false,
        "orderable":false,
        "render": function (data, type, row) {
          if (type === "display") {
            return `
                    <span title="Quantitiy of pcs shipped" data-toggle="tooltip">${row["pcs_shipped"]}</span>
                    `
          } else {
            return data
          }
        },
      },
      {
        "targets": "pcs_received",
        "data": "pcs_received",
        "searchable":false,
        "orderable":false,
        "render": function (data, type, row) {
          if (type === "display") {
            return `
                    <span title="Quantitiy of pcs received" data-toggle="tooltip">${row["pcs_received"]}</span>
                    `
          } else {
            return data
          }
        },
      },
      {
        "targets": "prc_received",
        "data": "prc_received",
        "searchable": false,
        "orderable":false,
        "width" : "35%",
        "createdCell": function (td, cellData, rowData, row, col) {
        },
        "render": function (data, type, row) {
          if (type === "display") {
            return get_prc_received_progress_bar_html(row)
          } else {
            return data
          }
        },
      },
      {
        "targets": "warehouse_name",
        "searchable": false
      },
      {
        "targets": "age",
        "data": "age",
        "searchable":false,
        "createdCell": function (td, cellData, rowData, row, col) {
        },
        "render": function (data, type, row) {
          if (type === "display") {
            return `${data} d`
          } else {
            return data
          }
        },
      },


            {
        "targets": "actions",
        "data": "obj_id",
        "orderable": false,
        "searchable":false,
        "render": function (data, type, row) {
          var div_c = $(`<div class="d-flex align-items-center pl-2" style="cursor: pointer">
                    <div data-toggle="tooltip" title="Edit" onclick="window.location='${edit_fba_send_in_url + row["fba_send_in_id"]}'"><i class="mr-1 fas fa-edit text-secondary mr-1" ></i></div>
                  </div>
                `)

          var archive_btn_div = $(`<div data-toggle="tooltip" onclick="toggle_archive_fba_send_in(${row["fba_send_in_id"]}) "></div>`)
          var archive_btn_icon = $('<i class="ml-1 fa text-secondary"></i>')

          if (row["archived"]){
            archive_btn_icon.addClass("fa-undo")
            archive_btn_div.attr("title", gettext("De-Archive"))
          } else {
            archive_btn_icon.addClass("fa-archive")
            archive_btn_div.attr("title", gettext("Put to Archive"))
          }
          archive_btn_div.append(archive_btn_icon)
          div_c.append(archive_btn_div)


          return div_c.prop("outerHTML")
        },
      },
    ],

    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
      },
    ],

    "createdRow": function (row, data, index) {
      $(row).attr("id", data["fba_send_in_id"] + "-row")
    },

    "language": default_language,
    "stateSave": true,
    "stateDuration": 0,
    "bPaginate": true,
    "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
    "searching": true,
    "info": false,
    "bFilter": true,
    "bInfo": true,
    drawCallback: function () {
    },

  };

function get_prc_received_progress_bar_html(row) {
  var prc_potentially_receiving_label = "";
  if (row["prc_potentially_receiving"] !== 0) {
    prc_potentially_receiving_label = row["prc_potentially_receiving"]
  }

  var prc_missing_although_closed_label = "";
  if (row["prc_missing_although_closed"] !== 0) {
    prc_missing_although_closed_label = row["prc_missing_although_closed"]
  }

  var prc_too_many_label = "";
  if (row["prc_too_many"] !== 0) {
    prc_too_many_label = row["prc_too_many"]
  }

  return `<div class="progress" 
               onclick="re_initialize_dt_amz_shipments_summary_log_and_open_modal(${row['fba_send_in_id']})" 
               style="cursor: pointer;" >

            <div class="progress-bar bg-success" role="progressbar"
              data-toggle="tooltip"
              title="${row["prc_received"]}${gettext("% of pcs have been received (click for details)")}" 
              style="width: ${row["prc_received"]}%;" 
              aria-valuenow="${row["prc_received"]}" aria-valuemin="0" aria-valuemax="100" >
                ${row["prc_received"]}%
            </div>
            
            <div class="progress-bar bg-secondary" role="progressbar"
              data-toggle="tooltip"
              title="${row["prc_potentially_receiving"]}${gettext("% of pcs are being received")}" 
              style="width: ${row["prc_potentially_receiving"]}%;" 
              aria-valuenow="${row["prc_potentially_receiving"]}" aria-valuemin="0" aria-valuemax="100" >
                ${prc_potentially_receiving_label}%
            </div>
            
            <div class="progress-bar bg-danger" role="progressbar"
              data-toggle="tooltip"
              title="${row["prc_missing_although_closed"]}${gettext("% of pcs were not received although shipment has been closed (click for details)")}" 
              style="width: ${row["prc_missing_although_closed"]}%;" 
              aria-valuenow="${row["prc_missing_although_closed"]}" aria-valuemin="0" aria-valuemax="100" >
                ${prc_missing_although_closed_label}%
            </div>
            
            
            <div class="progress-bar bg-primary" role="progressbar"
              data-toggle="tooltip"
              title="${row["prc_too_many"]}${gettext("% of pcs were received although not shipped (too many pcs were received) (click for details)")}" 
              style="width: ${row["prc_too_many"]}%;" 
              aria-valuenow="${row["prc_too_many"]}" aria-valuemin="0" aria-valuemax="100" >
                ${prc_too_many_label}%
            </div>
          
        </div>`
}

function initialize_dt_fba_send_ins_log() {

  $('#dt_fba_send_ins_log').DataTable(dt_fba_send_ins_log_config);
}

function api_combined_status_html(row) {
  var div_c = $(`<div class="d-flex justify-content-start"></div>`);
  var badge_fbasi = construct_badge_fbasi(row);
  var badge_api_sync = construct_badge_api_sync(row);
  var badge_amz_receiving = construct_badge_amz_receiving(row);


  if (row["target_marketplace"].includes("transfer_to_wh_") ||
  row["target_marketplace"].includes("loose_stock")){
    $(badge_api_sync).attr("hidden", true)
    $(badge_amz_receiving).attr("hidden", true)
  } else {
  }
  $(div_c).append(badge_fbasi)
  $(div_c).append(badge_api_sync)
  $(div_c).append(badge_amz_receiving)
  return div_c.prop('outerHTML');


}

function construct_badge_fbasi(row) {
  var fba_send_in_status = row["fba_send_in_status"]
  var display_type = row["display_type"]

  var badge_fbasi = $(`<div class="badge py-2  mr-1" style="width: 1.5rem" data-toggle="tooltip"><i class="fa fa-dolly"></i></div>`);
  if (fba_send_in_status === "Planned") {
    $(badge_fbasi).addClass("badge-light")
    $(badge_fbasi).attr("title", gettext("FBA Send-In: Planned"))
  } else {
    if(display_type === "standard") {
      $(badge_fbasi).addClass("badge-success")
      $(badge_fbasi).attr("title", gettext("FBA Send-In: Committed"))
    }else if(display_type === "working"){
      $(badge_fbasi).addClass("badge-warning")
      $(badge_fbasi).attr("title", gettext("Commit in Progress"))
    } else{
      $(badge_fbasi).addClass("badge-danger")
      $(badge_fbasi).attr("title", gettext("Commit Failed"))
    }
  }
  return badge_fbasi
}

function construct_badge_api_sync(row) {
  var api_combined_status = row["api_combined_status"]

  var badge_api_sync = $(`<div class="badge py-2 mr-1" style="width: 1.5rem" data-toggle="tooltip"><i class="fa fa-sync"></i></div>`);

  if (api_combined_status === "not started" || api_combined_status === "" || api_combined_status === null
      || api_combined_status === "Planned") {
    $(badge_api_sync).addClass("badge-light")
    $(badge_api_sync).attr("title", gettext("Amazon Sync: Not started"))
  } else if (api_combined_status === "running") {
    $(badge_api_sync).addClass("badge-warning")
    $(badge_api_sync).attr("title", gettext("Amazon Sync: running"))
  } else if (api_combined_status === "completed") {
    $(badge_api_sync).addClass("badge-success")
    $(badge_api_sync).attr("title", gettext("Amazon Sync: completed"))
  } else if (api_combined_status === "failed") {
    $(badge_api_sync).addClass("badge-danger")
    $(badge_api_sync).attr("title", gettext("Amazon Sync: failed"))
  }
  return badge_api_sync
}

function construct_badge_amz_receiving(row) {
  var badge_amz_receiving = $(`<div class="badge py-2" style="width: 1.5rem" data-toggle="tooltip">
                                    <i class="fab fa-amazon" 
                                    onclick="re_initialize_dt_amz_shipments_summary_log_and_open_modal(${row["fba_send_in_id"]})" 
                                    style="cursor: pointer"></i>
                                </div>`);
  if (row["prc_received"] + row["prc_missing_although_closed"] === 0) {
    $(badge_amz_receiving).addClass("badge-light")
    $(badge_amz_receiving).attr("title", gettext("Amazon receiving goods: not started"))
  } else if (row["prc_received"] >= 100) {
    $(badge_amz_receiving).addClass("badge-success")
    $(badge_amz_receiving).attr("title", gettext("Amazon receiving goods: successfully completed"))
  } else if (row["prc_missing_although_closed"] > 0) {
    $(badge_amz_receiving).addClass("badge-warning")
    $(badge_amz_receiving).attr("title", gettext("Amazon receiving goods: some products are missing"))
  } else if (row["prc_potentially_receiving"] >= 0) {
    $(badge_amz_receiving).addClass("table-success")
    $(badge_amz_receiving).attr("title", gettext("Amazon receiving goods: in progress"))
  }
  return badge_amz_receiving
}

function toggle_archive_fba_send_in(fba_send_in_id) {
  $("#"+fba_send_in_id+"-row").remove()
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "fba_send_in_id" : fba_send_in_id,
      "action": "toggle_archive_fba_send_in",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $(".tooltip").tooltip('hide')
    },
    error:function(){
      alert(gettext("Error. FBA Send-In could not be archived."))
    },
  })
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
      $("#dt_amz_shipments_summary_log").DataTable().ajax.reload();
      alert(gettext("Shipment has been successfully cancelled."))
    },
    error:function(){
      alert(gettext("Error. Something went wrong."))
    }
  })
}
