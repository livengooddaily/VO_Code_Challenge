$(document).ready( function () {
  register_datatable_sums_functionality();
  initialize_dt_purchase_order_line_items ();

  if (initial_category !== "None") {
    initialize_dt_add_skus_manually('#dt_add_skus_manually', initial_category)
  } else {
    initialize_dt_add_skus_manually()
  }

  bind_tab_switching_functionality();

  bind_events();
  updateDisplay();
  bind_save_all_button_events();
  bind_cancel_all_button_events();
});


function bind_events() {
  bind_on_table_drawn_events();
  bind_item_add_buttons_events();

  $('#add_skus_manually_modal').on('shown.bs.modal', function (e) {
    $('#dt_add_skus_manually').DataTable().ajax.reload();
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });

  $('#add_skus_manually_modal').on('hide.bs.modal', function (e) {
    $('#dt_purchase_order_line_items').DataTable().ajax.reload();
  });

  $('#add_skus_manually_to_mixed_carton_modal').on('shown.bs.modal', function (e) {
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });

  $('#add_skus_manually_to_mixed_carton_modal').on('hide.bs.modal', function (e) {
    $('#dt_purchase_order_line_items').DataTable().ajax.reload();
  });

  $('span[name="change_po_status"]').on('click', change_po_status);


}

function bind_item_add_buttons_events() {
  $('.item_add_button').on('click', open_and_init_add_skus_manually_modal);
}

function open_and_init_add_skus_manually_modal() {
  var item_type = $(this).data("item_type");
  var asm_modal = $('#add_skus_manually_modal');
  asm_modal.data("item_type", item_type);

  if (item_type === "plain_carton" || item_type === "loose_stock" ){
    asm_modal.modal("show");
  } else if (item_type === "mixed_carton") {
    add_mixed_carton_to_po()
  }
}


function open_mixed_carton_modal(mc_id) {
  if (initial_category !== "None") {
    initialize_dt_add_skus_manually_to_mixed_carton(mc_id, '#dt_add_skus_manually_to_mixed_carton', initial_category)
    $(`a[id=nav_link_cat_tab]`).tab('show');
  } else {
    initialize_dt_add_skus_manually_to_mixed_carton(mc_id)
  }
  $('#add_skus_manually_to_mixed_carton_modal').modal("show");
  $('#add_skus_manually_to_mixed_carton_modal').data("mc_id", mc_id)
}


function bind_tab_switching_functionality() {
  $('.nav-tabs a').on('click', function (e) {
    e.preventDefault();
    add_switch_tabs_functionality.call(this)
  });
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


function bind_save_all_button_events() {

//  $("#save_all_btn").click(function () {
//    $(".save_changes_badge:not(:hidden)").each(function () {
//      $(this).trigger("click");
//    });
//    $(".second_topbar_transparent ").attr("style", "display: none");
//    sleep(500).then(() => {
//      $('#dt_purchase_order_line_items').DataTable().ajax.reload();
//    })
//    // $('#dt_purchase_order_line_items').DataTable().ajax.reload();
//
//  });

  $("#save_all_btn").click(function () {
    save_all_row_changes.call(this)

  });

    $(".input_change").on('keyup', function (e) {
        console.log($(".second_topbar_transparent"))
        if (e.key === 'Enter' || e.keyCode === 13) {
            save_all_row_changes.call(this)
//            $(".save_changes_badge:not(:hidden)").each(function () {
//              $(this).trigger("click");
//            });
//            console.log($(".second_topbar_transparent"))
//            $(".second_topbar_transparent").attr("style", "display: none");
//
//            sleep(500).then(() => {
//              $('#dt_purchase_order_line_items').DataTable().ajax.reload();
//            })
            // $('#dt_purchase_order_line_items').DataTable().ajax.reload();

          }
        });
}

function bind_cancel_all_button_events() {

  $("#cancel_all_btn").click(function () {
    $(".cancel_changes_btn:not(:hidden)").each(function () {
      $(this).trigger("click");
    });
    $(".second_topbar_transparent ").attr("style", "display: none");

    // $('#dt_purchase_order_line_items').DataTable().ajax.reload();
  });

}



function get_progress_bar_html(value) {
return `<div class="progress" >
        <div class="progress-bar" role="progressbar" style="width: ${value}%;" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" ></div>
      </div>`
}

function bind_on_table_drawn_events() {
  $('#dt_purchase_order_line_items').on('draw.dt', function () {
    $.getScript(datepicker_widget_url)
    $('[data-toggle="tooltip"]').tooltip();
    $(".tooltip").tooltip('hide')
    $('.popover').popover("hide")

    $('.input_change').keypress(function (e) {
      if (e.which == 13) {
//        var btn = $(this).closest("tr").find(".save_changes_badge");
//        save_input_changes.call(btn)
            $(".save_changes_badge:not(:hidden)").each(function () {
              $(this).trigger("click");
            });
            $(".second_topbar_transparent").attr("style", "display: none");

            sleep(500).then(() => {
              $('#dt_purchase_order_line_items').DataTable().ajax.reload();
            })
      }
    });


    bind_on_input_change_events()

  });

}

function bind_on_table_drawn_events_for_add_skus_manually(dt_id='#dt_add_skus_manually') {
  $(dt_id).on('draw.dt', function () {
      $('[data-toggle="tooltip"]').tooltip();
      $(".tooltip").tooltip('hide');
      $('.popover').popover("hide");
  });

}


function bind_on_input_change_events() {

    $('div[data-carton_type="mixed_carton"] > div > input').change(function (e) {
      sync_mixed_carton_line_items_on_change.call(this)
    });

    $('input[name="qty_cartons"].input_change').change(function (e) {
      sync_total_pcs_with_ctn_qty_on_change.call(this)
    });

    $('input[name="pcs_per_carton"].input_change').change(function (e) {
      sync_total_pcs_with_pcs_per_ctn_on_change.call(this)
    });

    $('input[name="landed_cost_per_pc_EUR"].input_change').change(function (e) {
      sync_landed_cost_per_pc_EUR_with_total_on_change.call(this)
    });

    $('input[name="purchase_price_per_pc"].input_change').change(function (e) {
      sync_purchase_price_per_pc_with_total_on_change.call(this)
    });

    $('input[name="c_weight"].input_change').change(function (e) {
      sync_total_weight_with_c_weight_on_change.call(this)
    });

    $('input[name="c_length"].input_change, input[name="c_width"].input_change, input[name="c_height"].input_change, input[name="qty_cartons"].input_change').change(function (e) {
      sync_total_volume_with_c_length_c_weight_c_height_on_change.call(this)
    });


    $('div[data-carton_type="mixed_carton"] > div > input').keyup(function (e) {
      sync_mixed_carton_line_items_on_change.call(this)
    });

    $('input[name="qty_cartons"].input_change').keyup(function (e) {
      sync_total_pcs_with_ctn_qty_on_change.call(this)
    });

    $('input[name="pcs_per_carton"].input_change').keyup(function (e) {
      sync_total_pcs_with_pcs_per_ctn_on_change.call(this)
    });

    $('input[name="landed_cost_per_pc_EUR"].input_change').keyup(function (e) {
      sync_landed_cost_per_pc_EUR_with_total_on_change.call(this)
    });

    $('input[name="purchase_price_per_pc"].input_change').keyup(function (e) {
      sync_purchase_price_per_pc_with_total_on_change.call(this)
    });

    $('input[name="c_weight"].input_change').keyup(function (e) {
      sync_total_weight_with_c_weight_on_change.call(this)
    });

    $('input[name="c_length"].input_change, input[name="c_width"].input_change, input[name="c_height"].input_change, input[name="qty_cartons"].input_change').keyup(function (e) {
      sync_total_volume_with_c_length_c_weight_c_height_on_change.call(this)
    });
}


function generate_array_filtered_from_duplicate_mc_ids(){
  var fitered_rows = [];
  var fitered_ids = [];

  var dt = $('#dt_purchase_order_line_items').DataTable()

  $.each(dt.rows().data(), function(i, el){
      if($.inArray(el["obj_id"], fitered_ids) === -1){
        fitered_rows.push(el);
        fitered_ids.push(el["obj_id"]);
      }
  });
  return fitered_rows
}


function get_dt_purchase_order_line_items_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis no_export", width: "5%"},
    {"data": "order_name", "name": "order_name", className: "order_name noVis",}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
    {"data": "pcs_total", "name": "pcs_total", className: "pcs_total dt-center "},
    {"data": "pcs_per_carton", "name": "pcs_per_carton", className: "pcs_per_carton dt-center editable_int_cell"},
    {"data": "qty_cartons", "name": "qty_cartons", className: "qty_cartons dt-center editable_int_cell"},
    {"data": "c_length", "name": "c_length", className: "c_length dt-center editable_int_cell"},
    {"data": "c_width", "name": "c_width", className: "c_width dt-center editable_int_cell"},
    {"data": "c_height", "name": "c_height", className: "c_height dt-center editable_int_cell"},
    {"data": "net_weight_kg", "name": "net_weight_kg", className: "net_weight_kg dt-center editable_int_cell"},
    {"data": "c_weight", "name": "c_weight", className: "c_weight dt-center editable_int_cell"},

    { "name": "t_volume", className: "t_volume dt-center"},
    { "name": "t_weight", className: "t_weight dt-center"},

    {"data": "purchase_price_per_pc", "name": "purchase_price_per_pc", className: "purchase_price_per_pc dt-center editable_int_cell"},
    {"data": "purchase_price_total", "name": "purchase_price_total", className: "purchase_price_total dt-center"},
    {
      "data": "landed_cost_per_pc_EUR",
      "name": "landed_cost_per_pc_EUR",
      className: "landed_cost_per_pc_EUR dt-center editable_int_cell"
    },
    {"data": "landed_cost_total_EUR", "name": "landed_cost_total_EUR", className: "landed_cost_total_EUR dt-center"},
    {"data": "expiration_date", "name": "expiration_date", className: "expiration_date"},
    {"data": "hs_code", "name": "hs_code", className: "hs_code"},
    {"data": "toll_rate", "name": "toll_rate", className: "toll_rate"},
    {"data": "square_meters", "name": "square_meters", className: "square_meters"},

    {"data": "cartons_left", "name": "cartons_left", className: "cartons_left dt-center"},
    {"data": "pcs_left", "name": "pcs_left", className: "pcs_left dt-center "},
    {"data": "remaining_prc", "name": "remaining_prc", className: "remaining_prc no_export"},
    {"data": "carton_note", "name": "carton_note", className: "carton_note"},
    {"data": "main_ordering", "name": "main_ordering", className: "main_ordering noVis no_export"},
    {"data": "mcli_id", "name": "mcli_id", className: "mcli_id noVis no_export"},
    {"data": "qty_cartons_for_col_sum", "name": "qty_cartons_for_col_sum", className: "qty_cartons_for_col_sum noVis no_export"},
    {"data": "carton_type", "name": "carton_type", className: "carton_type noVis no_export"},
    {className: "action noVis text-center no_export", width: "10px"},
  ]);

  if(is_loose_stock_to_carton_conversion === "True"){
      columns.splice(15, 0,
        {"data": "remaining_loose_stock_pcs", "name": "remaining_loose_stock_pcs", className: "remaining_loose_stock_pcs dt-center "},
              {"data": "loose_stock_source", "name": "loose_stock_source", className: "loose_stock_source dt-center "}
      );
  }

  return columns
}

