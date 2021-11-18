function bind_events() {
  $('span[name="change_po_status"]').on('click', change_po_status);

  $("#form_import_all_purchase_orders_csv_file").submit(function(e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    var spinner = `<span id="spinner_import_all_purchase_orders_csv_file" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>`;
    $('#btn_import_all_purchase_orders_csv_file > span#spinner_import_all_purchase_orders_csv_file').html(spinner);
    ajax_upload_all_purchase_orders_csv_file.call(this)
  });

  bind_on_table_drawn_events()

}



function init_dt_purchase_orders_log_config(){
  dt_purchase_orders_log_config = {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_purchase_orders_log",
        "archived": false,
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"data": "purchase_order_id", "name": "purchase_order_id", className: "purchase_order_id select-checkbox", width: "5px", orderable:false},
      {"data": "date_added", "name": "date_added", className: "date_added "},
      {"data": "warehouse_name", "name": "warehouse_name", className: "warehouse_name "},
      {"data": "status", "name": "status", className: "status "},
      {"data": "transport_mode", "name": "transport_mode", className: "transport_mode ", width:"5px"},
      {"data": "order_name", "name": "order_name", className: "order_name "},
      {"data": "order_placed_date", "name": "order_placed_date", className: "order_placed_date "},
      {"data": "order_shipped_date", "name": "order_shipped_date", className: "order_shipped_date "},
      {"data": "order_received_date", "name": "order_received_date", className: "order_received_date "},
      { "name": "actions", className: "actions noVis", width: "8rem"},
    ],

    order: [1, "desc"],
    "createdRow": function ( row, data, index ) {
            $(row).attr("id", data["purchase_order_id"]+"-row")
        },
    "columnDefs": [
      {
        "targets": ["purchase_order_id"],
        "data": "purchase_order_id",
        "width": "10px",
        "orderable":false,
        "searchable":false,
        "render": function(data, type, row){
            return ``
        }
      },
      {
        "targets": [
          "purchase_order_id",
          "date_added",
          "warehouse_name",
          "transport_mode",
        ],
        "visible": false,
      },

      {
        "targets": "status",
        "data": "status",
        "width": "10px",
        "createdCell":  function (td, cellData, rowData, row, col) {
          $(td).addClass('p-0');
          $(td).attr('id', `${rowData['purchase_order_id']}-status_badge`);
          add_coloring_to_po_badge_by_status(td, rowData)
        },
        "render": function (data, type, row) {
          if (type === "display") {
            return get_po_status_badge_dropdown_html(row)
          } else {
            return gettext(data)
          }
        },
      },

      {
        "targets": "transport_mode",
        "data": "transport_mode",
        "createdCell":  function (td, cellData, rowData, row, col) {
          $(td).addClass('p-0');
          $(td).css("text-align","center");
        },
        "render": function (data, type, row) {
          if (type==="display"){
            switch (data){
              case "sea":
                return `<i title="${gettext("Sea")}" class="fas fa-ship" data-toggle="tooltip"></i>`
              case "air":
                return `<i title="${gettext("Air")}" class="fas fa-plane" data-toggle="tooltip"></i>`
              case "train":
                return `<i title="${gettext("Train")}" class="fas fa-train" data-toggle="tooltip"></i>`
              case "truck":
                return `<i title="${gettext("Truck")}" class="fas fa-truck" data-toggle="tooltip"></i>`
              case "other":
                return gettext('Other')
              default:
                return "";
            }
          } else {
            switch (data){
              case "sea":
                return gettext("Sea")
              case "air":
                return gettext("Air")
              case "train":
                return gettext("Train")
              case "truck":
                return gettext("Truck")
              case "other":
                return gettext('Other')
              default:
                return "";
            }
          }
        },
      },

      {
        "targets": "order_name",
        "data": "order_name",
        "render": function (data, type, row) {
          if (type === "display") {
            var div_c = $(`<div class="d-flex justify-content-start align-items-center"></div>`);
            var order_notes_btn_div = $(`<div id=notes_${row["purchase_order_id"]} data-toggle="popover" data-html="true"></div>`);
            if (row["is_loose_stock_to_carton_conversion"] === true) {
              var carton_conversion_icons_div = $(`<div 
                                                            class="mr-2 text-secondary"
                                                            title="${gettext('Loose Stock to Carton Conversion')}"
                                                            data-toggle="tooltip">
                                                            <i class="fa fa-box-open"></i>
                                                            <i class="fa fa-arrow-right"></i>
                                                            <i class="fa fa-box"></i>
                                                          </div>`
              );
            div_c.append(carton_conversion_icons_div);
            }


            var name_link = $(`<a href="${purchase_orders_url + row["purchase_order_id"]}/">
                                          ${row["order_name"]}
                                        <a/>`);
            div_c.append(name_link);

            if (row["order_notes"] !== "") {

              content = get_po_notes_content_for_popover(row["order_notes"])

              order_notes_btn_div.attr("title", 'Order Notes <a class="ml-2" href="#" id="edit_order_notes"><i class="fa fa-edit text-secondary"></i></a>');
              order_notes_btn_div.attr("data-placement", "top");
              console.log(row["order_name"])
              order_notes_btn_div.attr("data-content", `<div data-po_id=${row["purchase_order_id"]}  > ${content} </div>`);
//              order_notes_btn_div.attr("onclick", `window.location='${edit_purchase_order_url + row["purchase_order_id"]}'`);
              order_notes_btn_div.attr("style", `cursor: pointer;`);
              order_notes_btn_div.append($('<i class="ml-1 fa fa-file-alt text-secondary"></i>'));
              div_c.append(order_notes_btn_div);
            }

            return div_c.prop("outerHTML")
          } else {
            return data
          }

        },
      },

      {
        "targets": "order_placed_date",
        "data": "order_placed_date",
        'createdCell': function (td, data, rowData, row, col) {
            if(data != "n/a" && data != ""){
                  order_placed_date = new Date(data)
                  today = new Date()
                  next_7_days = new Date().setDate(today.getDate() + 7);

                  if ( order_placed_date > today && order_placed_date < next_7_days && rowData["status"] == "Planned"  ) {
                        $(td).addClass('table-warning');
                  }

                  else if ( order_placed_date < today && rowData["status"] == "Planned" ) {
                        $(td).addClass('table-danger');
                  }
            }
         },
        "render": function (data, type, row) {
          if(data === "n/a"){
            data = ""
          }
          if (type === "display"){
            var name = "order_placed_date"
            var id = row["purchase_order_id"] + "-" + name
            var value = data
            return get_date_picker_input_html(id, name, value)
          } else {
            return data
          }
        },
      },

      {
        "targets": "order_shipped_date",
        "data": "order_shipped_date",
        'createdCell': function (td, data, rowData, row, col) {
            if(data != "n/a" && data != ""){
                  order_shipped_date = new Date(data)
                  today = new Date()
                  next_7_days = new Date().setDate(today.getDate() + 7);

                  if ( order_shipped_date > today && order_shipped_date < next_7_days && ( rowData["status"] == "Ordered" || rowData["status"] == "Planned" ) ) {
                        $(td).addClass('table-warning');
                  }

                  else if ( order_shipped_date < today && ( rowData["status"] == "Ordered" || rowData["status"] == "Planned" ) ) {
                        $(td).addClass('table-danger');
                  }
            }
         },
        "render": function (data, type, row) {
          if(data === "n/a"){
            data = ""
          }
          if (type === "display"){
            var name = "order_shipped_date"
            var id = row["purchase_order_id"] + "-" + name
            var value = data
            return get_date_picker_input_html(id, name, value)
          } else {
            return data
          }
        },
      },

      {
        "targets": "order_received_date",
        "data": "order_received_date",
        'createdCell': function (td, data, rowData, row, col) {
          if(data != "n/a" && data != ""){
              order_received_date = new Date(data)
              today = new Date()
              next_7_days = new Date().setDate(today.getDate() + 7);
              if ( order_received_date > today && order_received_date < next_7_days && rowData["status"] !== "Received" ) {
                    $(td).addClass('table-warning');
              }

              else if ( order_received_date < today && rowData["status"] !== "Received" ) {
                    $(td).addClass('table-danger');
              }
          }
         },
        "render": function (data, type, row) {
          if(data === "n/a"){
            data = ""
          }
          if (type === "display"){
            var name = "order_received_date"
            var id = row["purchase_order_id"] + "-" + name
            var value = data
            return get_date_picker_input_html(id, name, value)
          } else {
            return data
          }
        },
      },

      {
        "targets": "actions",
        "data": "obj_id",
        "orderable": false,
        "render": function (data, type, row) {
          var archive_btn_div = $(`<div data-toggle="tooltip" onclick="toggle_archive_purchase_order.call(this, ${row["purchase_order_id"]}) "></div>`)
          var archive_btn_icon = $('<i class="ml-1 fa text-secondary"></i>')

          if (row["archived"]){
            archive_btn_icon.addClass("fa-undo")
            archive_btn_div.attr("title", gettext("De-Archive"))
          } else {
            archive_btn_icon.addClass("fa-archive")
            archive_btn_div.attr("title", gettext("Put to Archive"))
          }
          archive_btn_div.append(archive_btn_icon)

          return `<div class="d-flex align-items-center pl-2" style="white-space: nowrap ;cursor: pointer">
                    <div data-toggle="tooltip" title="${gettext("Edit")}" onclick="window.location='${edit_purchase_order_url + row["purchase_order_id"]}'">
                        <i class="mr-1 fas fa-edit text-secondary mr-1" ></i>
                    </div>
                    <div class="pr-2 pl-2" style="cursor: pointer" data-toggle="tooltip" title="${gettext("Clone")}" onclick="clone_purchase_order.call(this, ${row["purchase_order_id"]})">
                        <i class="far fa-clone text-secondary mr-1" ></i>
                    </div>
                    ${archive_btn_div.prop("outerHTML")}
                  
                    <div id="${row["purchase_order_id"]}-save_changes_btn" class="badge badge-pill badge-success ml-3 p-2 save_changes_btn" style="display: none" data-toggle="tooltip" title="${gettext("Save row changes")}">
                      <i class="fas fa-save  text-white save_changes_btn " style="display: none"></i>
                    </div>
  
                    <div id="${row["purchase_order_id"]}-cancel_changes_btn" class="badge badge-pill badge-danger ml-1 p-2 cancel_changes_btn" style="display: none" data-toggle="tooltip" title="${gettext("Revert row changes")}">
                      <i class="fas fa-undo  text-white cancel_changes_btn" style="display: none"></i>
                    </div>
                  </div>
                `
        },
      },

    ],
    buttons: [
            {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i> ${gettext("Select Columns")}`,
      },
        {
        extend: 'collection',
        text: '<i class="fas fa-ellipsis-v mr-1"></i>' + gettext("Actions"),
        buttons: [

          {
            text: `<i class="far fa-file-alt text-secondary mr-1"></i>${gettext("Export freight forwarder documentation for selected")}`,
            action: function (e, dt, node, config) {
              download_selected_purchase_orders()
              dt_button_collection_close()
            }
          },
        ]
      },
    ],

  };

  $.extend(dt_purchase_orders_log_config, def_dt_settings_for_scroller);
  // dt_purchase_orders_log_config["scrollY"] = false;
  dt_purchase_orders_log_config["select"] = default_select;
  return dt_purchase_orders_log_config
}


function initialize_dt_purchase_orders_log(){
  dt_purchase_orders_log = $('#dt_purchase_orders_log').DataTable(dt_purchase_orders_log_config);

  return dt_purchase_orders_log
}


function re_initialize_dt_purchase_orders_log_for_archived(){
    $(this).html(`<i class="fas fa-ship mr-1"></i> ${gettext("Show Non-Archived Purchase Orders")}`);
    $(this).attr("onclick","re_initialize_dt_purchase_orders_log_for_non_archived.call(this)");
    var table = $("#dt_purchase_orders_log");
    table.DataTable().destroy();
    dt_purchase_orders_log_config["ajax"].data["archived"] = true;

  $('#dt_purchase_orders_log').DataTable(dt_purchase_orders_log_config);
}

function re_initialize_dt_purchase_orders_log_for_non_archived(){
    $(this).html(`<i class='fas fa-archive mr-1'></i>${gettext("Show Archived Purchase Orders")}`);
    $(this).attr("onclick","re_initialize_dt_purchase_orders_log_for_archived.call(this)");
    var table = $("#dt_purchase_orders_log");
    table.DataTable().destroy()
    dt_purchase_orders_log_config["ajax"].data["archived"] = false

  $('#dt_purchase_orders_log').DataTable(dt_purchase_orders_log_config);
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

function toggle_archive_purchase_order(po_id) {
  $(this).tooltip('hide')
  $("#"+po_id+"-row").remove()
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "po_id" : po_id,
      "action": "toggle_archive_purchase_order",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      // $("#dt_purchase_orders_log").DataTable().ajax.reload();
    },
    error:function(){
      alert(gettext("Error. Purchase order could not be archived."))
    },
  })
}



function ajax_upload_all_purchase_orders_csv_file(){
  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_all_purchase_orders_csv_file_url,
    cache: false,
    processData: false,
    contentType: false,
    data: data,
    success: function(data)
    {
      $('span#spinner_import_all_purchase_orders_csv_file').html("")
      alert(gettext("File successfully uploaded!"))
      $("#csv_import_export_modal").modal("toggle");
    },
    error: function (request, status, error) {
        alert(request.responseJSON["error"]);
        $('span#spinner_import_all_purchase_orders_csv_file').html("")
    }
  });
}


function add_coloring_to_po_badge_by_status(td, rowData) {
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




function bind_on_table_drawn_events() {
  $('#dt_purchase_orders_log').on('draw.dt', function () {
    $.getScript(datepicker_widget_url)
  });

  $('#dt_purchase_orders_log').on('draw.dt', function () {
  $('[data-toggle="tooltip"]').tooltip();

    var DefaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList

    // To allow div elements and data-option attributes on div elements
    DefaultWhiteList.div = ['data-po_id', 'onclick', 'style']
    DefaultWhiteList.textarea = ["rows", "id"]
    DefaultWhiteList.input = [ 'onclick', 'class', 'style', 'value']

  $('[data-toggle="popover"]').popover({ trigger: "manual" , html: true, animation:false})
    .on("mouseenter", function () {
        var _this = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function () {
            $(_this).popover('hide');
        });
    })
    .on("mouseleave", function () {
        var _this = this;
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 300);
        });
    $(document).on("click", "#edit_order_notes" , function(){
        content_node = $(this).parent(".popover-header").next(".popover-body").children("div")
        content = $(this).parent(".popover-header").next(".popover-body").children("div").html().replaceAll("<br>","\n")

        content = content.replaceAll(/<a[^>]*>/g, '').replaceAll(/<\/a>/g, '')

        po_id = $(this).parent(".popover-header").next(".popover-body").children("div").data("po_id");
        $(`#notes_${po_id}`).attr("data-content", `<div style="width:200px"><textarea id=notes_val_${po_id} rows=5 >${content}</textarea></div>

                    <input type="submit" name="Save" value="Save" class="btn btn-primary btn btn-primary mt-1 btn-block btn-md" id="submit-id-save"
                        onclick="save_order_notes.call(this, ${po_id})">
                    `);
        $(`#notes_${po_id}`).popover("show");
    });
});
}


