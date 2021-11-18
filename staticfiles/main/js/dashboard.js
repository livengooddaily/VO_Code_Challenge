let fba_stock;
let current_wh_stock;

$(document).ready(function () {
  register_datatable_sums_functionality();
  initialize_dt_re_order_monitoring_dashboard();
  initialize_dt_active_purchase_orders_dashboard();
  initialize_dt_fba_send_ins_log_dashboard();
  initialize_active_sku_based_charts();
  initialize_new_sku_based_charts();
  initialize_pcli_based_charts();
  bind_action_header_events();
  bind_on_table_drawn_events();

  fill_sum_total_stock()

  $('#header_cache_button_container').on('click', function (e) {
    refresh_page_cache(page_name="dashboard")
  });
  check_refresh_page_cache_status(page_name="dashboard")

  wh_stock_percentage_popover()

  adjust_chart_height()
});


function bind_on_table_drawn_events() {
  $('#dt_active_purchase_orders_dashboard').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
    $(".tooltip").tooltip('hide');
  });

  $('#dt_fba_send_ins_log').on('draw.dt', function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="tooltip"]').tooltip("hide");
  });
}

function initialize_active_sku_based_charts() {
  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "chart_id": "current_fba_stock_chart",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      fba_stock = data["chart_data"]["fba_stock_dict"];
      fill_current_fba_stock_card_with_KPIs(data["chart_data"]["fba_stock_dict"])
      initialize_reach_dist_chart(data["chart_data"]["reach_dist_chart_data"])
      fill_action_header_with_fba_KPIs(data["chart_data"]["no_of_skus_for_send_in"])
    }
  })
}

function initialize_new_sku_based_charts() {
  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "chart_id": "no_of_new_skus",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      fill_action_header_with_no_of_new_skus(data["chart_data"]["no_of_new_skus"])
    }
  })
}

function initialize_pcli_based_charts() {
  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "chart_id": "current_wh_stock_chart",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      current_wh_stock = data["chart_data"];
      fill_current_wh_stock_table_with_KPIs(data["chart_data"])
      // current_wh_stock_chart(data["chart_data"])
    }
  })
}

function fill_current_fba_stock_card_with_KPIs(fba_stock_dict) {

  $('#fba_in_stock_total_pcs').html(fba_stock_dict["sum_fba_stock"]["pcs"]);
  $('#fba_in_stock_total_volume').html(fba_stock_dict["sum_fba_stock"]["cbm"]);
  $('#fba_in_stock_total_stock_value').html(fba_stock_dict["sum_fba_stock"]["stock_value"]+ " " + main_currency_sign);
  ;
  $('#fba_inbound_total_pcs').html(fba_stock_dict["sum_fba_inbound"]["pcs"]);
  $('#fba_inbound_total_volume').html(fba_stock_dict["sum_fba_inbound"]["cbm"]);
  $('#fba_inbound_total_stock_value').html(fba_stock_dict["sum_fba_inbound"]["stock_value"]+ " " + main_currency_sign);
  ;
  $('#fba_total_pcs').html(fba_stock_dict["sum_fba"]["pcs"]);
  $('#fba_total_volume').html(fba_stock_dict["sum_fba"]["cbm"]);
  $('#fba_total_stock_value').html(fba_stock_dict["sum_fba"]["stock_value"]+ " " + main_currency_sign);

  $('#fba_stock_fulfillable_pcs').html(        fba_stock_dict["fba_stock_fulfillable"]["pcs"]);
  $('#fba_stock_fulfillable_volume').html(     fba_stock_dict["fba_stock_fulfillable"]["cbm"]);
  $('#fba_stock_fulfillable_stock_value').html(fba_stock_dict["fba_stock_fulfillable"]["stock_value"]+ " " + main_currency_sign);
  $('#fba_stock_unsellable_pcs').html(         fba_stock_dict["fba_stock_unsellable"]["pcs"]);
  $('#fba_stock_unsellable_volume').html(      fba_stock_dict["fba_stock_unsellable"]["cbm"]);
  $('#fba_stock_unsellable_stock_value').html( fba_stock_dict["fba_stock_unsellable"]["stock_value"]+ " " + main_currency_sign);
  $('#fba_stock_reserved_pcs').html(           fba_stock_dict["fba_stock_reserved"]["pcs"]);
  $('#fba_stock_reserved_volume').html(        fba_stock_dict["fba_stock_reserved"]["cbm"]);
  $('#fba_stock_reserved_stock_value').html(   fba_stock_dict["fba_stock_reserved"]["stock_value"] + " " + main_currency_sign);

  $('#fba_stock_inbound_working_pcs').html(        fba_stock_dict["fba_stock_inbound_working"]["pcs"]);
  $('#fba_stock_inbound_working_volume').html(     fba_stock_dict["fba_stock_inbound_working"]["cbm"]);
  $('#fba_stock_inbound_working_stock_value').html(fba_stock_dict["fba_stock_inbound_working"]["stock_value"] + " " + main_currency_sign);
  $('#fba_stock_inbound_shipped_pcs').html(         fba_stock_dict["fba_stock_inbound_shipped"]["pcs"]);
  $('#fba_stock_inbound_shipped_volume').html(      fba_stock_dict["fba_stock_inbound_shipped"]["cbm"]);
  $('#fba_stock_inbound_shipped_stock_value').html( fba_stock_dict["fba_stock_inbound_shipped"]["stock_value"]+ " " + main_currency_sign);
  $('#fba_stock_inbound_receiving_pcs').html(           fba_stock_dict["fba_stock_inbound_receiving"]["pcs"]);
  $('#fba_stock_inbound_receiving_volume').html(        fba_stock_dict["fba_stock_inbound_receiving"]["cbm"]);
  $('#fba_stock_inbound_receiving_stock_value').html(   fba_stock_dict["fba_stock_inbound_receiving"]["stock_value"]+ " " + main_currency_sign);

}

