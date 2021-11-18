$(document).ready(function () {
  register_datatable_sums_functionality()
  initialize_dt_sku_history_log()
});

get_skuh_li = {
  "obj_id":                   0,
"event":                      1,
"order_name":                 2,
"shipment_id":                3,
"fba_send_in_name":           4,
"event_date":                 5,
"pcs_per_carton":             6,
"qty_cartons":                7,
"pcs_total":                  8,
"remaining_prc":              9,
"date_received":             10,
"qty_cartons_on_the_way":    11,
"pcs_total_on_the_way":      12,
"main_ordering":             13,
}

function initialize_dt_sku_history_log() {
  $('#dt_sku_history_log').DataTable({
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_sku_history_log",
        "obj_id": sku_id,
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"data": "obj_id", "name": "obj_id", className: "obj_id"},//0
      {"data": "event", "name": "event", className: "event"},//1
      {"data": "order_name", "name": "order_name", className: "cut_text"},//2
      {"data": "shipment_id", "name": "shipment_id", className: "fba_send_in_name"},
      {"data": "fba_send_in_name", "name": "fba_send_in_name", className: "cut_text"},//3
      {"data": "event_date", "name": "event_date", className: "event_date"},//4
      {"data": "pcs_per_carton", "name": "pcs_per_carton", className: "dt-center"},//5
      {"data": "qty_cartons", "name": "qty_cartons", className: "dt-center"},//6
      {"data": "pcs_total", "name": "pcs_total", className: "dt-center"},//7
      {"data": "remaining_prc", "name": "remaining_prc", className: "remaining_prc dt-center"},//7
      {"data": "date_received", "name": "date_received", className: "date_received noVis"},//7
      {"data": "qty_cartons_on_the_way", "name": "qty_cartons_on_the_way", className: "qty_cartons_on_the_way noVis"},//7
      {"data": "pcs_total_on_the_way", "name": "pcs_total_on_the_way", className: "pcs_total_on_the_way noVis"},//7
      {"data": "main_ordering", "name": "main_ordering", className: "main_ordering noVis"},//7
    ],
    "lengthMenu": [[50, 100, -1], [50, 100, "All"]],
    fixedHeader: {
      headerOffset: $('#navbar-container').outerHeight()
    },
        orderFixed: [
      // [get_skuh_li["order_name"], 'asc'],
      [get_skuh_li["main_ordering"], "asc"],
      [get_skuh_li["date_received"], 'asc'],
    ],
    "order": [
      [get_skuh_li["event_date"], "asc"],
      [get_skuh_li["main_ordering"], "asc"],
      // [get_skuh_li["order_name"], "asc"],
      // [get_skuh_li["fba_send_in_name"], "asc"],
    ],
    // dom: "",
    dom:    "<'row mt-1'<'col-sm-12 col-md-9 mb-2 'B><'col-sm-12 col-md-3'f>>" +
      "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>"+
      "<'row'<'col-sm-12 col-md-12'l>>",

    "createdRow": function ( row, data, index ) {
      if (data["event"] === "Purchase Order") {
        $(row).attr('style', "font-weight: bold;");

        $(row).addClass('purchase_order');
        if(data["status"] === "Received"){
              $(row).addClass('table-primary');
            } else if (data["status"] === "Ordered"){
              $(row).addClass('table-secondary');
            }
      }
    },

    "columnDefs": [
      {
        "targets": [
          "obj_id",
          "date_received",
          "qty_cartons_on_the_way",
          "pcs_total_on_the_way",
          "main_ordering",
        ],
        "visible": false,
      },

      {
        "targets": "remaining_prc",
        "data": "remaining_prc",
        "orderable": false,
        "createdCell": function (td, cellData, rowData, row, col) {
          if (rowData["event"] === "Purchase Order") {
            $(td).attr('data-toggle', `tooltip`);
            $(td).attr('title', `${rowData["remaining_prc"]} % | ${rowData["cartons_left"]} ${gettext("ctns.")} | ${rowData["pcs_left"]} ${gettext("pcs. remaining")}`);
          } else {
            $(td).html('');
          }

        },
        "render": function (data, type, row) {
          return `<div class="progress" >
                    <div class="progress-bar" role="progressbar" style="width: ${row["remaining_prc"]}%;" aria-valuenow="${row["remaining_prc"]}" aria-valuemin="0" aria-valuemax="100" ></div>
                  </div>`
        },
      },

      {
        "targets": "event",
        "createdCell": function (td, cellData, rowData, row, col) {
          if(cellData !== "Purchase Order"){
            $(td).addClass("pl-4")
          }
          $(td).css("white-space", "nowrap");
        },
        "data": "event",
        "render": function (data, type, row) {
          if(data === "Purchase Order"){
            if(row["status"] === "Received"){
              return `<i class="fas fa-ship mr-1"></i>${event_log_translation_dict[data]}
                      <span class="badge badge-success ml-2 py-2 px-1">
                        ${po_status_translation_dict[row["status"]]}
                      </span>
                      `
            } else if (row["status"] === "Shipped"){
              return `<i class="fas fa-ship mr-1"></i>${event_log_translation_dict[data]}
                      <span class="badge badge-primary ml-2 py-2 px-1">
                        ${po_status_translation_dict[row["status"]]}
                      </span>
                      `
            } else if (row["status"] === "Ordered"){
              return `<i class="fas fa-ship mr-1"></i>${event_log_translation_dict[data]}
                      <span class="badge table-primary ml-2 py-2 px-1">
                        ${po_status_translation_dict[row["status"]]}
                      </span>
                      `
            }

          } else if(data === "Cancelled FBA Send In"){
            return `<i class="fas fa-times text-danger mr-1"></i>${event_log_translation_dict[data]}`
          } else if(data === "Not found"){
            return `<i class="fas fa-question text-danger mr-1"></i>${event_log_translation_dict[data]}`
          }else{
            return `${data}`
          }

        },
      },

      {
        "targets": "fba_send_in_name",
        "data": "fba_send_in_name",
        "render": function (data, type, row) {
          if(row["event"] === "Purchase Order"){
            return ""
          }
          else if (data === "n/a") {
            return `<span class="d-inline-block text-truncate" style="max-width: 90%;" title="${data}">
                        ${data}
                    </span>
                    `

          } else {
            return `
                    <div class="d-flex align-items-center">
                      <span class="d-inline-block text-truncate" style="max-width: 90%;" title="${data}">${data}</span>
                      <a href="${fba_send_ins_url + row["fba_send_in_id"]}"><i class="ml-1 fas fa-external-link-alt text-light"></i></a>
                    </div>
                                        `
          }
        },
      },

      {
        "targets": "event_date",
        "data": "event_date",
        "render": function (data, type, row) {
          if(row["event"] === "Purchase Order"){
            return  `${data} <i class="far fa-question-circle text-secondary" data-toggle="tooltip" title="${gettext("Received Date")}"></i>`
          } else {
            return `${data}`
          }
        },
      },

      {
        "targets": "order_name",
        "data": "order_name",
        "render": function (data, type, row) {
                      return `
                    <div class="d-flex align-items-center">
                      <span class="d-inline-block text-truncate" style="max-width: 90%;" title="${data}">${data}</span>
                      <a href="${purchase_orders_url + row["purchase_order_id"]}"><i class="ml-1 fas fa-external-link-alt text-light"></i></a>
                    </div>
                                        `
        },
      },

      {
        "targets": "shipment_id",
        "data": "shipment_id",
        "orderable": false,
        "render": function (data, type, row) {
                    if (!data) return "";
                    return `<a target="_blank" href=https://sellercentral-europe.amazon.com/gp/fba/inbound-shipment-workflow/index.html#${data}/summary/shipmentEvent>${data}</a>`;
        },
      },

    ],

    buttons: [{
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
    ],

    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": true,
    drawCallback: function () {
      var api = this.api();
      ctns_in_wh_ontw = api.column(get_skuh_li["qty_cartons_on_the_way"], {page: 'current'}).data().sum()
      pcs_in_wh_ontw = api.column(get_skuh_li["pcs_total_on_the_way"], {page: 'current'}).data().sum()

      ctns_in_wh = api.column(get_skuh_li["qty_cartons"], {page: 'current'}).data().sum() - ctns_in_wh_ontw
      pcs_in_wh = api.column(get_skuh_li["pcs_total"], {page: 'current'}).data().sum() - pcs_in_wh_ontw

      if (pcs_in_wh_ontw > 0 ){
        ctns_in_wh_ontw_html = `<div class="mx-1" data-toggle="tooltip" title="${gettext("CTNS on the way")}">(+${ctns_in_wh_ontw})</div>`
        pcs_in_wh_ontw_html =  `<div class="mx-1" data-toggle="tooltip" title="${gettext("PCS on the way")}">(+${pcs_in_wh_ontw})</div>`
      } else{
        ctns_in_wh_ontw_html = ""
        pcs_in_wh_ontw_html = ""
      }

      $(api.table().column(get_skuh_li["qty_cartons"]).footer()).html(`<div class="d-flex justify-content-center">${ctns_in_wh}${ctns_in_wh_ontw_html} ${gettext("Ctns.")}</div>`);
      $(api.table().column(get_skuh_li["pcs_total"]).footer()).html(`<div class="d-flex justify-content-center">${pcs_in_wh}${pcs_in_wh_ontw_html} ${gettext("Pcs.")}</div>`);

       $('[data-toggle="tooltip"]').tooltip();
    }
  });

}