function show_changes_btn() {
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable()
  var current_row = dt.cell(td_node).index()["row"]
  var purchase_order_id = dt.cell(current_row, "purchase_order_id:name").data()

  show_save_changes_btn(purchase_order_id)
  show_cancel_changes_btn(purchase_order_id)
}

function show_save_changes_btn(purchase_order_id) {
  save_changes_btn = $(`#${purchase_order_id}-save_changes_btn`)
  save_changes_btn.attr("style", "pointer: cursor")
  save_changes_btn.attr("onclick", "save_input_changes.call(this)")
  save_changes_btn.find("i").attr("style", "cursor: pointer")
}

function show_cancel_changes_btn(purchase_order_id) {
  cancel_changes_btn = $(`#${purchase_order_id}-cancel_changes_btn`)
  cancel_changes_btn.attr("style", "pointer: cursor")
  cancel_changes_btn.attr("onclick", "cancel_input_changes.call(this)")
  cancel_changes_btn.find("i").attr("style", "cursor: pointer")
}

function save_input_changes() {
    var btn = $(this)
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable()
    var current_row = dt.cell( td_node ).index()["row"]

    var order_placed_date = $(dt.cell( current_row, "order_placed_date:name").node()).find("input").val()
    var order_shipped_date = $(dt.cell( current_row, "order_shipped_date:name").node()).find("input").val()
    var order_received_date = $(dt.cell( current_row, "order_received_date:name").node()).find("input").val()

    var po_id = dt.cell( current_row, "purchase_order_id:name").data()

  td_node.find('.cancel_changes_btn').attr("style", "display: none")
  $(this).find("i").attr("style", "display: none")
  $(this).append(`<span id="spinner_import_all_purchase_orders_csv_file" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "po_id": po_id,
      "action": "save_purchase_order_log_row_changes",
      "order_placed_date": order_placed_date,
      "order_shipped_date": order_shipped_date,
      "order_received_date": order_received_date,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      btn.find("span").remove()
      btn.attr("style", "display: none")
      $(".tooltip").tooltip('hide')
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

    var order_placed_date = dt.cell( current_row, "order_placed_date:name").data()
    var order_shipped_date = dt.cell( current_row, "order_shipped_date:name").data()
    var order_received_date = dt.cell( current_row, "order_received_date:name").data()

    $(dt.cell( current_row, "order_placed_date:name").node()).find("input").val(order_placed_date)
    $(dt.cell( current_row, "order_shipped_date:name").node()).find("input").val(order_shipped_date)
    $(dt.cell( current_row, "order_received_date:name").node()).find("input").val(order_received_date)

    td_node.find('.save_changes_btn').attr("style", "display: none")
    td_node.find('.cancel_changes_btn').attr("style", "display: none")
    $(".tooltip").tooltip('hide')

}



function change_po_status() {
  var po_id = $(this).data('po_id');
  var status = $(this).data('status');

  var rowData = {};
  rowData["status"] = status;
  rowData["display_type"] = "standard";

  var td = $(`#${po_id}-status_badge`);
  add_coloring_to_po_badge_by_status(td, rowData);
  $(td).find("span.selected_badge").html(gettext(status));

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
      $('#dt_purchase_orders_log').DataTable().ajax.reload();
    },
    error:function(){
      alert(gettext("Error. Purchase order status could not be changed."))
    }
  })
}