function fill_action_header_with_fba_KPIs(no_of_skus_for_send_in) {
  $('#no_of_SKUs_sug_for_send_in').html(`${no_of_skus_for_send_in} SKUs`)
}

function fill_action_header_with_no_of_new_skus(no_of_new_skus) {
  $('#no_of_new_skus').html(no_of_new_skus)
}

function fill_current_wh_stock_card_with_KPIs(chart_data) {
  if (chart_data["in_shipm_total_volume"] !== 0) {
    $('#wh_total_volume').html(`<span>${chart_data["wh_total_volume"]}</span><span class="text-secondary" title="${gettext("Currently in shipment (not received yet)")}"> (+${chart_data["in_shipm_total_volume"]})</span><span> ${gettext("cbm")}</span>`)
  } else {
    $('#wh_total_volume').html(`<span>${chart_data["wh_total_volume"]}</span><span> cbm</span>`)
  }

  if (chart_data["in_shipm_total_qty_cartons"] !== 0) {
    $('#wh_total_qty_cartons').html(`<span>${chart_data["wh_total_qty_cartons"]}</span><span class="text-secondary" title="${gettext("Currently in shipment (not received yet)")}"> (+${chart_data["in_shipm_total_qty_cartons"]})</span><span> ${gettext("ctns")}</span>`)
  } else {
    $('#wh_total_qty_cartons').html(`<span>${chart_data["wh_total_qty_cartons"]}</span><span> cbm</span>`)
  }

  if (chart_data["in_shipm_total_pcs"] !== 0) {
    $('#wh_total_pcs').html(`<span>${chart_data["wh_total_pcs"]}</span><span class="text-secondary" title="${gettext("Currently in shipment (not received yet)")}"> (+${chart_data["in_shipm_total_pcs"]})</span><span> ${gettext("pcs")}</span>`)
  } else {
    $('#wh_total_pcs').html(`<span>${chart_data["wh_total_pcs"]}</span><span> ${gettext("cbm")}</span>`)
  }
}

function fill_current_wh_stock_table_with_KPIs(chart_data) {
  $('#wh_total_volume').html(chart_data["wh_total_volume"])
  $('#wh_total_qty_cartons').html(chart_data["wh_total_qty_cartons"])
  $('#wh_total_pcs').html(chart_data["wh_total_pcs"])
  $('#wh_total_stock_value').html(chart_data["wh_total_stock_value"]+ " " + main_currency_sign)
  wh_total_stock_value = parseInt(chart_data["wh_total_stock_value"].replace(/,/g,""))

  $('#in_shipm_total_volume').html(chart_data["in_shipm_total_volume"])
  $('#in_shipm_total_qty_cartons').html(chart_data["in_shipm_total_qty_cartons"])
  $('#in_shipm_total_pcs').html(chart_data["in_shipm_total_pcs"])

  in_shipm_total_stock_value_considered = (chart_data["shipped_stock_value_prc_considered"] * parseInt(chart_data["in_shipm_total_stock_value"].replace(/,/g,"")) )/100
  chart_data["in_shipm_total_stock_value_considered"] = in_shipm_total_stock_value_considered
  $('#in_shipm_total_stock_value').html( numberWithCommas(parseInt(in_shipm_total_stock_value_considered)) + " " + main_currency_sign)

  $('#in_production_total_volume').html(chart_data["in_production_total_volume"] )
  $('#in_production_total_qty_cartons').html(chart_data["in_production_total_qty_cartons"])
  $('#in_production_total_pcs').html(chart_data["in_production_total_pcs"])

  in_production_total_stock_value_considered = (chart_data["ordered_stock_value_prc_considered"] * parseInt(chart_data["in_production_total_stock_value"].replace(/,/g,"")) )/100
  chart_data["in_production_total_stock_value_considered"] = in_production_total_stock_value_considered
  $('#in_production_total_stock_value').html( numberWithCommas(parseInt(in_production_total_stock_value_considered)) + " " + main_currency_sign)

  $('#total_volume').html(chart_data["total_volume"])
  $('#total_qty_cartons').html(chart_data["total_qty_cartons"])
  $('#total_pcs').html(chart_data["total_pcs"])

  total_stock_value_considered = in_shipm_total_stock_value_considered + in_production_total_stock_value_considered
  chart_data["total_stock_value_considered"] = total_stock_value_considered
  $('#total_stock_value').html( numberWithCommas ( parseInt( total_stock_value_considered)) + " " + main_currency_sign)

  current_wh_stock = chart_data;
  fill_sum_total_stock()
  total_stock_tooltips();
}