function initialize_dt_purchase_order_line_items (){
  if (display_type !== "standard"){
    display_type_dependant_invis_columns = ["remaining_prc"]
  } else {
    display_type_dependant_invis_columns = []
  }

  var columns = get_dt_purchase_order_line_items_columns();
  get_ci_poli = create_column_map(columns);

  dt_purchase_order_line_items_invisible_columns_def.splice(9,1)

  config_dict_dt_purchase_order_line_items = {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "purchase_order_id" : purchase_order_id,
        "action": "get_purchase_order_items",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },
    },

    "columnDefs": [
      {
        "targets": dt_purchase_order_line_items_invisible_columns_def,
        "visible": false,
      },
      {
        "targets": display_type_dependant_invis_columns,
        "visible": false,
      },
      {
         "targets": [
            "p_size",
           "main_ordering",
           "mcli_id",
           "qty_cartons_for_col_sum",
            "pcs_left",
            "cartons_left",
           "carton_type",
           "hs_code",
           "toll_rate",
           "square_meters",
           "t_volume",
           "t_weight",
           "order_name",
           "purchase_price_total",
           "landed_cost_total_EUR"
        ],
        "visible": false,
      },
      {
        "targets": [
            "amz_title",
            "net_weight_kg"
        ],
        "visible": false,
      },
      {
        "targets": "obj_id",
        "data": "obj_id",
        "width": "10px",
        "orderable":false,
        "render": function ( data, type, row ) {
          return ``
        },
      },
      {
        "targets": "sku",
        "data": "sku",
        "width": "200px",
        "render": function ( data, type, row ) {
            if(row["dimensions_error"] === true && row["carton_type"]!=="loose_stock"){
                var data_with_error_msg = `<span class="px-1 d-flex align-items-center">
                                ${data}
                                <i  class="ml-2 fas fa-exclamation-triangle text-danger error_popup"
                                    cursor: pointer"
                                    data-error_msg="${gettext("Product dimensions are larger than carton dimensions.<br>The cartons is likely to small or the provided dimensions wrong.")}"
                                    >
                                </i>
                             </span>`
                return data_with_error_msg
            }
          return data
        },
      },
      {
        "targets": "loose_stock_source",
        "render": function ( data, type, row ) {
          var div_c = $('<div class="row " style="white-space: nowrap"></div>');

          var div_sf_loose_stock = $(`<div class="col-5 "></div>`)
          $(div_sf_loose_stock).append(`<span class="row text-center d-flex justify-content-center"  data-toggle="tooltip" title="${gettext("Pcs. sourced from loose stock")}">${row["pcs_sourced_from_loose_stock"]}</span>`)
          if (row["pcs_sourced_from_loose_stock_negative"] > 0) {
            $(div_sf_loose_stock).append(`<span class="row d-flex justify-content-center text-danger "  data-toggle="tooltip"
                                               title="${gettext("This amount is missing. If you confirm this conversion, this will likely lead to a negative loose stock balance")}">
                                               (-${row["pcs_sourced_from_loose_stock_negative"]})
                                               </span>`)
          }

          $(div_c).append(div_sf_loose_stock)

          if (row["pcs_sourced_from_bundles"] > 0 || row['pcs_sourced_from_bundles_in_bundles']) {
            var div_sf_bundle_components = $(`<div class="col-5 d-flex align-items-center justify-content-start border-left-light"></div>`)

            $(div_sf_bundle_components).append(`<span class="" title="${gettext("Pcs. sourced from bundles")}" data-toggle="tooltip">${row["pcs_sourced_from_bundles"]+row["pcs_sourced_from_bundles_in_bundles"]}</span>`)

               var bundle_parent_badge = $(`<div 
                                        class="badge badge-info ml-1 p-1" 
                                        data-toggle="tooltip" 
                                        data-html="true">BC<i class="fas fa-sitemap ml-1"></i></div>`)

            var bc_tt_title = gettext('Sourced from following bundle components:')
            row["sourced_from_bundles_sku_name_qty_list"].forEach(function (arrayItem) {
                bc_tt_title = bc_tt_title +`<br> - ${arrayItem["sourced_qty"]}x ${arrayItem["child_sku_obj__sku"]}`;
            });

            if (row['pcs_sourced_from_bundles_in_bundles'] > 0) {
              bc_tt_title = bc_tt_title + `<br><br>${gettext('Sourced incl. bundles within bundles')}:`;
              for (const [child_sku_obj_id, sourcing_plan] of Object.entries(row['bundles_in_bundles_sourcing_plan'])) {
                if (sourcing_plan['pcs_sourced_from_loose_stock'] > 0) {
                  bc_tt_title = bc_tt_title + `<br> - ${sourcing_plan['pcs_sourced_from_loose_stock']}x ${sourcing_plan['sku_obj__sku']}`;
                }
                sourcing_plan["sourced_from_bundles_sku_name_qty_list"].forEach(function (arrayItem) {
                  bc_tt_title = bc_tt_title + `<br> - ${arrayItem["sourced_qty"]}x ${arrayItem["child_sku_obj__sku"]}`;
                });
              }
            }

            $(bundle_parent_badge).attr("title", bc_tt_title);
            $(div_sf_bundle_components).append(bundle_parent_badge);

            $(div_c).append(div_sf_bundle_components)
          }
          return div_c.prop('outerHTML');
        },
      },

      {
        "targets": "expiration_date",
        "data": "expiration_date",
        "render": function (data, type, row) {
          if (type === "display"){
            var name = "expiration_date";
            var id = row["obj_id"] + "-" + row["carton_type"] + "-" + name;
            var value = data;
            return get_date_picker_input_html(id, name, value)
          } else if (type === "export" && data === null){
            return ""
          }
          else {
            return data
          }
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
                        width="35px" 
                        height="35px"
                        >
                    </div>`
        },
      },

      {
        "targets": "remaining_prc",
        "data": "remaining_prc",
        "orderable":false,
        "createdCell":  function (td, cellData, rowData, row, col) {
          $(td).attr('data-toggle', `tooltip`);
          $(td).attr('title', `${rowData["remaining_prc"]} % | ${rowData["cartons_left"]} ${gettext("ctns.")} | ${rowData["pcs_left"]} ${gettext("pcs. remaining")}`);
        },
        "render": function ( data, type, row ) {
          return `<div class="progress" >
                    <div class="progress-bar" role="progressbar" style="width: ${row["remaining_prc"]}%;" aria-valuenow="${row["remaining_prc"]}" aria-valuemin="0" aria-valuemax="100" ></div>
                  </div>`
        },
      },
      {
        "targets": "actions",
        "data": "obj_id",
        "render": function (data, type, row) {
          var div_c = $(`<div class="d-flex align-items-center pl-2"></div>`);
          var div_save_changes_btn = $(`
                        <div 
                            id="${row["obj_id"]}-save_changes_btn"
                            class="badge badge-pill badge-success save_changes_btn save_changes_badge" 
                            data-carton_type="${row["carton_type"]}"
                            data-toggle="tooltip" 
                            title="${gettext("Save row changes")}"
                            style="display: none; " 
                            >
                          <i class="fas fa-save  text-white save_changes_btn" style="display: none"></i>
                        </div>`);

          var div_cancel_changes_btn = $(`
                        <div 
                          id="${row["obj_id"]}-cancel_changes_btn" 
                          class="badge badge-pill badge-danger ml-1 p-2 cancel_changes_btn" 
                          style="display: none" 
                          data-toggle="tooltip" 
                          title="${gettext("Revert row changes")}">
                            <i class="fas fa-undo  text-white cancel_changes_btn" style="display: none"></i>
                        </div>
                        `);

          var div_delete_btn = $(`
                        <div>
                          <i class="fa fa-trash text-danger text-center mr-2 item_delete_btn" 
                          style="cursor:pointer;" 
                          name="remove_from_selection" 
                          data-obj_id="${data}" 
                        </div>
                        `);


          if (row["carton_type"] === "plain_carton") {
            $(div_delete_btn).find("i").attr("onclick", "delete_selected_pcli_from_list.call(this)" );
            $(div_delete_btn).find("i").attr("title", gettext("Remove Plain Carton") );
          }
          else if (row["carton_type"] === "mixed_carton") {
            $(div_save_changes_btn).attr("id", `${row["mcli_id"]}-save_changes_btn` );
            $(div_cancel_changes_btn).attr("id", `${row["mcli_id"]}-cancel_changes_btn` );
            $(div_delete_btn).find("i").attr("onclick", "delete_selected_mcli_from_mc.call(this)" );
            $(div_delete_btn).find("i").attr("title", gettext("Remove mixed carton line item") );
          }
          else if (row["carton_type"] === "loose_stock") {
            $(div_delete_btn).find("i").attr("onclick", "delete_selected_pcli_from_list.call(this)" );
            $(div_delete_btn).find("i").attr("title", gettext("Remove loose stock line item") );
          }

          $(div_c).append(div_delete_btn);
          $(div_c).append(div_cancel_changes_btn);
          $(div_c).append(div_save_changes_btn);
          return $(div_c).prop('outerHTML')
        },
      },
      {
        "targets": "pcs_per_carton",
        "data": "pcs_per_carton",
         "render": function (data, type, row) {
          // if(data == 0){
          //   data = 1
          //   row["pcs_per_carton"] = 1
          // }
          if (type === 'display') {
              var name = "pcs_per_carton";
              var id = row["obj_id"] + "-" + name;
              var value = data;
              var disabled = false;
              if (row["carton_type"] === "loose_stock" || purchase_order_status === "Received"){
                disabled = true
              }
              return get_input_html(id, name, value, "number", additional_spec="", disabled)
          } else {
            return data
          }
        },
      },
      {
        "targets": "purchase_price_per_pc",
        "data": "purchase_price_per_pc",
        "render": function (data, type, row) {
          return render_carton_type_independant_input_and_values(data, type, row, "purchase_price_per_pc")
        },
      },
      {
        "targets": "landed_cost_per_pc_EUR",
        "data": "landed_cost_per_pc_EUR",
        "render": function (data, type, row) {
          return render_carton_type_independant_input_and_values(data, type, row, "landed_cost_per_pc_EUR")
        },
      },
      {
        "data": "landed_cost_total_EUR",
        "targets": "landed_cost_total_EUR",
        "render": function (data, type, row) {
          if (type === "display") {
            try {
              return format_number(data, decimals = 2)
            } catch (e) {
              return "???"
            }
          } else {
            return data
          }
        },
      },

      {
        "targets": "pcs_total",
        "data": "pcs_total",
        "render": function ( data, type, row ) {
          return `<span id="${row["obj_id"]}-pcs_total-value" data-obj_id="${row["obj_id"]}" data-t_field="pcs_total">${data}</span>
                  <i class="fas fa-edit text-secondary" data-obj_id="${row["obj_id"]}" data-t_field="pcs_total" style="visibility: hidden"></i>`
        },
      },
      {
        "targets": "qty_cartons",
        "data": "qty_cartons",
         "createdCell":  function (td, cellData, rowData, row, col) {
          $(td).attr('style', `border-left:1.5px solid #e3e6f0;`);
        },
        "render": function ( data, type, row ) {
          return render_carton_dimensions_input_and_values(data, type, row, "qty_cartons", disabled = (purchase_order_status === "Received"));
        },
      },

      {
        "targets": "c_length",
        "data": "c_length",
         "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td)
        },

        "render": function ( data, type, row ) {
          return render_carton_dimensions_input_and_values(data, type, row, "c_length")
        },
      },

      {
        "targets": "c_width",
        "data": "c_width",
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td)
        },
        "render": function (data, type, row) {
          return render_carton_dimensions_input_and_values(data, type, row, "c_width")
        },
      },
      {
        "targets": "c_height",
        "data": "c_height",
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td)
        },
        "render": function (data, type, row) {
          return render_carton_dimensions_input_and_values(data, type, row, "c_height")
        },
      },

      {
        "targets": "net_weight_kg",
        "data": "net_weight_kg",
        "width":"35px",
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td);
        },
        "render": function (data, type, row) {
          return render_carton_dimensions_input_and_values(data, type, row, "net_weight_kg")
        },
      },

      {
        "targets": "c_weight",
        "data": "c_weight",
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td);
          $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
        },
        "render": function (data, type, row) {
          return render_carton_dimensions_input_and_values(data, type, row, "c_weight")
        },
      },

      {
        "targets": "t_volume",
        "data": null,
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td);
        },
        "render": function (data, type, row) {
            if( data.t_volume){
                return render_carton_total_values(data.t_volume.toFixed(2), row);
            }

            t_volume = (row.c_height * row.c_width * row.c_length * row.qty_cartons/1000000).toFixed(2)
            return render_carton_total_values(t_volume, row)
        },
      },

      {
        "targets": "t_weight",
        "data": null,
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td);
          $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
        },
        "render": function (data, type, row) {
            if( data.t_weight){
                return render_carton_total_values(data.t_weight.toFixed(2), row);
            }
            t_weight = row.c_weight * row.qty_cartons
            return render_carton_total_values(t_weight.toFixed(2), row)
        },
      },

      {
        "targets": "hs_code",
        "data": "hs_code",
        "defaultContent": "",
        "render": function (data, type, row) {
          return data
        },
      },

      {
        "targets": "toll_rate",
        "data": "toll_rate",
        "defaultContent": "",
        "render": function (data, type, row) {
          return data
        },
      },

      {
        "targets": "carton_note",
        "data": "carton_note",
        "defaultContent": "",
        "createdCell": function (td, cellData, rowData, row, col) {
          zero_value_warning(cellData, td);
          $(td).attr('style', `border-right:1.5px solid #e3e6f0;`);
        },
        "render": function (data, type, row) {
            if(row["carton_type"] === "loose_stock"){
                return "";
            }
          return render_carton_text_input_and_values(data, type, row, "carton_note");
        },
      },

    ],

    orderFixed: [
      [get_ci_poli["main_ordering"], 'asc'],
    ],
    rowGroup: {
      dataSrc: "main_ordering",
      startRender: function (rows, group, level) {
        if (level === 0) {
        if (rows.data()[0]["carton_type"] === "plain_carton") {
            return `<i class="fa fa-box mr-2 text-secondary"></i>` + gettext("Plain Cartons")
          }
        else if (rows.data()[0]["carton_type"] === "loose_stock") {
            return `<i class="fa fa-box-open mr-2 text-secondary"></i>` + gettext("Loose Stock")
          }
          else if (rows.data()[0]["carton_type"] === "mixed_carton") {
            if(rows.data()[0]["mcli_id"] === "n.k."){
              class_empty = "empty"
            } else {
              class_empty = ""
            }

            if (display_type === "fba_prep_infinity"){

            capacity_bars = `<span class="ml-auto px-1" ><i class="fas fa-weight-hanging"></i></span>
                               <span class="ml-1 pr-2 " style="min-width: 10rem">
                                <div class="progress" data-toggle="tooltip" title="${rows.data()[0]["est_used_weight"]} kg ${gettext("or")} ${rows.data()[0]["utilization_rate_weight"]} ${gettext("% of maximum carton weight of")} ${rows.data()[0]["max_weight"]}">
                                  <div class="progress-bar" role="progressbar" style="width: ${rows.data()[0]["utilization_rate_weight"]}%;" aria-valuenow="${rows.data()[0]["utilization_rate_weight"]}" aria-valuemin="0" aria-valuemax="100" >${rows.data()[0]["utilization_rate_weight"]} %</div>
                                </div>
                              </span>
                              <span class="pl-4 ml-3 mr-1 border-left-light pr-1" ><i class="fas fa-expand-alt"></i></span>
                              <span class="mr-5" style="min-width: 10rem">
                                <div class="progress" data-toggle="tooltip" title="${rows.data()[0]["est_used_vol"]} cm3 ${gettext("or")} ${rows.data()[0]["utilization_rate_vol"]} ${gettext("% of maximum carton volume of")} ${rows.data()[0]["max_vol"]} cm3">
                                  <div class="progress-bar" role="progressbar" style="width: ${rows.data()[0]["utilization_rate_vol"]}%;" aria-valuenow="${rows.data()[0]["utilization_rate_vol"]}" aria-valuemin="0" aria-valuemax="100" >${rows.data()[0]["utilization_rate_vol"]} %</div>
                                </div>
                              </span>`
            } else{
              capacity_bars = ""
            }

            sum_pcs_in_ctn = calc_sum_of_pcs_in_mixed_carton(rows)
            sum_pcs_total = calc_sum_of_pcs_in_mixed_carton_total(rows)

            return $(`<tr class="mixed_carton_group ${class_empty}"></tr>`)
              .append(`<td colspan="100%" style="    padding: 0.5rem !important;">
                          <div class="d-flex align-items-center">
                            <span><i class="fas fa-boxes text-secondary ml-2 mr-2"></i></span>
                            <span class="mr-1">${gettext("Mixed Carton")} ID${rows.data()[0]["obj_id"]}</span>
                            <span class="badge badge-pill bg-secondary text-white ml-1 py-2 mr-auto d-flex align-items-center" data-html="true"  data-toggle="tooltip" title="${gettext("Total quantity of pieces")}:<br>${sum_pcs_in_ctn} ${gettext("PCS / Ctn.")} x ${rows.data()[0]["qty_cartons"]} ${gettext("Ctns")}">
                                ${sum_pcs_total} ${gettext("PCS Total")}
                            </span>
                            ${capacity_bars}
                            <span class="badge badge-pill bg-danger ml-1 py-2 d-flex align-items-center item_delete_btn" onclick="delete_selected_mc_from_list.call(this)" style="cursor:pointer;" name="remove_from_selection" data-obj_id="${rows.data()[0]["obj_id"]}" title="${gettext("Remove mixed carton")}">
                                <i class="mx-1 fa fa-trash text-white text-center item_delete_btn" ></i>
                            </span>
                            <span class="badge badge-pill bg-success ml-2 py-2 d-flex align-items-center item_add_button" onclick="open_mixed_carton_modal.call(this, ${rows.data()[0]["obj_id"]})" style="cursor:pointer;" name="remove_from_selection" data-obj_id="${rows.data()[0]["obj_id"]}" title="${gettext("Add SKUs to mixed carton")}">
                                <i class="mx-1 fa fa-plus text-white text-center item_add_button" ></i>
                            </span>
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
            text: `<i class="fas fa-file-invoice mr-1"></i>${gettext("Export Invoice")}`,
            action: function (e, dt, node, config) {
              dt_button_collection_close()
              $('input[name="po_id"]').val(purchase_order_id);
              $('#download_invoice_modal').modal('show')
            },
          },
      {
        text: `<i class="fas fa-edit mr-1"></i>${gettext("Batch Edit")}`,
        action: function ( e, dt, node, config ) {
          var obj_ids_list = create_obj_ids_list_for_pclis_and_mclis(dt)

          $('input[name="obj_ids"]').val(obj_ids_list);
          $('input[name="po_id"]').val(purchase_order_id);
          $('#pcli_bulk_update_modal').modal('show')
        },
      },
      {

        text: `<i class="fas fa-trash mr-1"></i>${gettext("Remove")}`,
        action: function ( e, dt, node, config ) {
          var obj_ids_list = create_obj_ids_list_for_pclis_and_mclis(dt)
          if(obj_ids_list.length < 1){
            alert(gettext("Error. Nothing selected!"));
            return false
            }
          $.ajax({
                method: 'POST',
                url: ajax_call_url,
                data: {
                  "obj_ids_list" : obj_ids_list,
                  "purchase_order_id" : purchase_order_id,
                  'csrfmiddlewaretoken': csrfmiddlewaretoken,
                  "action": "batch_remove_po_line_items",
                },
                success: function () {
                  $("#dt_purchase_order_line_items").DataTable().ajax.reload();
                },
                error: function () {
                  alert(gettext("Error. Something went wrong."))
                }
              });
        },
      },

         {
        extend: `collection`,
        text: `<i class="fas fa-ellipsis-v mr-1"></i>${gettext("Actions")}`,
        buttons: [
          {
            text: `<i class="fas fa-envelope mr-1"></i>${gettext("Export FNSKU Barcodes and Carton Labels for Purchase Order via E-Mail")}`,
            action: function ( e, dt, node, config ) {
              dt_button_collection_close()
              $("#docs_export_modal").modal("toggle")
            }
          },

          {text: '<hr class="p-0 m-0">',},

          {
            text: `<i class="fas fa-box mr-1" title="${gettext("Applicable for plain cartons only")}"></i>
                     <i class="fas fa-arrow-right mr-1"></i><i class="fas fa-database mr-1"></i>
                     ${gettext("Set selected carton dimensions as default (plain cartons only)")}`,
            action: function (e, dt, node, config) {
              dt_button_collection_close()
              var carton_ids = get_carton_ids_list(dt)
              if (carton_ids.length < 1) {
                alert(gettext("Error. Nothing selected!"));
                return false
              }
              $.ajax({
                method: 'POST',
                url: ajax_call_url,
                data: {
                  'csrfmiddlewaretoken': csrfmiddlewaretoken,
                  "action": "update_def_cartons_dimension_from_po_data",
                  "po_id": purchase_order_id,
                  "carton_ids": carton_ids,
                },
                success: function () {
                  $('#dt_purchase_order_line_items').DataTable().ajax.reload();
                  alert(gettext("Successfully set selected carton dimensions as SKU defaults"))
                },
                error: function () {
                  alert(gettext("Error. Something went wrong."))
                }
              });
            }
          },

          {
            text: `<i class="fas fa-dollar-sign mr-1" title="${gettext("Applicable for plain cartons only")}"></i>
                     <i class="fas fa-arrow-right mr-1"></i><i class="fas fa-database mr-1"></i>
                     ${gettext("Set selected purchase prices as default (plain cartons only)")}`,
            action: function (e, dt, node, config) {
              dt_button_collection_close()
              var carton_ids = get_carton_ids_list(dt)
              if (carton_ids.length < 1) {
                alert(gettext("Error. Nothing selected!"));
                return false
              }
              $.ajax({
                method: 'POST',
                url: ajax_call_url,
                data: {
                  'csrfmiddlewaretoken': csrfmiddlewaretoken,
                  "action": "update_def_purchase_prices_from_po_data",
                  "po_id": purchase_order_id,
                  "carton_ids": carton_ids,
                },
                success: function () {
                  $('#dt_purchase_order_line_items').DataTable().ajax.reload();
                  alert(gettext("Successfully set selected purchase prices as SKU defaults"))
                },
                error: function () {
                  alert(gettext("Error. Something went wrong."))
                }
              });
            }
          },

          {
            text: `<i class="fas fa-dollar-sign mr-1" title="${gettext("Applicable for plain cartons only")}"></i>
                     <i class="fas fa-arrow-right mr-1"></i><i class="fas fa-database mr-1"></i>
                     ${gettext("Set selected landed cost as default (plain cartons only)")}`,
            action: function (e, dt, node, config) {
              dt_button_collection_close()
              var carton_ids = get_carton_ids_list(dt)
              if (carton_ids.length < 1) {
                alert(gettext("Error. Nothing selected!"));
                return false
              }
              $.ajax({
                method: 'POST',
                url: ajax_call_url,
                data: {
                  'csrfmiddlewaretoken': csrfmiddlewaretoken,
                  "action": "update_def_landed_cost_from_po_data",
                  "po_id": purchase_order_id,
                  "carton_ids": carton_ids,
                },
                success: function () {
                  $('#dt_purchase_order_line_items').DataTable().ajax.reload();
                  alert(gettext("Successfully set selected landed cost as SKU defaults"))
                },
                error: function () {
                  alert(gettext("Error. Something went wrong."))
                }
              });
            }
          },

          {   text: `<i class="fas fa-columns mr-1"></i>
                     <i class="fas fa-arrow-right mr-1"></i><i class="fas fa-database mr-1"></i>
                     ${gettext("Save current columns as default")}`,
            action: function ( e, dt, node, config ) {
              dt_button_collection_close();
              save_invisible_columns_as_default_to_db(get_ci_poli, "dt_purchase_order_line_items")
            }},


        ]},
    ],

    "createdRow": function (row, data, index) {


      if (data["cartons_left"] < 0 ) {
        $(row).addClass("table-danger")
      }
    },

    drawCallback: function (dt) {
      var api = this.api();
      update_footer(api.table())

      $('td.editable_int_cell').on('mouseenter', function () {
        $(this).find('i').attr('style', 'visibility: visible; cursor: pointer;');
      });

      $('td.editable_int_cell').on('mouseleave', function () {
        $(this).find('i').attr('style', 'visibility: hidden');
      });
      $('[data-toggle="tooltip"]').tooltip();

    $(".error_popup").on('mouseover', function () {
      open_error_msg_popover.call(this)
    })

    $(".error_popup").on('click', function () {
      $(this).unbind("mouseover")
      $(this).unbind("mouseleave")
      open_error_msg_popover.call(this, true)
    })

    }
  };

  config_dict_dt_purchase_order_line_items["columns"] = columns;
  $.extend(config_dict_dt_purchase_order_line_items, def_dt_settings_for_scroller);
  add_po_editing_functionalities_if_not_fixed_yet(5);
  add_send_everything_to_FBA_button(5);
  add_move_to_different_purchase_order_button(5);
  config_dict_dt_purchase_order_line_items["scrollY"] = "75vh";
  if(purchase_order_status == "Received"){
    config_dict_dt_purchase_order_line_items["buttons"].splice(-3, 2)
  }
  $('#dt_purchase_order_line_items').DataTable(config_dict_dt_purchase_order_line_items);
}



function calculate_cbm_sum(rows, dt) {
  var sum_cbm = 0;
  mc_ids_calculated = []

    dt.rows({page : 'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
        var mc_id = $(dt.cell(this, "qty_cartons:name").node()).children(':first-child').attr("data-mc_id")

        if(mc_id == undefined || !mc_ids_calculated.includes(mc_id)){
            var qty_cartons = $(dt.cell(this, "qty_cartons:name").node()).find("input").val();
            var c_length = $(dt.cell(this, "c_length:name").node()).find("input").val();
            var c_width = $(dt.cell(this, "c_width:name").node()).find("input").val();
            var c_height = $(dt.cell(this, "c_height:name").node()).find("input").val();
            sum_cbm = sum_cbm + c_length * c_width * c_height * qty_cartons  / 1000000

            if(mc_id != undefined ){
                mc_ids_calculated.push(mc_id)
            }
        }

    });
  return Math.round(sum_cbm*100)/100
}

function calculate_weight_sum(rows, dt) {
  var sum_weight = 0;
  mc_ids_calculated = []

    dt.rows({page : 'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
        var mc_id = $(dt.cell(this, "qty_cartons:name").node()).children(':first-child').attr("data-mc_id")
        if(mc_id == undefined || !mc_ids_calculated.includes(mc_id)){

            var qty_cartons = $(dt.cell(this, "qty_cartons:name").node()).find("input").val();
            var c_weight = $(dt.cell(this, "c_weight:name").node()).find("input").val();
            sum_weight = sum_weight + c_weight * qty_cartons

            if(mc_id != undefined ){
                mc_ids_calculated.push(mc_id)
            }
        }


    });
  return Math.round(sum_weight)
}

function calculate_ctns_sum(rows, dt) {
  var sum_ctns = 0;

  mc_ids_calculated = []

    dt.rows({page : 'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {
        var mc_id = $(dt.cell(this, "qty_cartons:name").node()).children(':first-child').attr("data-mc_id")

            if(mc_id == undefined || !mc_ids_calculated.includes(mc_id)){

            var qty_cartons = $(dt.cell(this, "qty_cartons:name").node()).find("input").val();
            sum_ctns = sum_ctns + parseInt(qty_cartons)

            if(mc_id != undefined ){
                mc_ids_calculated.push(mc_id)
            }
        }

    });
  return Math.round(sum_ctns)
}

function calculate_purchase_price_sum(rows) {
  var sum_pp = 0;

  rows.data().each(function (r) {
    sum_pp = sum_pp + r["purchase_price_per_pc"] * r["pcs_total"]
  });
  return Math.round(sum_pp*100)/100
}


function create_obj_ids_list_for_pclis_and_mclis(dt) {
  return $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    if (["plain_carton", "loose_stock"].includes(dt.cell(row_indexes, "carton_type:name").data())) {
      return dt.cell(row_indexes, "obj_id:name").data() + "." + dt.cell(row_indexes, "carton_type:name").data()
    } else if (dt.cell(row_indexes, "carton_type:name").data() === "mixed_carton") {
      return dt.cell(row_indexes, "mcli_id:name").data() + "." + dt.cell(row_indexes, "carton_type:name").data()
    }
  })
}

function get_carton_ids_list(dt) {
  ids = []
  $.map(dt.rows('.selected').indexes(), function (row_indexes) {
      ids.push(dt.row(row_indexes).data().obj_id)
  })
  return ids
}

function add_po_editing_functionalities_if_not_fixed_yet(button_pos) {
  // if (purchase_order_status !== "Received"){
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push({text: '<hr class="p-0 m-0">',})
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push(
    {   text: `<i class="fas fa-boxes mr-1"></i>${gettext("Create new mixed carton from selected line items")}`,
          action: function ( e, dt, node, config ) {
            create_new_mc_from_selected_lis(dt)
            dt_button_collection_close()
          }})
  // }

}

function add_send_everything_to_FBA_button(button_pos) {
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push({text: '<hr class="p-0 m-0">',})
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push(
          {   text: `<i class="fas fa-dolly mr-1"></i>
                     ${gettext("Send remaining purchase order to Amazon FBA")}`,
            action: function ( e, dt, node, config ) {
              dt_button_collection_close();
              window.location = create_fba_send_in_from_purchase_order_url;
            }});
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push(
          {   text: `<i class="fas fa-dolly mr-1"></i>
                     ${gettext("Send selected remaining items to Amazon FBA")}`,
            action: function ( e, dt, node, config ) {
              dt_button_collection_close();
              create_fba_send_in_from_remaining_selected_lis(dt)
            }});

}

function add_move_to_different_purchase_order_button(button_pos) {
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push({text: '<hr class="p-0 m-0">',})
  config_dict_dt_purchase_order_line_items["buttons"][button_pos]["buttons"].push(
    {
      text: `<i class="fas fa-arrow-right mr-1"></i><i class="fas fa-ship mr-1"></i> ${gettext("Move Selected to different Purchase Order")}`,
      action: function (e, dt, node, config) {
        var obj_ids_list = create_obj_ids_list_for_pclis_and_mclis(dt)
        if (obj_ids_list.length < 1) {
          alert(gettext("Error. Nothing selected!"));
          return false
        }
        $("#move_selected_to_po_modal").attr("data-obj_ids_list", obj_ids_list)
        $("#move_selected_to_po_modal").modal("show");
      },
    },);

  return config_dict_dt_purchase_order_line_items
}

function create_fba_send_in_from_remaining_selected_lis(dt) {
  var obj_ids_list = create_obj_ids_list_for_pclis_and_mclis(dt);

  // if(check_if_loose_stock_in_id_list(obj_ids_list)){
  //   alert(gettext("Loose Stock items will not be added. They need to be packed into cartons first."))
  //   return
  // }

  if (obj_ids_list.length === 0) {
    alert(gettext("Nothing selected!"))
  } else {
    $.ajax({
      method: 'POST',
      url: ajax_batch_update_values_url,
      data: {
        'action': "create_fba_send_in_from_remaining_selected_lis",
        'csrfmiddlewaretoken': csrfmiddlewaretoken,
        'obj_ids_list': JSON.stringify(obj_ids_list),
        'purchase_order_id': purchase_order_id,
      },
      success: function (data) {
        window.location = data["data"]["redirect_url"]
      },
      error: function () {
        alert(gettext("Error. Something went wrong."))
      }
    })
  }
}

function check_if_loose_stock_in_id_list(obj_ids_list) {
  obj_ids_list.forEach(function (entry) {
    if(entry.includes("loose_stock")){
      return true
    }
  });
  return false
}

function create_new_mc_from_selected_lis(dt) {
  var obj_ids_list = create_obj_ids_list_for_pclis_and_mclis(dt)
  $.ajax({
    method: 'POST',
    url: ajax_batch_update_values_url,
    data: {
      'action': "create_new_mc_from_selected_lis",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
      'purchase_order_id': purchase_order_id,
    },
    success: function () {
      $("#dt_purchase_order_line_items").DataTable().ajax.reload();
    },
    error: function () {
      $("#dt_purchase_order_line_items").DataTable().ajax.reload();
      alert(gettext("Error. Some line item could not be merged into a mixed carton"))
    }
  })
}

function calc_sum_of_pcs_in_mixed_carton(rows) {
    var sum_pcs_in_ctn = rows.data().pluck("pcs_per_carton").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);
    return sum_pcs_in_ctn
}

function calc_sum_of_pcs_in_mixed_carton_total(rows) {
    var sum_pcs_total = rows.data().pluck("pcs_total").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);
    return sum_pcs_total
}


function get_dt_add_skus_manually_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis", width: "5%"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [{name: "actions", className: "actions noVis text-center"}]);

  return columns
}

function get_config_dt_add_skus_manually(mc_id=null, category="", dt_id) {
  columns = get_dt_add_skus_manually_columns();
  get_ci_am = create_column_map(columns);

  var dt_add_skus_manually_config =  {
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
    data.purchase_order_id = purchase_order_id;
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

  orderFixed: [
    [get_ci_am["cat_product_type"], 'asc'],
    [get_ci_am["cat_size"], 'asc'],
  ],
  "columnDefs": [
    {
      "targets": [
        "obj_id",
        "actions",
      ],
      "orderable": false,
      "searchable": false,
    },
    {
      "targets": "obj_id",
      "data": "obj_id",
      "searchable":false,
      "orderable":false,
      "render": function ( data, type, row ) {
        return ``
      },
    },
    {
      "targets": -1,
      "data": "obj_id",
      "render": function ( data, type, row ) {
        if (row["in_purchase_order_pclis"]) {
          return `
          <div class="add_buttons d-flex justify-content-center">
            ${get_after_added_to_selection_button_html("add_selected_sku_to_po.call(this)", "delete_selected_pcli_from_list_by_SKU_id.call(this)", data)}
           </div>
          `
        } else {
          return `
          <div class="add_buttons d-flex justify-content-center">
            ${get_add_to_selection_button_html(`add_selected_sku_to_po.call(this)`, data)}
           </div>
          `
        }
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
      "targets": [
        "cat_product_type",
        "cat_color",
        "cat_size",
        "p_shape",
        "amz_title",
        "Parent_ASIN",
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
    },
    {
        text: `<i class="fas fa-plus-circle"></i> ${gettext("Add selected")}`,
        action: function ( e, dt, node, config ) {
            var sku_ids = get_carton_ids_list(dt)
            if(sku_ids.length < 1){
                alert(gettext("Error. Nothing selected!"));
                return false
            }
            var item_type = $('#add_skus_manually_modal').data('item_type');
            $.ajax({
                method:'POST',
                url:ajax_call_url,
                data_type: "json",
                data: {
                  "sku_ids" : sku_ids,
                  "purchase_order_id" : purchase_order_id,
                  "item_type":item_type,
                  "action": "add_selected_skus_as_plain_carton_line_items",
                  "csrfmiddlewaretoken": csrfmiddlewaretoken,
                },
                success:function(){
                 $('#add_skus_manually_modal').modal('hide');
                    $("#dt_purchase_order_line_items").DataTable().ajax.reload();
                },
                error:function(){
                  alert(gettext("Error. Carton could not be added."))
                }
              })
        },
    },
  ],

  rowGroup: {
    dataSrc: "cat_product_type"
  },
  scrollY:        '60vh',
  };

  dt_add_skus_manually_config["columns"] = columns;
  $.extend(dt_add_skus_manually_config, def_dt_settings);
  dt_add_skus_manually_config["info"] = true;
  dt_add_skus_manually_config["bPaginate"] = true;
  return dt_add_skus_manually_config

}



function initialize_dt_add_skus_manually(dt_id="#dt_add_skus_manually", category=""){
  $(dt_id).DataTable(get_config_dt_add_skus_manually(mc_id=null, category, dt_id));
}

function initialize_dt_add_skus_manually_to_mixed_carton(mc_id, dt_id="#dt_add_skus_manually_to_mixed_carton", category=""){
  config_dt_add_skus_manually = get_config_dt_add_skus_manually(mc_id, category, dt_id);
  config_dt_add_skus_manually["destroy"] = true;
  config_dt_add_skus_manually["buttons"].pop();
  config_dt_add_skus_manually["columnDefs"] = [
        {
      "targets": [
        "ASIN",
        "amz_title",
      ],
      "visible": true,
    },
        {
      "targets": -1,
      "data": "obj_id",
      "searchable":false,
      "orderable":false,
      "render": function ( data, type, row ) {
        if (row["in_mc_mclis"]) {
          return `
          <div class="add_buttons d-flex justify-content-center">
             ${get_remove_from_selection_button_html(`delete_selected_mcli_from_mc_by_sku.call(this, ${mc_id})`, data)}
           </div>
          `
        } else {
          return `
          <div class="add_buttons d-flex justify-content-center">
            ${get_add_to_selection_button_html(`add_selected_sku_to_mixed_carton.call(this)`, mc_id)}
           </div>
          `
        }
      },
    },
    {
      "targets": "obj_id",
      "data": "obj_id",
      "searchable":false,
      "orderable":false,
      "render": function ( data, type, row ) {
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
      "targets": [
        "cat_product_type",
        "cat_color",
        "cat_size",
        "p_shape",
        "amz_title",
        "Parent_ASIN",
      ],
      "visible": false,
    }
  ]
  $(dt_id).DataTable(config_dt_add_skus_manually);
}

// function reinitialize_dt_add_skus_manually_to_mixed_carton_if_neccessary(mc_id) {
//   if (!$.fn.DataTable.isDataTable('#dt_add_skus_manually_to_mixed_carton')) {
//     initialize_dt_add_skus_manually_to_mixed_carton(mc_id)
//   } else {
//     var table = $("#dt_add_skus_manually_to_mixed_carton");
//     table.DataTable().destroy()
//     initialize_dt_add_skus_manually_to_mixed_carton(mc_id)
//   }
// }

function change_po_status() {
  var po_id = $(this).data('po_id');
  var status = $(this).data('status');
  var url = '/change_status_purchase_order/';
  var redirect_url = redirect_purchase_order_in_url;
  $('span[name="change_po_status"]').unbind("click");
  data = {
    "po_id": po_id,
    "status": status,
  };
  updatePOST(url, data, headers = {}, redirect_url, refresh_var = false)
}


function delete_selected_pcli_from_list() {
  var obj_id = $(this).data('obj_id')
  var table_id = $(this).closest("table").attr("id")

  $(this).closest("span").html(`<div class="spinner-border spinner-border-sm text-danger" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "plain_carton_line_item_id" : obj_id,
      "action": "delete_plain_carton_line_item",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      if (table_id.length > 0){
        $("#"+table_id).DataTable().ajax.reload();
      }
    }
  })
}


function delete_selected_pcli_from_list_by_SKU_id() {
  var sku_id = $(this).data('obj_id')
  var table_id = $(this).closest("table").attr("id")

  $(this).closest("div.add_buttons").html(get_add_to_selection_button_html(`add_selected_sku_to_po.call(this)`, sku_id))
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "sku_id" : sku_id,
      "purchase_order_id" : purchase_order_id,
      "action": "delete_plain_carton_line_item_by_SKU_id",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
    },
    error:function(){
      alert(gettext("Error. SKU was not deleted from selection."))
    }
  })
}