function download_selected_purchase_orders(){
  var po_ids = $.map(dt_purchase_orders_log.rows('.selected').indexes(), function (row_indexes) {
    return dt_purchase_orders_log.cell(row_indexes, "purchase_order_id:name").data()
  })

  if(po_ids.length < 1){
    alert(gettext("Error. Nothing selected!"))
    return;
  }

  window.location.href="/download_file/selected_purchase_orders_export?po_ids="+po_ids
}

function save_order_notes(po_id, order_notes){
    po_notes = $(`#notes_val_${po_id}`).val()
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "po_id" : po_id,
      "order_notes": po_notes,
      "action": "change_notes_purchase_order",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
        content = get_po_notes_content_for_popover(po_notes)
        $(`#notes_${po_id}`).attr("data-content", `<div data-po_id=${po_id}  > ${content} </div>`)
        $(`#notes_${po_id}`).popover("hide");
    },
    error:function(){
      alert(gettext("Error. Purchase order notes could not be changed."))
    }
  })
}

function get_po_notes_content_for_popover(order_notes){
      content  = order_notes.replaceAll("\n", "<br>")
      var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      var content = content.replace(exp, "<a href='$1' target='_blank'>$1</a>");
      var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
      var content = content.replace(exp2, "<a href='$1' target='_blank'>$1</a>");
      return content
}