function current_wh_stock_chart(chart_data) {
  var ctx = document.getElementById('current_wh_stock_chart').getContext('2d');
  // console.log(chart_data["datasets"])
  var current_wh_stock_chart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: [
        gettext("Volume in WH [CBM]"),
        gettext("Volume in Shipm. [CBM]"),
      ],
      datasets: chart_data["datasets"]
    },
    options: {
      plugins: {
        colorschemes: {
          scheme: 'tableau.Tableau20'
        }
      },
      scales: {
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true
          }
        }],
      }
    }
  });
}

function initialize_reach_dist_chart(chart_data) {
  var ctx = document.getElementById('reach_dist_chart').getContext('2d');
  var current_wh_stock_chart = new Chart(ctx, {
    type: 'bar',
    data: chart_data,
    responsive: true,
    legend: {
      position: "top"
    },
    title: {
      display: true,
      text: gettext("Reach distribution chart")
    },

    options: {
       maintainAspectRatio: false,
      // plugins: {
      //   colorschemes: {
      //     scheme: 'tableau.Tableau20'
      //   }
      // },
      scales: {
        yAxes: [{
          // stacked: true,
          scaleLabel: {
            display: true,
            labelString: gettext('No. of SKUs in category')
          },
          ticks: {
            beginAtZero: true,
            // callback: function (value) {
            // return value.toLocaleString('de-DE', {style:'percent'});
            // },
          }
        }],
      }
    }
  });
}


function initialize_dt_active_purchase_orders_dashboard() {
  $('#dt_active_purchase_orders_dashboard').DataTable({
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "active_purchase_orders_dashboard",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"data": "order_name", "name": "order_name", className: "order_name"},//0
      {"data": "status", "name": "status", className: "status"},//1
      {"data": "ms_diff_in_days", "name": "ms_diff_in_days", className: "ms_diff_in_days"},//2
    ],
    order: [2, "asc"],
    "columnDefs": [
      {
        "targets": "order_name",
        "data": "order_name",
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).attr('data-purchase_order_id', rowData["purchase_order_id"]);
          $(td).attr('class', "purchase_order_link");
          $(td).attr('style', "cursor: pointer;");
        },

      },
      {
        "targets": "status",
        "data": "status",
        // "width": "10px",
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).addClass('p-0');
          $(td).attr('id', `${rowData['purchase_order_id']}-status_badge`);
          add_coloring_to_po_badge_by_status(td, rowData)
        },
        "render": function (data, type, row) {
          if (type === "display") {
            return get_po_status_badge_dropdown_html(row)

          } else {
            return data
          }
        },
      },

      {
        "targets": "ms_diff_in_days",
        "data": "ms_diff_in_days",
        "width": "10px",
        "render": function (data, type, row) {
          if (type === "display") {
            return `<div data-toggle="tooltip" title="${gettext("Days until planned date of next milestone, e.g. planned 'date received' for a 'Shipped' status order.")}">${data} d</div>`

          } else {
            return parseFloat(data)
          }
        },
      },
    ],
    "lengthChange": false,
    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": false,

    "createdRow": function (row, data, dataIndex) {

    },
    "drawCallback": function (settings) {
      $(".purchase_order_link").click(function () {
        var purchase_order_id = $(this).data('purchase_order_id')
        window.location = `${purchase_orders_url}${purchase_order_id}/`
      })
    },

  });
}