function delete_selected_mc_from_list() {
  var obj_id = $(this).data('obj_id')

  $(this).html(`<div class="spinner-border spinner-border-sm text-white" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "mc_id" : obj_id,
      "action": "delete_mixed_carton",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $("#dt_purchase_order_line_items").DataTable().ajax.reload();
    },
    error:function(error_msg){
      alert(error_msg)
    },
  })
}

function delete_selected_mcli_from_mc() {
  var current_td_node = $(this).closest("td")
    $(this).closest("span").html(`<div class="spinner-border spinner-border-sm text-danger" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`)

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "mcli_id" : get_field_data_from_current_dt_row("mcli_id", current_td_node),
      "action": "delete_selected_mcli_from_mc",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      $("#dt_purchase_order_line_items").DataTable().ajax.reload();
    },
    error:function(error_msg){
      alert(gettext("Error. Line item could not be deleted"), error_msg)
    },
  })
}

function delete_selected_mcli_from_mc_by_sku(mc_id) {
  var current_td_node = $(this).closest("td")
  $(this).closest("div.add_buttons").html(get_add_to_selection_button_html(`add_selected_sku_to_mixed_carton.call(this)`, mc_id))
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "sku_id" : get_field_data_from_current_dt_row("obj_id", current_td_node),
      "mc_id" : mc_id,
      "action": "delete_selected_mcli_from_mc_by_sku",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
    },
    error:function(error_msg){
      alert(gettext("Error. Line item could not be deleted"), error_msg)
    },
  })
}


function sync_mixed_carton_line_items_on_change(){
  var mc_id = $(this).parent("div").parent("div").attr("data-mc_id");
  var name = $(this).attr("name");
  var value = $(this).val();

  $(`*[data-mc_id="${mc_id}"] *[name="${name}"]`).val(value);

  if (name === "qty_cartons"){
    var mclis = $(`*[data-mc_id="${mc_id}"] *[name="${name}"]`);
    mclis.each(function () {
      sync_total_pcs_with_ctn_qty_on_change.call(this)
    });
  }
}


function sync_total_pcs_with_ctn_qty_on_change() {
  var carton_qty = $(this).val();
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable();
  var current_row = dt.cell(td_node).index()["row"];

  var pcs_in_carton = $(dt.cell(current_row, "pcs_per_carton:name").node()).find("input").val();
  var landed_cost_per_pc_EUR = $(dt.cell(current_row, "landed_cost_per_pc_EUR:name").node()).find("input").val();
  var purchase_price_per_pc = $(dt.cell(current_row, "purchase_price_per_pc:name").node()).find("input").val();
  var pcs_total = carton_qty * pcs_in_carton;
  var landed_cost_total_EUR = pcs_total * landed_cost_per_pc_EUR;
  var purchase_price_total = pcs_total * purchase_price_per_pc;
  dt.cell(current_row, "pcs_total:name").data(pcs_total);
  dt.cell(current_row, "landed_cost_total_EUR:name").data(landed_cost_total_EUR.toFixed(2));
  dt.cell(current_row, "purchase_price_total:name").data(purchase_price_total.toFixed(4));

  // Sync total weight with carton_qty
  var c_weight = $(dt.cell(current_row, "c_weight:name").node()).find("input").val();
  var t_weight = carton_qty * c_weight;
  var row_data = dt.cell(current_row, "t_weight:name").data()
  row_data.t_weight = t_weight;
  dt.cell(current_row, "t_weight:name").data(row_data);
  update_footer(dt)
}

function sync_total_weight_with_c_weight_on_change() {
  var c_weight = $(this).val();
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable();
  var current_row = dt.cell(td_node).index()["row"];

  var carton_qty = $(dt.cell(current_row, "qty_cartons:name").node()).find("input").val();
  var t_weight = carton_qty * c_weight;
  var row_data = dt.cell(current_row, "t_weight:name").data()
  row_data.t_weight = t_weight;
  dt.cell(current_row, "t_weight:name").data(row_data);

  update_footer(dt)

}

function sync_total_volume_with_c_length_c_weight_c_height_on_change() {
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable();
  var current_row = dt.cell(td_node).index()["row"];

  var c_length = $(dt.cell(current_row, "c_length:name").node()).find("input").val();
  var c_width = $(dt.cell(current_row, "c_width:name").node()).find("input").val();
  var c_height = $(dt.cell(current_row, "c_height:name").node()).find("input").val();
  var qty_cartons = $(dt.cell(current_row, "qty_cartons:name").node()).find("input").val();


  var t_volume = c_length * c_width * c_height * qty_cartons/1000000;
  var row_data = dt.cell(current_row, "t_volume:name").data()
  row_data.t_volume = t_volume;
  dt.cell(current_row, "t_volume:name").data(row_data);

    update_footer(dt)
}

function sync_total_pcs_with_pcs_per_ctn_on_change(){
    var pcs_in_carton = $(this).val();
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable();
    var current_row = dt.cell( td_node ).index()["row"];

    var carton_qty = $(dt.cell(current_row, "qty_cartons:name").node()).find("input").val();
    var landed_cost_per_pc_EUR = $(dt.cell(current_row, "landed_cost_per_pc_EUR:name").node()).find("input").val();
    var purchase_price_per_pc = $(dt.cell(current_row, "purchase_price_per_pc:name").node()).find("input").val();
    var pcs_total = carton_qty * pcs_in_carton;
    var landed_cost_total_EUR = pcs_total * landed_cost_per_pc_EUR;
    var purchase_price_total = pcs_total * purchase_price_per_pc;
    dt.cell( current_row, "pcs_total:name").data(pcs_total);
    dt.cell(current_row, "landed_cost_total_EUR:name").data(landed_cost_total_EUR.toFixed(2));
    dt.cell(current_row, "purchase_price_total:name").data(purchase_price_total.toFixed(4));

    update_footer(dt)
}

function sync_landed_cost_per_pc_EUR_with_total_on_change(){
    var landed_cost_per_pc_EUR = $(this).val();
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable();
    var current_row = dt.cell( td_node ).index()["row"];

    var carton_qty = $(dt.cell(current_row, "qty_cartons:name").node()).find("input").val();
    var pcs_per_carton = $(dt.cell(current_row, "pcs_per_carton:name").node()).find("input").val();
    var pcs_total = carton_qty * pcs_per_carton;
    var landed_cost_total_EUR = pcs_total * landed_cost_per_pc_EUR;
    dt.cell(current_row, "landed_cost_total_EUR:name").data(landed_cost_total_EUR);

    update_footer(dt)
}

function sync_purchase_price_per_pc_with_total_on_change(){
    var purchase_price_per_pc = $(this).val();
    var td_node = $(this).closest("td");
    var dt = $(this).closest("table").DataTable();
    var current_row = dt.cell( td_node ).index()["row"];

    var carton_qty = $(dt.cell(current_row, "qty_cartons:name").node()).find("input").val();
    var pcs_per_carton = $(dt.cell(current_row, "pcs_per_carton:name").node()).find("input").val();
    var pcs_total = carton_qty * pcs_per_carton;
    var purchase_price_total = pcs_total * purchase_price_per_pc;
    dt.cell(current_row, "purchase_price_total:name").data(purchase_price_total.toFixed(4));

    update_footer(dt)
}

function hide_save_all_navbar_if_no_changes_left() {
  if(($(".save_changes_badge:not(:hidden)").length) === 0) {
    $(".second_topbar_transparent ").attr("style", "display: none");
  }
}


function show_changes_btn() {
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable();
  var current_row = dt.cell(td_node).index()["row"];

  if(dt.cell(current_row, "mcli_id:name").data() === "n.a."){
    var obj_id = dt.cell(current_row, "obj_id:name").data()
  }else{
    var obj_id = dt.cell(current_row, "mcli_id:name").data()
  }
  show_save_changes_btn(obj_id)
  show_cancel_changes_btn(obj_id)
  $(".second_topbar_transparent ").attr("style", "display: block");
}

function show_save_changes_btn(obj_id) {
  save_changes_btn = $(`#${obj_id}-save_changes_btn`)
  save_changes_btn.attr("style", "pointer: cursor; visibility: collapse")
  save_changes_btn.attr("onclick", "save_input_changes.call(this)")
  save_changes_btn.find("i").attr("style", "cursor: pointer")
}

function show_cancel_changes_btn(obj_id) {
  cancel_changes_btn = $(`#${obj_id}-cancel_changes_btn`)
  cancel_changes_btn.attr("style", "pointer: cursor")
  cancel_changes_btn.attr("onclick", "cancel_input_changes.call(this)")
  cancel_changes_btn.find("i").attr("style", "cursor: pointer")
}

function cancel_input_changes() {
    var btn = $(this);
    var td_node = $(this).closest("td");;
    var dt = $(this).closest("table").DataTable();
    var current_row = dt.cell( td_node ).index()["row"];

    var pcs_per_carton = dt.cell( current_row, "pcs_per_carton:name").data();
    var qty_cartons = dt.cell( current_row, "qty_cartons:name").data();
    var c_length = dt.cell( current_row, "c_length:name").data();
    var c_width = dt.cell( current_row, "c_width:name").data();
    var c_height = dt.cell( current_row, "c_height:name").data();
    var c_weight = dt.cell( current_row, "c_weight:name").data();
    var purchase_price_per_pc = dt.cell( current_row, "purchase_price_per_pc:name").data();
    var landed_cost_per_pc_EUR = dt.cell( current_row, "landed_cost_per_pc_EUR:name").data();

    $(dt.cell( current_row, "pcs_per_carton:name").node()).find("input").val(pcs_per_carton);
    $(dt.cell( current_row, "qty_cartons:name").node()).find("input").val(qty_cartons);
    $(dt.cell( current_row, "c_length:name").node()).find("input").val(c_length);
    $(dt.cell( current_row, "c_width:name").node()).find("input").val(c_width);
    $(dt.cell( current_row, "c_height:name").node()).find("input").val(c_height);
    $(dt.cell( current_row, "c_weight:name").node()).find("input").val(c_weight);
    $(dt.cell( current_row, "purchase_price_per_pc:name").node()).find("input").val(purchase_price_per_pc);
    $(dt.cell( current_row, "landed_cost_per_pc_EUR:name").node()).find("input").val(landed_cost_per_pc_EUR);

    td_node.find('.save_changes_btn').attr("style", "display: none");
    td_node.find('.cancel_changes_btn').attr("style", "display: none");
    $(".tooltip").tooltip('hide');

    sync_total_pcs_with_ctn_qty_on_change.call($(dt.cell( current_row, "qty_cartons:name").node()).find("input"));
    sync_total_pcs_with_pcs_per_ctn_on_change.call($(dt.cell( current_row, "pcs_per_carton:name").node()).find("input"));
    sync_landed_cost_per_pc_EUR_with_total_on_change.call($(dt.cell( current_row, "landed_cost_per_pc_EUR:name").node()).find("input"));
    sync_purchase_price_per_pc_with_total_on_change.call($(dt.cell( current_row, "purchase_price_per_pc:name").node()).find("input"));
    hide_save_all_navbar_if_no_changes_left()

}

function save_input_changes() {
    var btn = $(this)
    var td_node = $(this).closest("td")
    var dt = $(this).closest("table").DataTable()
    var current_row = dt.cell( td_node ).index()["row"]
    var carton_type = $(this).data("carton_type")

    var pcs_per_carton = $(dt.cell( current_row, "pcs_per_carton:name").node()).find("input").val();
    var qty_cartons = $(dt.cell( current_row, "qty_cartons:name").node()).find("input").val();
    var c_length = $(dt.cell( current_row, "c_length:name").node()).find("input").val();
    var c_width = $(dt.cell( current_row, "c_width:name").node()).find("input").val();
    var c_height = $(dt.cell( current_row, "c_height:name").node()).find("input").val();
    var c_weight = $(dt.cell( current_row, "c_weight:name").node()).find("input").val();
    var net_weight_kg = $(dt.cell( current_row, "net_weight_kg:name").node()).find("input").val();
    var purchase_price_per_pc = $(dt.cell( current_row, "purchase_price_per_pc:name").node()).find("input").val();
    var landed_cost_per_pc_EUR = $(dt.cell( current_row, "landed_cost_per_pc_EUR:name").node()).find("input").val();
    var expiration_date = $(dt.cell( current_row, "expiration_date:name").node()).find("input").val();
    var carton_note = $(dt.cell( current_row, "carton_note:name").node()).find("input").val();
    var obj_id = dt.cell(current_row, "obj_id:name").data();

    var mcli_id = "";
    if(carton_type === "mixed_carton"){
        var obj_id = dt.cell(current_row, "mcli_id:name").data()
    }else{
        var obj_id = dt.cell( current_row, "obj_id:name").data()
    }

    td_node.find('.cancel_changes_btn').attr("style", "display: none")
    $(this).find("i").attr("style", "display: none")
    $(this).append(`<span id="saving_btn_spinner" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)

    $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
        "obj_id": obj_id,
        "pcs_per_carton": pcs_per_carton,
        "qty_cartons": qty_cartons,
        "c_length": c_length,
        "c_width": c_width,
        "c_height": c_height,
        "c_weight": c_weight,
        "net_weight_kg":net_weight_kg,
        "carton_type": carton_type,
        "landed_cost_per_pc_EUR": landed_cost_per_pc_EUR,
        "expiration_date": expiration_date,
        "purchase_price_per_pc": purchase_price_per_pc,
        "carton_note":carton_note,
        "action": "save_purchase_order_row_changes",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
        btn.find(".spinner-border").remove()
        btn.attr("style", "display: none")
        $(".tooltip").tooltip('hide')
        hide_save_all_navbar_if_no_changes_left()
    },
      error: function (request, status, error) {
        // $('#saving_btn_spinner').remove()
        btn.find(".spinner-border").remove()
        try {
          alert(request.responseJSON["error"]);
        } catch {
          alert(gettext("Error. Changes could not be saved."))
        }
    },
  })

}


function ajax_upload_po_csv_file(){
  upload_button = $('#btn_import_po_csv_file');
  upload_button.prop('disabled', true);
  upload_button.prepend(`<div id="spinner_btn_import_po_csv_file" class="mr-2 spinner-border spinner-border-sm text-white" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`);

  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_import_po_csv_file_url,
    data: data,
    cache: false,
    processData: false,
    contentType: false,
    success: function(data)
    {
      upload_button.prop('disabled', false);
      $("#dt_purchase_order_line_items").DataTable().ajax.reload();
      alert(gettext("CSV file successfully uploaded!"))
      $('#csv_import_export_modal').modal('hide')
      $('#spinner_btn_import_po_csv_file').remove()

    },
    error: function (request, status, error) {
        alert(request.responseJSON["error"]);
        upload_button.prop('disabled', false);
        $("#dt_purchase_order_line_items").DataTable().ajax.reload();
        $('#spinner_btn_import_po_csv_file').remove()
    }
  });
}

$("#form_import_po_csv_file").submit(function(e) {
  e.preventDefault();
  ajax_upload_po_csv_file.call(this)
});


function add_selected_sku_to_po() {
  var obj_id = $(this).data('obj_id');
  var item_type = $('#add_skus_manually_modal').data('item_type');

  $(this).closest("div.add_buttons").html(
    get_after_added_to_selection_button_html("add_selected_sku_to_po.call(this)", "delete_selected_pcli_from_list_by_SKU_id.call(this)", obj_id)
  )

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "sku_id" : obj_id,
      "purchase_order_id" : purchase_order_id,
      "action": "add_purchase_order_plain_carton_line_item",
      "manually_added": "true",
      "item_type": item_type,
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
    },
    error:function(){
      alert(gettext("Error. SKU could not be added to purchase order."))
    },

  })
}

function add_selected_sku_to_mixed_carton() {
  var current_td_node = $(this).closest("td")
  var obj_id = get_field_data_from_current_dt_row("obj_id", current_td_node)
  var mc_id = $('#add_skus_manually_to_mixed_carton_modal').data("mc_id"); //$(this).data('obj_id')

  $(this).closest("div.add_buttons").html(
    get_remove_from_selection_button_html(`delete_selected_mcli_from_mc_by_sku.call(this, ${mc_id})`, obj_id)
  )

  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "sku_id" : obj_id,
      "mc_id" : mc_id,
      "action": "add_sku_to_mixed_carton",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
    },
    error:function(){
      alert(gettext("Error. SKU was not added to mixed carton. This might be because it has been already added before."))
    },

  })
}


function add_mixed_carton_to_po() {
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "purchase_order_id": purchase_order_id,
      "action": "add_mixed_carton_to_po",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      $('#dt_purchase_order_line_items').DataTable().ajax.reload()
    },
    error: function () {
      alert(gettext("Error. New mixed carton could not be created."))
    },
  })

}

function get_field_data_from_current_dt_row(result_field_name, current_td_node) {
  var closest_dt = current_td_node.closest("table").DataTable()
  var current_row = closest_dt.cell(current_td_node).index()["row"]
  result =  closest_dt.cell(current_row, result_field_name +  ":name").data()
  return result
}

function updateDisplay ()  {
  fetch(check_display_url).then(function(response) {
    response.json().then(function(data) {
      processing_status = data.display_type;
      if (processing_status === "fba_prep_loading" || processing_status === "po_loading") {
        setTimeout(updateDisplay, 2000);
      } else if ((processing_status === "fba_prep_infinity" || processing_status === "standard" || processing_status === "failed") && processing_status !== display_type){
        window.location = redirect_purchase_order_in_url
      } else if (processing_status === "standard"){

      }
    });
  });
}

function submit_docs_export_form() {
  var form = $("#docs_export_form");
  var url = form.attr('action');
  $('#btn_docs_export_form_submit').toggleClass("disabled")

  $.ajax({
    type: "POST",
    url: url,
    data: form.serialize(), // serializes the form's elements.
    success: function (data) {
      $('#docs_export_form_success_message_container').html(gettext("E-Mail successfully sent!")+ " <i class='fas fa-check'></i>")
      $('#btn_docs_export_form_submit').toggleClass("disabled")
    },
    error: function (data) {
      alert(gettext("Error. Something went wrong."))
      $('#btn_docs_export_form_submit').toggleClass("disabled")
    }
  });

};


function zero_value_warning(cellData, td) {
  if (cellData === 0) {
    $(td).addClass('table-danger');
    $(td).attr('data-toggle', 'tooltip');
    $(td).attr('title', gettext('Amazon requires a positive integer value for a successful FBA Send-In'));
  }
}

function add_switch_tabs_functionality() {
  $(this).tab('show');
  var dt_id =  $(this).data('dt_id');
  if (dt_id !== "#dt_add_skus_manually" && dt_id !== "#dt_add_skus_manually_to_mixed_carton") {
    if (!$.fn.DataTable.isDataTable(dt_id) || dt_id.includes("mixed_carton")) {
    var category =  $(this).data('category');
      bind_on_table_drawn_events_for_add_skus_manually(dt_id);
      if(dt_id.includes("mixed_carton")){
        var mc_id = $('#add_skus_manually_to_mixed_carton_modal').data("mc_id");
        initialize_dt_add_skus_manually_to_mixed_carton(mc_id, dt_id, category)
      } else {
        initialize_dt_add_skus_manually(dt_id, category)
      }
    } else {
      $(dt_id).DataTable().ajax.reload();
    }
  }
}

function render_carton_dimensions_input_and_values(data, type, row, field_name, disabled=false) {
  if (type === 'display') {
    var value = data;
    var id = row["obj_id"] + "-" + field_name;

    if (row["carton_type"] === "plain_carton" || row["carton_type"] === "loose_stock") {
      return get_input_html(id, field_name, value, "number", additional_spec = "", disabled)
    } else if (row["carton_type"] === "mixed_carton") {
      return get_input_html(id, field_name, value, "number", additional_spec = `" data-carton_type="mixed_carton" data-mc_id=${row["obj_id"]} style="display:none`, disabled)
    }
  }
  else {
    return data
  }
}

function render_carton_text_input_and_values(data, type, row, field_name, disabled=false) {
  if (type === 'display') {
    var value = data;
    var id = row["obj_id"] + "-" + field_name;

    if (row["carton_type"] === "plain_carton" || row["carton_type"] === "loose_stock") {
      return get_input_html(id, field_name, value, "text", additional_spec = "", disabled)
    } else if (row["carton_type"] === "mixed_carton") {
      return get_input_html(id, field_name, value, "text", additional_spec = `" data-carton_type="mixed_carton" data-mc_id=${row["obj_id"]} style="display:none`, disabled)
    }
  }
  else {
    return data
  }
}

function render_carton_type_independant_input_and_values(data, type, row, field_name) {
  if (type === 'display') {
    var id = row["obj_id"] + "-" + field_name;
    return get_input_html(id, field_name, data, "number")
  } else {
    return data
  }
}

function render_carton_total_values(data, row) {
    if (row["carton_type"] === "plain_carton" || row["carton_type"] === "loose_stock") {
       return data
    }else{
        return `<div style='display:none;'> ${data} </div>`
    }
}

function update_footer(dt){
      var api = dt
      var sum_ctns = calculate_ctns_sum(api.column(get_ci_poli["qty_cartons_for_col_sum"], {page : 'current'} ), api.table())
//      var sum_ctns = Math.round(api.column(get_ci_poli["qty_cartons_for_col_sum"], {page : 'current'} ).data().sum());
      var sum_pcs = Math.round(api.table().column(get_ci_poli["pcs_total"], {page : 'current'} ).data().sum());
      var sum_weight = calculate_weight_sum(api.table().rows({page : 'current'}), api.table());
      var sum_cbm = calculate_cbm_sum(api.table().rows({page : 'current'}), api.table());
      var sum_lc_total = Math.round(api.column(get_ci_poli["landed_cost_total_EUR"], {page : 'current'} ).data().sum()*100)/100;
      var sum_pp_total = Math.round(api.column(get_ci_poli["purchase_price_total"], {page : 'current'} ).data().sum()*100)/100;
      // var sum_pp_total = calculate_purchase_price_sum(api.table().rows({page : 'current'}));
      var sum_sqm = Math.round(api.table().column(get_ci_poli["square_meters"], {page : 'current'} ).data().sum());

      $(api.table().column(get_ci_poli["qty_cartons"]).footer()).html(format_number(sum_ctns, 0) + " " + gettext("Ctns."));
      $(api.table().column(get_ci_poli["pcs_total"]).footer()).html(format_number(sum_pcs, 0) + " " + gettext("Pcs."));
      $(api.table().column(get_ci_poli["c_weight"]).footer()).html(format_number(sum_weight, 0) + " " + gettext("kg"));
      $(api.table().column(get_ci_poli["c_height"]).footer()).html(sum_cbm + " " + gettext("cbm"));

      $(api.table().column(get_ci_poli["t_weight"]).footer()).html(format_number(sum_weight, 0) + " " + gettext("kg"));
      $(api.table().column(get_ci_poli["t_volume"]).footer()).html(sum_cbm + " " + gettext("cbm"));

      $(api.table().column(get_ci_poli["landed_cost_total_EUR"]).footer()).html(format_number(sum_lc_total, 2)  + " " + gettext(main_currency_sign));
      $(api.table().column(get_ci_poli["purchase_price_total"]).footer()).html(format_number(sum_pp_total, 2) + " " + purchase_order_currency);
      $(api.table().column(get_ci_poli["square_meters"]).footer()).html(format_number(sum_sqm, 2) + " sqm" );
}

function move_selected_to_different_po(po_id){

    obj_ids_list = $("#move_selected_to_po_modal").attr("data-obj_ids_list").split(',');
    $.ajax({
        method: 'POST',
        url: ajax_call_url,
        data: {
          "obj_ids_list" : obj_ids_list,
          "purchase_order_id" : po_id,
          'csrfmiddlewaretoken': csrfmiddlewaretoken,
          "action": "move_po_line_items_to_different_po",
        },
        success: function () {
          $("#dt_purchase_order_line_items").DataTable().ajax.reload();
          $("#move_selected_to_po_modal").modal("hide");
        },
        error: function () {
          alert(gettext("Error. Something went wrong."))
        }
      });
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

function save_all_row_changes(){
    po_data = []
    var save_all_btn = $(this)

    $(".save_changes_badge:not(:hidden)").each(function () {
        var btn = $(this)
        $(this).append(`<span id="saving_btn_spinner" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>  `)

        var td_node = $(this).closest("td")
        var dt = $(this).closest("table").DataTable()
        var current_row = dt.cell( td_node ).index()["row"]
        var carton_type = $(this).data("carton_type")

        var pcs_per_carton = $(dt.cell( current_row, "pcs_per_carton:name").node()).find("input").val();
        var qty_cartons = $(dt.cell( current_row, "qty_cartons:name").node()).find("input").val();
        var c_length = $(dt.cell( current_row, "c_length:name").node()).find("input").val();
        var c_width = $(dt.cell( current_row, "c_width:name").node()).find("input").val();
        var c_height = $(dt.cell( current_row, "c_height:name").node()).find("input").val();
        var c_weight = $(dt.cell( current_row, "c_weight:name").node()).find("input").val();
        var net_weight_kg = $(dt.cell( current_row, "net_weight_kg:name").node()).find("input").val();
        var purchase_price_per_pc = $(dt.cell( current_row, "purchase_price_per_pc:name").node()).find("input").val();
        var landed_cost_per_pc_EUR = $(dt.cell( current_row, "landed_cost_per_pc_EUR:name").node()).find("input").val();
        var expiration_date = $(dt.cell( current_row, "expiration_date:name").node()).find("input").val();
        var carton_note = $(dt.cell( current_row, "carton_note:name").node()).find("input").val();
        var obj_id = dt.cell(current_row, "obj_id:name").data();

        var mcli_id = "";
        if(carton_type === "mixed_carton"){
            var obj_id = dt.cell(current_row, "mcli_id:name").data()
        }else{
            var obj_id = dt.cell( current_row, "obj_id:name").data()
        }

        po_data.push({
                "carton_type" : carton_type,
                "pcs_per_carton" : pcs_per_carton,
                "qty_cartons" : qty_cartons,
                "c_length" : c_length,
                "c_width" : c_width,
                "c_height" : c_height,
                "c_weight" : c_weight,
                "net_weight_kg" : net_weight_kg,
                "purchase_price_per_pc" : purchase_price_per_pc,
                "landed_cost_per_pc_EUR" : landed_cost_per_pc_EUR,
                "expiration_date" : expiration_date,
                "carton_note" : carton_note,
                "obj_id" : obj_id
        })
    });
    save_all_btn.append(`<span id="saving_btn_spinner" class="spinner-border spinner-border-sm ml-2" role="status" aria-hidden="true"></span>`)

    $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
        "po_data" : JSON.stringify(po_data),
        "action" : "save_purchase_order_changes",
        "csrfmiddlewaretoken": csrfmiddlewaretoken
    },
    success: function () {
         $(".second_topbar_transparent ").attr("style", "display: none");
        $(".save_changes_badge:not(:hidden)").each(function () {
            var btn = $(this)
            btn.find(".spinner-border").remove()
            btn.attr("style", "display: none")
            var cancel_changes_btn = $(this).prev(".cancel_changes_btn")
            cancel_changes_btn.attr("style", "display: none")
        })

        hide_save_all_navbar_if_no_changes_left()
        $('#dt_purchase_order_line_items').DataTable().ajax.reload();
    },
      error: function (request, status, error) {
          save_all_btn.find("#saving_btn_spinner").remove()
        try {
          alert(request.responseJSON["error"]);
        } catch {
          alert(gettext("Error. Changes could not be saved."))
        }
      }
    })
}