function initialize_dt_fba_send_ins_log_dashboard() {
    dt_fba_send_ins_log_config["processing"] = false;
    dt_fba_send_ins_log_config["serverSide"] = false;
    dt_fba_send_ins_log_config["ajax"] = {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_fba_send_ins_log",
        "archived": "false",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    };
  dt_fba_send_ins_log_config["ajax"].data["for_dashboard"] = "true";
  dt_fba_send_ins_log_config["dom"] = '';
  dt_fba_send_ins_log_config["orderFixed"] = null;
  dt_fba_send_ins_log_config["columns"] = [
      {"data": "fba_send_in_name", "name": "fba_send_in_name", className: "fba_send_in_name"},//0
      {"data": "prc_received", "name": "prc_received", className: "prc_received"},//1
      {"data": "age", "name": "age", className: "age"},//2
    ];
  dt_fba_send_ins_log_config["order"] = [2, "asc"];
  dt_fba_send_ins_log_config["searching"] = false;
  dt_fba_send_ins_log_config["buttons"] = [];
  dt_fba_send_ins_log_config["columnDefs"] = [
    {
        "targets": "fba_send_in_name",
        "data": "fba_send_in_name",
        "createdCell": function (td, cellData, rowData, row, col) {
          $(td).attr("onclick", `window.location = "${fba_send_ins_url}${rowData["fba_send_in_id"]}"`)
          $(td).attr("style", "cursor: pointer")
        },
        "render": function (data, type, row) {
          return `${data}`
        },
      },

      {
        "targets": "prc_received",
        "data": "prc_received",
        "width": "35%",
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
        "targets": "age",
        "data": "age",
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
  ];

  $('#dt_fba_send_ins_log').DataTable(dt_fba_send_ins_log_config);
}



function add_coloring_to_po_badge_by_status(td, rowData) {
  if (rowData["display_type"] === "standard") {

    var badge_elem = $(td).find("span.selected_badge")
    badge_elem.removeClass('badge-secondary');
    badge_elem.removeClass('badge-primary');
    badge_elem.removeClass('badge-success');

    if (rowData["status"] === "Planned") {
      badge_elem.addClass('badge-secondary');
    } else if (rowData["status"] === "Ordered") {
      badge_elem.addClass('table-primary');
    } else if (rowData["status"] === "Shipped") {
      badge_elem.addClass('badge-primary');
    } else if (rowData["status"] === "Received") {
      badge_elem.addClass('badge-success');
    }

  }
}


function change_po_status() {
  var po_id = $(this).data('po_id');
  var status = $(this).data('status');

  var rowData = {};
  rowData["status"] = status;
  rowData["display_type"] = "standard";

  var td = $(`#${po_id}-status_badge`);
  add_coloring_to_po_badge_by_status(td, rowData);
  $(td).find("span.selected_badge").html(status);

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "po_id" : po_id,
      "status": status,
      "action": "change_status_purchase_order",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $('#dt_active_purchase_orders_dashboard').DataTable().ajax.reload();
    },
    error:function(){
      alert(gettext("Error. Purchase order status could not be changed."))
    }
  })
}

function clone_purchase_order(po_id) {
  $(this).closest("span").replaceWith(`<div class="spinner-border spinner-border-sm text-primary" style="width: 1.4rem; height: 1.4rem;" role="status">
                                <span class="sr-only">${gettext("Loading...")}</span>
                              </div>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "po_id" : po_id,
      "action": "clone_purchase_order",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $("#dt_purchase_orders_log").DataTable().ajax.reload();
    },
    error:function(){
      alert(gettext("Error. Purchase order could not be cloned."))
    },
  })
}


function initialize_dt_re_order_monitoring_dashboard() {
  $('#dt_re_order_monitoring_dashboard').DataTable({
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_re_order_monitoring_dashboard",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"data": "template_name", "name": "template_name", className: "template_name"},//0
      {"data": "sugg_reorder_pcs", "name": "sugg_reorder_pcs", className: "sugg_reorder_pcs"},//1
      {"data": "sugg_reorder_volume", "name": "sugg_reorder_volume", className: "sugg_reorder_volume"},//2
      {"data": "estimated_revenue_loss_14_days_delay", "name": "estimated_revenue_loss_14_days_delay", className: "estimated_revenue_loss_14_days_delay"},//2
      {"data": "estimated_revenue_loss_0_days_delay", "name": "estimated_revenue_loss_0_days_delay", className: "estimated_revenue_loss_0_days_delay noVis"},//2
      {"data": "estimated_revenue_loss_30_days_delay", "name": "estimated_revenue_loss_30_days_delay", className: "estimated_revenue_loss_30_days_delay noVis"},//2
    ],
    order: [2, "desc"],
    "columnDefs": [
{
      "targets": [
        "estimated_revenue_loss_0_days_delay",
        "estimated_revenue_loss_30_days_delay",
      ],
      "visible": false,
    },
      {
        "targets": "sugg_reorder_pcs",
        "data": "sugg_reorder_pcs",
        "orderable": false,
        "render": function (data, type, row) {
          return format_number(parseInt(data))
        }
      },

      {
        "targets": "estimated_revenue_loss_14_days_delay",
        "data": "estimated_revenue_loss_14_days_delay",
        "orderable": false,
        "render": function (data, type, row) {
          return construct_revenue_loss_container(row);
        },
      },
    ],
    "lengthChange": false,
    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": false,

    "createdRow": function (row, data, dataIndex) {
      $(row).attr('data-obj_id', data["obj_id"]);
      $(row).attr('class', "re_order_template_row");
      $(row).attr('style', "cursor: pointer;");
    },
    "drawCallback": function (settings) {
      $(".re_order_template_row").click(function () {
        var obj_id = $(this).data('obj_id')
        window.location = `${re_order_template_url}${obj_id}/`
      })

      var api = this.api();
      var sum_sugg_reorder_pcs = Math.round(api.column(".sugg_reorder_pcs").data().sum());
      var sum_sugg_reorder_volume = Math.round(api.column(".sugg_reorder_volume").data().sum());
      var sum_estimated_revenue_loss_14_days_delay = Math.round(api.column(".estimated_revenue_loss_14_days_delay").data().sum());
      var sum_estimated_revenue_loss_0_days_delay = Math.round(api.column(".estimated_revenue_loss_0_days_delay").data().sum());
      var sum_estimated_revenue_loss_30_days_delay = Math.round(api.column(".estimated_revenue_loss_30_days_delay").data().sum());

      var sum_row = {
        "estimated_revenue_loss_14_days_delay": sum_estimated_revenue_loss_14_days_delay,
        "estimated_revenue_loss_0_days_delay": sum_estimated_revenue_loss_0_days_delay,
        "estimated_revenue_loss_30_days_delay": sum_estimated_revenue_loss_30_days_delay,
      };

      $(api.table().column(".sugg_reorder_pcs").footer()).html(format_number(sum_sugg_reorder_pcs) + " " + gettext("PCS"));
      $(api.table().column(".sugg_reorder_volume").footer()).html(format_number(sum_sugg_reorder_volume) + " " + gettext("CBM"));
      $(api.table().column(".estimated_revenue_loss_14_days_delay").footer()).html(format_number(construct_revenue_loss_container(sum_row)));
    },

  });
}

function construct_revenue_loss_container(row) {
  var div_c = $(`<div class="row px-1" style="min-width: 16rem;  white-space: nowrap" ></div>`)

  var div_c_0d = $(`<span class="col-4 px-0 text-center border-right-separator" data-toggle="tooltip"
                              title="${gettext("Estimated revenue loss, if re-oder placed now")}">
                        </span>`);
  if (row["estimated_revenue_loss_0_days_delay"] > 0) {
    $(div_c_0d).append(format_number(row["estimated_revenue_loss_0_days_delay"], 0))
    $(div_c_0d).append(" " + main_currency_sign)
    $(div_c_0d).addClass("text-danger")
  } else {
    $(div_c_0d).append("-")
    $(div_c_0d).addClass("text-secondary")
  }

  var div_c_14d = $(`<span class="col-4 px-0 text-center border-right-separator" 
                                data-toggle="tooltip"
                                data-html="true"
                              title="${gettext("Additional revenue loss, if re-oder placed after 14 days")}.<br>
                                        ${gettext("Total")}: ${format_number(parseInt(row["estimated_revenue_loss_14_days_delay"]))} ${main_currency_sign}">
                        </span>`);

  if (row["estimated_revenue_loss_14_days_delay"] - row["estimated_revenue_loss_0_days_delay"] > 0) {
    $(div_c_14d).append("+ ")
    $(div_c_14d).append(format_number(row["estimated_revenue_loss_14_days_delay"] - row["estimated_revenue_loss_0_days_delay"], 0))
    $(div_c_14d).append(" " + main_currency_sign)
    $(div_c_14d).addClass("text-danger")
  } else {
    $(div_c_14d).append("-")
    $(div_c_14d).addClass("text-secondary")
  }


  var div_c_30d = $(`<span class="col-4 px-0 text-center" 
                                data-toggle="tooltip"
                                data-html="true"
                                title="${gettext("Additional revenue loss, if re-oder placed after 30 days")}.<br>
                                        ${gettext("Total")}: ${format_number(parseInt(row["estimated_revenue_loss_30_days_delay"]))} ${main_currency_sign}">
                        </span>`);


  if (row["estimated_revenue_loss_30_days_delay"] - row["estimated_revenue_loss_0_days_delay"] > 0) {
    $(div_c_30d).append("+ ")
    $(div_c_30d).append(format_number(row["estimated_revenue_loss_30_days_delay"] - row["estimated_revenue_loss_0_days_delay"], 0))
    $(div_c_30d).append(" " + main_currency_sign)
    $(div_c_30d).addClass("text-danger")
  } else {
    $(div_c_30d).append("-")
    $(div_c_30d).addClass("text-secondary")
  }

  $(div_c).append(div_c_0d);
  $(div_c).append(div_c_14d);
  $(div_c).append(div_c_30d);
  return div_c.prop('outerHTML');
}


function bind_action_header_events() {
  $("#action_header_suggested_for_send_in").click(function () {
//    window.location = new_fba_send_in_from_suggestion_url
      open_popover_sugg_fba_send_ins_table.call(this)

  })
  $("#action_header_new_skus").click(function () {
    window.location = sku_database_new_skus_tab_url
  })

  $('#amz_restock_report_upload_modal').on('shown.bs.modal', function (e) {
    $("#form_amz_restock_report_txt").submit(function (e) {
      e.preventDefault(); // avoid to execute the actual submit of the form.
      // var form = $(this);
      var spinner = `<span id="spinner_btn_amz_restock_report_txt" class="spinner-border spinner-border-sm p-2 mr-1" role="status" aria-hidden="true"></span>`
      $('#spinner_amz_restock_report_txt').html(spinner)
      ajax_upload_amz_restock_report_txt_file.call(this)
    });

    $('.custom-file-input').on('change', function () {
      //get the file name
      var fileName = $(this).val();
      //replace the "Choose a file" label
      $(this).next('.custom-file-label').html(fileName);
    })
  });

}


function ajax_upload_amz_restock_report_txt_file(){
  $('#btn_amz_restock_report_txt').prop('disabled', true);
  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_amz_restock_report_txt_file_url,
    cache: false,
    processData: false,
    contentType: false,
    data: data,
    success: function(data)
    {
      $('#btn_amz_restock_report_txt').prop('disabled', false);
      $('#spinner_amz_restock_report_txt').html("")
      $('#date_amz_restock_report_uploaded').html(data["date_amz_restock_report_uploaded"])
       $('#amz_restock_report_upload_modal').modal('hide')

      alert(gettext("File successfully uploaded!"))
    },
    error: function (request, status, error) {
        alert(gettext("Error. File seems to have an incorrect format."));
        $('#btn_amz_restock_report_txt').prop('disabled', false);
        $('#spinner_amz_restock_report_txt').html("")
    }
  });
}

function fill_sum_total_stock(){
  let wait = () => {
    setTimeout(() => {
      if(!fba_stock || !current_wh_stock){
        wait();
      }else{

        $('#total_sum_pcs').html( numberWithCommas( parseInt(fba_stock["sum_fba"]["pcs"].replace(/,/g,"")) + parseInt(current_wh_stock["wh_total_pcs"].replace(/,/g,"")) + parseInt(current_wh_stock["total_pcs"].replace(/,/g,"")) ) )
        $('#total_sum_qty_cartons').html( numberWithCommas( parseInt(current_wh_stock["total_qty_cartons"].replace(/,/g,"")) + parseInt(current_wh_stock["wh_total_qty_cartons"].replace(/,/g,"")) ) )
        $('#total_sum_volume').html( numberWithCommas(
          Math.round((parseFloat(fba_stock["sum_fba"]["cbm"].replace(/,/g,"")) + parseFloat(current_wh_stock["total_volume"].replace(/,/g,"")) + parseFloat(current_wh_stock["wh_total_volume"].replace(/,/g,"")) )*10)/10
        ))

        current_wh_stock['total_sum_stock_value_considered'] = parseInt(fba_stock["sum_fba"]["stock_value"].replace(/,/g,"")) + parseInt(current_wh_stock["total_stock_value_considered"] + + parseInt(current_wh_stock["wh_total_stock_value"].replace(/,/g,"")) )
        current_wh_stock['total_sum_stock_value'] = parseInt(fba_stock["sum_fba"]["stock_value"].replace(/,/g,"")) + parseInt(current_wh_stock["total_stock_value"].replace(/,/g,"")) + parseFloat(current_wh_stock["wh_total_stock_value"].replace(/,/g,""))
        $('#total_sum_stock_value').html( numberWithCommas( current_wh_stock['total_sum_stock_value_considered'] )+ " " + main_currency_sign)
        fill_fba_plus_in_warehouse()
      }
    }, 500);
  }
  wait();
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function init_percentage_popover(type) {
  $(`#${type}_stock_value_prc_considered`).popover({
    // placement: 'top',
    // container: 'body',
    title: gettext("Specify how many percent of the stock value should be shown in the dashboard:"),
    html: true,
    sanitize: false,
    content: `<div class=""><div class="d-flex align-items-center row p-3 mb-1">` +
        // `<label>${gettext("Specify how many percent of the stock value should be shown in the dashboard:")}</label>`+
        `<input id="${type}_stock_value_prc_considered_input" style="width:125px;height:35px;" type="number" class="form-control" min=0.00 max=100.00  placeholder="Percentage">` +
        `<button id="${type}_stock_value_prc_considered_btn_save" onclick="btn_save.call(this)" class="btn btn-sm btn-info ml-2"  name="${type}_stock_value_prc_considered_edit_save_button">${gettext("Save")}</button>` +
        `<\div>` +
        `<div class="row pl-3 pr-3 pt-3">${gettext("e.g. put 20% in case you are paying only 20% deposit, when placing the order and the rest when receiving the order.")}</div>` +
        `<\div>`
  })

  $(`#${type}_stock_value_prc_considered`).on('click', function (e) {
    $(`#${type}_stock_value_prc_considered_input`).val(current_wh_stock[`${type}_stock_value_prc_considered`])
  })

}

function wh_stock_percentage_popover(){
  init_percentage_popover(type="shipped")
  init_percentage_popover(type="ordered")

    $('body').on('click', function (e) {
        if (
                $(e.target).attr('id') != "ordered_stock_value_prc_considered"
                && $(e.target).parents('#ordered_stock_value_prc_considered').length === 0
                &&$(e.target).parents('.popover').length === 0
            ) {
                $('#ordered_stock_value_prc_considered').popover('hide');
            }

        if (
                $(e.target).attr('id') != "shipped_stock_value_prc_considered"
                && $(e.target).parents('#shipped_stock_value_prc_considered').length === 0
                &&$(e.target).parents('.popover').length === 0
            ) {
                $('#shipped_stock_value_prc_considered').popover('hide');
            }
    });
}

function btn_save(){
  if(this.id == "shipped_stock_value_prc_considered_btn_save"){
   var action ="save_shipped_stock_value_prc_considered"
   var percentage = $("#shipped_stock_value_prc_considered_input").val()
   $('#shipped_stock_value_prc_considered').popover('hide');
  }
  if(this.id == "ordered_stock_value_prc_considered_btn_save"){
    var action ="save_ordered_stock_value_prc_considered"
    var percentage = $("#ordered_stock_value_prc_considered_input").val()
    $('#ordered_stock_value_prc_considered').popover('hide');
  }


  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "action": action,
      "percentage": percentage,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
        initialize_pcli_based_charts()
    }
  })
}

function total_stock_tooltips(){
    $("#in_shipm_total_stock_value").tooltip({
        placement : 'top',
        title : function(){
                    return `${numberWithCommas (current_wh_stock["in_shipm_total_stock_value_considered"])} (${current_wh_stock["shipped_stock_value_prc_considered"]}%) ${gettext("considered of")} ${numberWithCommas (current_wh_stock["in_shipm_total_stock_value"])}`
                }
    })

    $("#in_production_total_stock_value").tooltip({
        placement : 'top',
        title : function(){
                    return `${numberWithCommas (current_wh_stock["in_production_total_stock_value_considered"])} (${current_wh_stock["ordered_stock_value_prc_considered"]}%) ${gettext("considered of")} ${ numberWithCommas(current_wh_stock["in_production_total_stock_value"])}`
                }
    })

    $("#total_stock_value").tooltip({
        placement : 'top',
        title : function(){
                    return `${ numberWithCommas (current_wh_stock["total_stock_value_considered"])} ${gettext("considered of")} ${numberWithCommas (current_wh_stock["total_stock_value"])}`
                }
    })


    $("#total_sum_stock_value").tooltip({
        placement : 'top',
        title : function(){
                    return `${ numberWithCommas (current_wh_stock["total_sum_stock_value_considered"])} ${gettext("considered of")} ${numberWithCommas (current_wh_stock["total_sum_stock_value"])}`
                }
    })


}

function fill_fba_plus_in_warehouse(){
    $("#fba_plus_in_warehouse_pcs").html( numberWithCommas( parseInt(fba_stock["sum_fba"]["pcs"].replace(/,/g,"")) + parseInt(current_wh_stock["wh_total_pcs"].replace(/,/g,""))) )
    $("#fba_plus_in_warehouse_qty_cartons").html(current_wh_stock["wh_total_qty_cartons"])
    $("#fba_plus_in_warehouse_volume").html( numberWithCommas(Math.round((parseFloat(fba_stock["sum_fba"]["cbm"].replace(/,/g,"")) + parseFloat(current_wh_stock["wh_total_volume"].replace(/,/g,"")))*10)/10 ))
    $("#fba_plus_in_warehouse_stock_value").html( numberWithCommas(Math.round((parseFloat(fba_stock["sum_fba"]["stock_value"].replace(/,/g,"")) + parseFloat(current_wh_stock["wh_total_stock_value"].replace(/,/g,"")))*10)/10) + " " + main_currency_sign)
}

function adjust_chart_height(){

        var card_body_height = $('.reach_dist_chart').closest('.card-body').height();
        $('.reach_dist_chart').css({'max-height':card_body_height - 148})

        $(window).on('resize', function(){
            var card_body_height = $('.reach_dist_chart').closest('.card-body').height();
            $('.reach_dist_chart').css({'max-height':card_body_height - 48})
        });

}
function open_popover_sugg_fba_send_ins_table() {

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: `<div class="d-flex justify-content-between">
                <span>${gettext("Suggested FBA Send Ins by Warehouse and Marketplace:")}</span>
                <span data-toggle="tooltip" data-html="true" 
                      title="${gettext("These suggestions base on a warehouse spanning view,<br>that prevents sending in the same SKU twice in case it exists in multiple warehouses.")}">
                    <i class="far fa-question-circle"></i>
                </span>
            </div>` ,
    html: true,
    sanitize: false,
    content: dt_sugg_fba_send_ins
  }).popover('show')

  $(".popover").css("max-width", 825)
  $('[data-toggle="tooltip"]').tooltip();
  // $(".popover").css("min-width", 825)
  init_dt_sugg_fba_send_ins()

    $('body').on('click', function (e) {
        if (
                $(e.target).attr('id') !== "action_header_suggested_for_send_in"
                && $(e.target).parents('#action_header_suggested_for_send_in').length === 0
                &&$(e.target).parents('.popover').length === 0
            ) {
                $('#action_header_suggested_for_send_in').popover('hide');
            }
    });
}

function init_dt_sugg_fba_send_ins(){
   columns = [
      {"data": "warehouse", "name": "warehouse", className: "warehouse"}
   ]
    if(selected_amazon_region === "US"){
        $.merge(columns, [
            {"data": "amazon_com", "name": "amazon_com", className: "amazon_com"}
        ]);
    }
    else if(selected_amazon_region === "EU"){
        $.merge(columns, [
              {"data": "amazon_de", "name": "amazon_de", className: "amazon_de"},
              {"data": "amazon_fr", "name": "amazon_fr", className: "amazon_fr"},
              {"data": "amazon_co_uk", "name": "amazon_co_uk", className: "amazon_co_uk"},
              {"data": "amazon_it", "name": "amazon_it", className: "amazon_it"},
              {"data": "amazon_es", "name": "amazon_es", className: "amazon_es"}
        ]);
    }

  $("#dt_sugg_fba_send_ins").DataTable({
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "dt_sugg_fba_send_ins",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": columns,

    "columnDefs": [
        {
        "targets": [
            "amazon_de",
            "amazon_fr",
            "amazon_co_uk",
            "amazon_it",
            "amazon_es",
            "amazon_com"
        ],
          "orderable": false,
        "render": function (data, type, row, meta) {
            var mp = columns[meta.col]["name"]
            var div_c = $(`<div class="badge py-2 d-flex justify-content-center"
                            style="cursor: pointer; font-size: large" 
                            onclick="create_fba_send_in.call(this, ${row['warehouse_id']}, '${mp}')" >
                          </div>`)

            if(data === 0){
              div_c.addClass("badge-light")
            } else {
              div_c.addClass("badge-warning")
            }
            div_c.append(`<span >${data}</span>`)
            return div_c.prop('outerHTML');
        },
      },
    ],
    "lengthChange": false,
    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": false

  });
}

function create_fba_send_in(warehouse_id, mp){
    use_mixed_carton_configurator_source_loose_stock = $("#use_mixed_carton_configurator_source_loose_stock").prop('checked');
    window.location = `/new_fba_send_in_from_suggestion_sourcing_dict/${warehouse_id}/${mp}/${use_mixed_carton_configurator_source_loose_stock}`
}

function create_all_required_fba_send_ins_from_suggestion_sourcing_dict(){
//    use_mixed_carton_configurator = $("#use_mixed_carton_configurator").prop('checked');
    use_mixed_carton_configurator_source_loose_stock = $("#use_mixed_carton_configurator_source_loose_stock").prop('checked');

    window.location = `/create_all_required_fba_send_ins_from_suggestion_sourcing_dict/${use_mixed_carton_configurator_source_loose_stock}`
}
