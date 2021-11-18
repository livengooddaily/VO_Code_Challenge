$(document).ready(function () {

  $('#header_cache_button_container').on('click', function (e) {
    refresh_page_cache(page_name=`re_order_template`, page_id=re_order_template_id)
  });
  check_refresh_page_cache_status(page_name="re_order_template", page_id=re_order_template_id);

  register_datatable_sums_functionality();
  initialize_dt_re_order_template_overview();


  if (initial_category !== "None") {
    initialize_dt_add_skus_manually('#dt_add_skus_manually', initial_category)
  } else {
    initialize_dt_add_skus_manually()
  }

  bind_events();
  bind_tab_switching_functionality();
  bind_on_table_drawn_events("dt_re_order_template_overview")
  $("#overlay").hide();

  remarks_on_supplier_modal()

});

function bind_events() {
  bind_tooltip();
  $('#dt_add_skus_manually_modal').on('shown.bs.modal', function (e) {
    $('#dt_add_skus_manually').DataTable().ajax.reload();
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });

  $('#dt_add_skus_manually_modal').on('hide.bs.modal', function (e) {
    $('#header_cache_button_container').click();
    // $('#dt_re_order_template_overview').DataTable().ajax.reload();
  });
}

function bind_tab_switching_functionality() {
  $('#tab-list a').on('click', function (e) {
    e.preventDefault();
    add_switch_tabs_functionality.call(this)
  });
}
function bind_on_table_drawn_events(dt_id='#dt_re_order_template_overview') {
  $(dt_id).on('draw.dt', function () {
      $('[data-toggle="tooltip"]').tooltip();
      $(".tooltip").tooltip('hide');
      $('.popover').popover("hide");
  });
}

function get_carton_ids_list(dt) {
  ids = []
  $.map(dt.rows('.selected').indexes(), function (row_indexes) {
      ids.push(dt.row(row_indexes).data().obj_id)
  })
  return ids
}

function get_dt_re_order_template_overview_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox pr-0 pl-4 no_export noVis"},
    {"data": "main_ordering", "name": "main_ordering", className: "main_ordering no_export noVis"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
      {"data": "sales_last_30_days_for_calc", "name": "sales_last_30_days_for_calc", className: "sales_last_30_days_for_calc dt-center"},
      {"data": "sales_last_30_days", "name": "sales_last_30_days", className: "sales_last_30_days "},
      {"data": "total_reach_in_months_wp", "name": "total_reach_in_months_wp", className: "total_reach_in_months_wp dt-center"},
      {"data": "TotalSupplyQuantity", "name": "TotalSupplyQuantity", className: "TotalSupplyQuantity dt-center"},
      {"data": "wh_pcs_left", "name": "wh_pcs_left", className: "wh_pcs_left dt-center"},
      {"data": "pcs_on_the_way", "name": "pcs_on_the_way", className: "pcs_on_the_way dt-center"},
      {"data": "estimated_revenue_loss_0_days_delay", "name": "estimated_revenue_loss_0_days_delay", className: "estimated_revenue_loss_0_days_delay dt-center"},
      {"data": "estimated_revenue_loss_14_days_delay", "name": "estimated_revenue_loss_14_days_delay", className: "estimated_revenue_loss_14_days_delay noVis"},
      {"data": "estimated_revenue_loss_30_days_delay", "name": "estimated_revenue_loss_30_days_delay", className: "estimated_revenue_loss_30_days_delay noVis"},

      {"data": "manual_cartons", "name": "manual_cartons", className: "manual_cartons dt-center"},
      {"data": "manual_pieces", "name": "manual_pieces", className: "manual_pieces dt-center noVis"},
      {"data": "t_volume", "name": "t_volume", className: "t_volume dt-center noVis"},
      {"data": "t_weight", "name": "t_weight", className: "t_weight dt-center noVis"},

      {"data": "reorder_pcs_suggest_raw", "name": "reorder_pcs_suggest_raw", className: "reorder_pcs_suggest_raw dt-center"},
      {"data": "pcs_sugg_no_limit", "name": "pcs_sugg_no_limit", className: "pcs_sugg_no_limit dt-center"},
      {"data": "est_sug_reorder_volume_no_limit", "name": "est_sug_reorder_volume_no_limit", className: "est_sug_reorder_volume_no_limit dt-center"},
      {"data": "ctns_sugg_no_limit", "name": "ctns_sugg_no_limit", className: "ctns_sugg_no_limit dt-center"},
      {"data": "pcs_sugg_after_limit", "name": "pcs_sugg_after_limit", className: "pcs_sugg_after_limit dt-center"},
      {"data": "est_sug_reorder_volume_after_limit", "name": "est_sug_reorder_volume_after_limit", className: "est_sug_reorder_volume_after_limit dt-center"},
      {"data": "ctns_sugg_after_limit", "name": "ctns_sugg_after_limit", className: "ctns_sugg_after_limit dt-center"},
      {"data": "moq", "name": "moq", className: "moq dt-center"},
      {"data": "max_allowed_send_in_pcs", "name": "max_allowed_send_in_pcs", className: "max_allowed_send_in_pcs dt-center"},
      {"data": "def_pcs_per_carton", "name": "def_pcs_per_carton", className: "def_pcs_per_carton dt-center"},
      { "name": "actions def_pcs_per_carton", className: "actions text-center noVis no_export"},
  ]);

  return columns
}


function get_dt_re_order_template_overview_config() {
  return {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "re_order_template_id": re_order_template_id,
        "action": "get_re_order_template_selected_skus",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },

    rowGroup: {
      dataSrc: ["main_ordering"],
      endRender: function (rows, group, level) {$('[data-toggle="tooltip"]').tooltip({container:"body"});},
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
          return $('<tr></tr>')
            .append(`<td colspan="100%">
                                    <span>${rows.data()[0]["cat_product_type"]} - <a target="_blank" href="${get_img_url_base()}/dp/${rows.data()[0]["Parent_ASIN"]}">${rows.data()[0]["Parent_ASIN"]}</a> (${rows.count()})</span>
                                  </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        } else if (level === 1 | level === 2) {
          return $('<tr></tr>')
            .append(`<td colspan="100%">
                                    ${group} (${rows.count()})
                                  </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        }
      }
    },
    "order": [[get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_color"], "asc"], [get_ci_rot["cat_size"], "asc"], [get_ci_rot["cat_product_type"], "asc"],],
    orderFixed: [[get_ci_rot["main_ordering"], 'asc']],

    "columnDefs": [
      {
        "visible": false,
        "targets": [
          "main_ordering",
          "variation_name",
          "amz_title",
          "FNSKU",
          "ASIN",
          "Parent_ASIN",
          "cat_product_type",
          "cat_size",
          "cat_color",
          "cat_shape",
          "pcs_sugg_after_limit",
          "est_sug_reorder_volume_after_limit",
          "ctns_sugg_after_limit",
          "max_allowed_send_in_pcs",
          "def_pcs_per_carton",
          "estimated_revenue_loss_14_days_delay",
          "estimated_revenue_loss_30_days_delay",
          "manual_cartons",
          "manual_pieces",
          "t_volume",
          "t_weight",
        ],
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
        "targets": "sku",
        "data": "sku",
        "render": function (data, type, row) {
          if (type === "display"){
            var div_c = $(`<div 
                        class="d-inline align-items-center" 
                        style="white-space: nowrap;"
                        >
                    </div>`)

            if (row["is_parent_sku"]){
              var parent_sku_badge = $(`<div 
                                          class="badge badge-dark mr-1 p-1" 
                                          data-toggle="tooltip" 
                                          data-html="true">P<i class="fas fa-sitemap ml-1"></i></div>`)

              var tt_title = gettext('Parent SKU of following childs:')
              console.log(row["child_sku_dict_list"])
              row["child_sku_dict_list"].forEach(function (arrayItem) {
                  console.log(arrayItem)
                  console.log(tt_title)
                  tt_title = tt_title + "<br> - " + arrayItem["sku"];
              });

              $(parent_sku_badge).attr("title", tt_title);
              $(div_c).append(parent_sku_badge);

            }

            if (row["is_bundle_child_sku"]){
              var bundle_child_badge = $(`<div 
                                          class="badge badge-info mr-1 p-1" 
                                          data-toggle="tooltip" 
                                          data-html="true">BC<i class="fas fa-sitemap ml-1"></i></div>`)

              var bc_tt_title = gettext('Bundle component of following bundle SKUs:')
              row["bundle_parent_sku_dict_list"].forEach(function (arrayItem) {
                  bc_tt_title = bc_tt_title +`<br> - ${arrayItem["qty_in_bundle"]}x ${arrayItem["parent_sku_obj__sku"]}`;
              });

              $(bundle_child_badge).attr("title", bc_tt_title);
              $(div_c).append(bundle_child_badge);

            }

            $(div_c).append(`<span 
                        data-toggle="popover-hover" 
                        data-img="${row["small_image_url"]}">${row["sku"]}
                    </span>`);

            var amz_link = $(`
                      <i class="ml-1 fas fa-external-link-alt" 
                      style="cursor: pointer; color: rgba(59,89,152,0.27)" 
                      onclick="redirect_blank('${get_img_url_base()}/dp/${row["ASIN"]}')"></i>
                        `)
            $(div_c).append(amz_link);


            return div_c.prop('outerHTML');
          }
          else {
              return row["sku"]
          }
        },
      },

      {
        "targets": "TotalSupplyQuantity",
        "type": "num",
        "data": "TotalSupplyQuantity",

        "render": function (data, type, row) {
          if (type === 'display') {
            if (row["TotalSupplyQuantity"] === "???" || row["InStockSupplyQuantity"] === "???") {
              return "???"
            } else {
              var div_c = $(`<div class="d-flex justify-content-center"
                               onClick="open_popover_fba_stock_detail_table.call(this, '${row["obj_id"]}', 'aggregate_all')"
                               style="cursor: pointer">
                          </div>`)

              var pcs_in_fba = row["InStockSupplyQuantity"] - row["InStockSupplyQuantity_in_bundles"]
              var pcs_on_the_way_to_fba = row["TotalSupplyQuantity"] - row["TotalSupplyQuantity_in_bundles"] - pcs_in_fba
              var pcs_in_bundles = row["TotalSupplyQuantity_in_bundles"]

              var span_pcs_in_wh = $(`<span  data-toggle="tooltip" title="${gettext("Available Supply Quantity")}" style="border-bottom: 1px dotted;">${pcs_in_fba}</span>`)
              $(div_c).append(span_pcs_in_wh);

              if (pcs_on_the_way_to_fba !== 0) {
                var span_pcs_on_the_way = $(`<span data-toggle="tooltip" title="${gettext("Pending Supply Quantity")}" style="border-bottom: 1px dotted;" class="text-success ml-1">(+${pcs_on_the_way_to_fba})</span>`)
                $(div_c).append(span_pcs_on_the_way);
              }

              if (pcs_in_bundles !== 0) {
                var span_pcs_in_bundles = $(`<span data-toggle="tooltip" title="${gettext("Quantity of pcs within bundles")}" style="border-bottom: 1px dotted;" class="text-secondary ml-1">(+${pcs_in_bundles})</span>`)
                $(div_c).append(span_pcs_in_bundles);
              }
              return div_c.prop('outerHTML');
            }
          } else if (type === 'export') {
            return parseInt(row["TotalSupplyQuantity"])
          } else {
            return parseInt(row["TotalSupplyQuantity"])
          }
        },
      },

            {
        "targets": "small_image_url",
        "data": "small_image_url",
        "width": "20px",
        "orderable": false,
        "createdCell": function (td, cellData, rowData, row, col) {
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
        "targets": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        "data": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        "render": function (data, type, row) {
          if (row["auto_send_in_suggestion"] !== "enabled") {
            not_enabled_icon = `<span class="text-danger ml-1"> <i class="fas fa-minus-circle" title="${gettext("Auto fba send-in suggestion is disabled")}."></i></span>`
          } else {
            not_enabled_icon = ""
          }

          if (type === 'display') {
            if (row["max_allowed_send_in_pcs"] < row["fba_suggested_send_in_pcs_without_max_allowed_limit"]) {
              if (row["max_allowed_send_in_pcs"] < row["def_pcs_per_carton"]) {
                return `<div class="d-flex justify-content-around align-items-center" data-search="fba_send_in">
                                        <span class="text-danger mr-1" title="${gettext("Limit e.g. due to COVID19 restrictions")}">${row["max_allowed_send_in_pcs"]}</span>
                                        <span class="text-secondary mr-1" title="${gettext("Actually suggested pcs for send in")}"> (${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]})</span>
                                        <span class="text-danger"> <i class="fas fa-exclamation-triangle" title="Default carton size of ${row["def_pcs_per_carton"]} pcs is larger than the max. allowed amount for send-in of ${row["max_allowed_send_in_pcs"]} pcs."> </i> </span>
                                        ${not_enabled_icon}
                                    </div>`
              } else {
                return `<div class="d-flex justify-content-around align-items-center" data-search="fba_send_in">
                                        <span class="text-danger mr-1" title="${gettext("Limit e.g. due to COVID19 restrictions")}">${row["max_allowed_send_in_pcs"]}</span>
                                        <span class="text-secondary" title="${gettext("Actually suggested pcs for send in")}"> (${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]})</span>
                                        ${not_enabled_icon}F
                                    </div>`
              }

            } else {
              if (row["max_allowed_send_in_pcs"] < row["def_pcs_per_carton"] && row["wh_pcs_left"] > 0 && row["fba_suggested_send_in_pcs_without_max_allowed_limit"] > 0) {
                return `<div class="d-flex justify-content-around align-items-center" data-search="fba_send_in">
                                        <span class="text-danger mr-1" title="${gettext("Limit e.g. due to COVID19 restrictions")}">${row["max_allowed_send_in_pcs"]}</span>
                                        <span class="text-secondary mr-1" title="${gettext("Actually suggested pcs for send in")}"> (${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]})</span>
                                        <span class="text-danger"> <i class="fas fa-exclamation-triangle" title="Default carton size of ${row["def_pcs_per_carton"]} pcs is larger than the max. allowed amount for send-in of ${row["max_allowed_send_in_pcs"]} pcs."> </i> </span>
                                        ${not_enabled_icon}
                                    </div>`
              } else {
                return `<div class="d-flex justify-content-center align-items-center">
                                        <span>${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]}</span>
                                        ${not_enabled_icon}
                                    </div>`
              }
            }
          } else {
            return parseFloat(data)
          }


        },
      },

      {
        "targets": "total_reach_in_months_wp",
        "data": "total_reach_in_months_wp",
        "type": "num",
        "createdCell": function (td, cellData, rowData, row, col) {
          reach_cat_td_coloring_and_title(td, rowData["wh_and_fba_wp_cat"])
        },
        "render": function (data, type, row) {
          if (type === 'display') {
            if (data === "???" || data === "&#8734;") {
              return data
            } else {
              if (data > 0) {
                return `<div class="badge py-2" data-toggle="tooltip" style="width: 90%">${data}</div>`
              } else {
                return `<div class="badge py-2" data-toggle="tooltip" style="width: 90%" title="${gettext("Out of stock")}">${gettext("OOS")}</div>`
              }
            }
          } else {
            if (Number.isNaN(parseFloat(data))) {
              return "???"
            } else {
              return parseFloat(data)
            }
          }
        },
      },


      {
        "targets": "fba_reach_in_weeks_incl_pending",
        "data": "fba_reach_in_weeks_incl_pending",
         "type": "num",
        "createdCell": function (td, cellData, rowData, row, col) {
          reach_cat_td_coloring_and_title(td, rowData["fba_reach_wp_cat"])
          if (rowData["wh_pcs_left"] > 0 && rowData["max_allowed_send_in_pcs"] < rowData["def_pcs_per_carton"]) {
            $(td).find("div").prepend( `<i class='fas fa-exclamation-triangle text-danger mr-1' data-toggle="tooltip" title="Send-in might be blocked. The default amount of pcs per carton [${rowData["def_pcs_per_carton"]} pcs] exceeds Amazon limit [${rowData["max_allowed_send_in_pcs"]} pcs] (e.g. COVID19 limit)."></i>`)
            $(td).find("div").attr("title", ``)
            // $(td).find("div").attr("title", `Send-in might be blocked. The default amount of pcs per carton [${rowData["def_pcs_per_carton"]} pcs] exceeds Amazon limit [${rowData["max_allowed_send_in_pcs"]} pcs] (e.g. COVID19 limit).`)
          } else {
          }
        },
        "render": function (data, type, row) {
          if (type === 'display') {
            if (data === "???") {
              return data
            } else if (data === 0) {
              return `<div class="badge py-2" data-toggle="tooltip" style="width: 90%" title="${gettext("Out of stock")}">${gettext("OOS")}</div>`
            } else if (Number.isNaN(parseFloat(data))) {
              return "???"
            }else {
                return `<div class="badge py-2" data-toggle="tooltip" style="width: 90%">${data}</div>`
              }


          } else {
            if (Number.isNaN(parseFloat(data))) {
              return "???"
            } else {
              return parseFloat(data)
            }
          }
        },
      },


      {
        "targets": "actions",
        "data": "obj_id",
        "orderable": false,
        "render": function (data, type, row) {
          var div_c = $(`<div class="d-flex justify-content-center align-items-center p-0 m-0"></div>`);

          $(div_c).append(`
                        <div class="dropdown show">
                          <button class="btn btn-white btn-sm dropdown-toggle p-0" style="font-size: 0.8rem;" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-bars text-secondary mr-1" title="${gettext("Actions")}" style="cursor: pointer"></i>
                          </button>

                          <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                            <div class="pr-2 pl-2 mt-1">
                                <a target="_blank" href="${sku_stock_history_url}${data}" class="text-nowrap text-secondary">
                                  <i class="fas fa-list text-secondary mr-1" title="${gettext("See history log")}" style="cursor: pointer"></i>
                                  ${gettext("See stock history log")}
                                </a>
                            </div>
<!--                            <div class="pr-2 pl-2"> <a target="_blank" href="${get_img_url_base()}/dp/${row["ASIN"]}" class="text-nowrap text-secondary"><i class="fab fa-amazon text-secondary mr-1" title="View listing on Amazon" style="cursor: pointer"></i>View listing on Amazon</a></div>-->
                            <div class="dropdown-divider"></div>
                            <div class="pr-2 pl-2 mt-1"> <a href="${edit_model_sku_url}${row["obj_id"]}/" class="text-nowrap text-secondary"><i class="fas fa-edit text-secondary mr-1" title="${gettext("Edit SKU Data")}" style="cursor: pointer"></i>${gettext("Edit SKU Data")}</a></div>
                            <div class="pr-2 pl-2 mt-1"> <a target="_blank" href="https://sellercentral-europe.amazon.com/abis/listing/edit?asin=${row["ASIN"]}&sku=${row["sku"]}" class="text-nowrap text-secondary"><i class="fas fa-edit text-secondary mr-1" title="${gettext("Edit SKU data on Amazon")}" style="cursor: pointer"></i>${gettext("Edit SKU data on Amazon")}</a></div>
                            <div class="pr-2 pl-2 mt-1"> <a href="${forecast_mgmt_url}${row["obj_id"]}/" class="text-nowrap text-secondary"><i class="fas fa-chart-line text-secondary mr-1" style="cursor: pointer"></i>${gettext("Sales & Forecasting")}</a></div>
                          </div>
                        </div>
                        `);

          if (row["forecasting_enabled"] === true) {
              $(div_c).prepend(`<span class="text-info mr-2">
                                    <i class="fa fa-chart-line" 
                                    data-toggle="tooltip"
                                    style="cursor: pointer"
                                    onclick="window.location='${forecast_mgmt_url}${row["obj_id"]}'" 
                                    title="${gettext("Advanced forecasting is enabled")}"></i>
                                </span>`);
          }

          return div_c.prop('outerHTML');

        },
      },
      {
        "targets": "sales_last_30_days_for_calc",
        "data": "sales_last_30_days_for_calc",
        // "width": "10px",

        "render": function (data, type, row) {
          if (type === 'display') {
            return `<div class="d-flex justify-content-end align-items-center " 
                         title="${gettext("Weighted 30 days sales based on provided weighting parameters")}" width="100%">
                        <span class="ml-2 mt-1 ">
                            <strong>${row["sales_last_30_days_for_calc"]}</strong>
                        </span>
                        <span class="mr-3 ml-2" style="font-size: x-large">${map_icon_to_sales_trend(row["sales_trend"])}</span>
                    </div>`
          } else {
            return parseFloat(data)
          }
        },
      },
       {
        "targets": "sales_last_30_days",
        "data": "sales_last_30_days",
        // "width": "11rem",
        "orderable": false,
        "render": function (data, type, row) {
          var unit = re_order_template_table_sales_velocity_reach_unit
          if (row["sales_last_30_days_manual"] === 0) {
            var manual_sales_input = " - "
          } else {
            var manual_sales_input = `(${row["sales_last_30_days_manual"]})`
          }
          return `<div class="row px-1" style="width: 18rem;  white-space: nowrap" title="${gettext("Based on sales from the last: 3 days / 7 days / 30 days / 90 days / 180 days (manual sales input)")}" >
                                <span class="col-2 px-0 text-center border-right-separator" data-toggle="tooltip" title="${gettext("Estimated sales velocity based on sales data from the last 3 days")}">${row["sales_last_3_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" data-toggle="tooltip" title="${gettext("Estimated sales velocity based on sales data from the last 7 days")}">${row["sales_last_7_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" data-toggle="tooltip" title="${gettext("Estimated sales velocity based on sales data from the last 30 days")}">${row["sales_last_30_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" data-toggle="tooltip" title="${gettext("Estimated sales velocity based on sales data from the last 90 days")}">${row["sales_last_90_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" data-toggle="tooltip" title="${gettext("Estimated sales velocity based on sales data from the last 180 days")}">${row["sales_last_180_days"]}</span>
                                <span class="col-2 px-0 text-center" data-toggle="tooltip" title="${gettext("Manually provided sales velocity")}">${manual_sales_input}</span>
                            </div>`
        },
      },
      {
        "targets": "estimated_revenue_loss_0_days_delay",
        "data": "estimated_revenue_loss_0_days_delay",
        "width": "14rem",
        "orderable": false,
        "render": function (data, type, row) {
          var div_c = $(`<div class="row px-1" style="width: 14rem;  white-space: nowrap" ></div>`)

          var div_c_0d = $(`<span class="col-4 px-0 text-center border-right-separator" data-toggle="tooltip"
                              title="${gettext("Estimated revenue loss, if re-oder placed now")}">
                        </span>`);
          if(row["estimated_revenue_loss_0_days_delay"] > 0) {
            $(div_c_0d).append(format_number(parseInt(row["estimated_revenue_loss_0_days_delay"],0)))
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

          if(row["estimated_revenue_loss_14_days_delay"] - row["estimated_revenue_loss_0_days_delay"] > 0) {
            $(div_c_14d).append("+ ")
            $(div_c_14d).append(format_number(row["estimated_revenue_loss_14_days_delay"] - row["estimated_revenue_loss_0_days_delay"],0) )
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


          if(row["estimated_revenue_loss_30_days_delay"] - row["estimated_revenue_loss_0_days_delay"]> 0) {
            $(div_c_30d).append("+ ")
            $(div_c_30d).append(format_number(row["estimated_revenue_loss_30_days_delay"] - row["estimated_revenue_loss_0_days_delay"],0))
            $(div_c_30d).addClass("text-danger")
          } else {
            $(div_c_30d).append("-")
            $(div_c_30d).addClass("text-secondary")
          }

          $(div_c).append(div_c_0d);
          $(div_c).append(div_c_14d);
          $(div_c).append(div_c_30d);
          return div_c.prop('outerHTML');
        },
      },
      {
        "targets": "reorder_pcs_suggest_raw",
        "data": "reorder_pcs_suggest_raw",

        "render": function (data, type, row) {
          if (type === 'display') {
            return get_re_order_suggestion_pcs_cell_content(row);
          } else {
            return parseFloat(data)
          }

        },
      },
      {
        "targets": "est_sug_reorder_volume_no_limit",
        "data": "est_sug_reorder_volume_no_limit",

        "render": function (data, type, row) {
            return parseFloat(data)

        },
      },
      {
        "targets": "est_sug_reorder_volume_after_limit",
        "data": "est_sug_reorder_volume_after_limit",

        "render": function (data, type, row) {
            return parseFloat(data)
        },
      },

      {
        "targets": "TotalSupplyQuantity",
        "data": "TotalSupplyQuantity",

        "render": function (data, type, row) {
          if (row["TotalSupplyQuantity"] === "???" || row["InStockSupplyQuantity"] === "???") {
            return "???"
          } else if (row["TotalSupplyQuantity"] !== row["InStockSupplyQuantity"]) {

            return `
                    <div class="d-flex justify-content-center">
                        <span title="${gettext("Available Supply Quantity")}">${row["InStockSupplyQuantity"]}</span>
                        <span class="text-secondary"></span>
                        <span title="${gettext("Pending Supply Quantity")}" class="text-success ml-1">
                            (+${row["TotalSupplyQuantity"] - row["InStockSupplyQuantity"]})
                        </span>
                    </div>
                    `
          } else {
            return `
                    <div class="d-flex justify-content-center">
                        <span title="${gettext("Available Supply Quantity")}">${row["InStockSupplyQuantity"]}</span>
                        <span class="text-secondary"></span>
                    </div>
                    `
          }
        },
      },
      {
        "targets": "FBA_on_the_way",
        "data": "TotalSupplyQuantity",

        "render": function (data, type, row) {
          if (row["TotalSupplyQuantity"] === "???" || row["InStockSupplyQuantity"] === "???") {
            return "???"
          } else {
            return row["TotalSupplyQuantity"] - row["InStockSupplyQuantity"]
          }
        },
      },
      {
        "targets": "wh_pcs_left",
        "data": "wh_pcs_left",

        "render": function (data, type, row) {
          if (type === 'display') {
            var div_c = $(`<div class="d-flex justify-content-center"
                               onClick="open_popover_wh_stock_detail_table.call(this, '${row["obj_id"]}')"
                               style="cursor: pointer">
                          </div>`)

            var span_pcs_in_wh = $(`<span  data-toggle="tooltip" title="${gettext("Quantity of stock in own / non-Amazon warehouse")}" style="border-bottom: 1px dotted;">${row["wh_pcs_left"] - row["bundle_wh_pcs_left_cached"]}</span>`)
            $(div_c).append(span_pcs_in_wh);

            var pcs_on_the_way = row["pcs_on_the_way"] - row["bundle_pcs_on_the_way_cached"]
            if ( pcs_on_the_way !== 0) {
              var span_pcs_on_the_way = $(`<span data-toggle="tooltip" title="${gettext("Quantity of stock that is currently in production or shipping")}" style="border-bottom: 1px dotted;" class="text-success ml-1">(+${pcs_on_the_way})</span>`)
              $(div_c).append(span_pcs_on_the_way);
            }

            var pcs_in_bundles = row["bundle_wh_pcs_left_cached"] + row["bundle_pcs_on_the_way_cached"]
            if (pcs_in_bundles !== 0) {
              var text_pcs_in_bundles = `${row["bundle_wh_pcs_left_cached"]}`
              if(row["bundle_pcs_on_the_way_cached"]!==0){
                text_pcs_in_bundles = text_pcs_in_bundles + `/${row["bundle_pcs_on_the_way_cached"]}`
              }
              var span_pcs_in_bundles = $(`<span data-toggle="tooltip" title="${gettext("Quantity of pcs within bundles")}" style="border-bottom: 1px dotted;" class="text-secondary ml-1">(+${text_pcs_in_bundles})</span>`)
              $(div_c).append(span_pcs_in_bundles);
            }
            return div_c.prop('outerHTML');
          } else {
            return parseFloat(data)
          }
        },
      },

      {
            "targets": "manual_cartons",
            "data": "manual_cartons",
            "defaultContent": "",
            "createdCell": function (td, cellData, rowData, row, col) {
              $(td).css('border-right','none');
            },
            "render": function (data, type, row) {
                if(data != undefined){
                    manual_cartons = data
                }else{
                    manual_cartons = row["ctns_sugg_no_limit"]
//                    manual_cartons = ( (typeof row["reorder_pcs_suggest_raw"] == 'number' ? row["reorder_pcs_suggest_raw"] : 0) / (row["def_pcs_per_carton"] > 0 ? row["def_pcs_per_carton"] : 1)).toFixed(0)
                    row["manual_cartons"] = manual_cartons
                }
                var id = row["obj_id"] + "-" + "manual_cartons";
                return get_input_html(id, "manual_cartons", manual_cartons, "number", additional_spec = "class='input_change'", false)
          }
      },

      {
            "targets": "manual_pieces",
            "data": "manual_pieces",
            "defaultContent": "",
            "createdCell": function (td, cellData, rowData, row, col) {
              $(td).css('border-right','none');
            },
            "render": function (data, type, row) {
                if(data !== undefined){
                    return data
                }
                row["manual_pieces"] = row["ctns_sugg_no_limit"] * ((row["def_pcs_per_carton"] !== 0 && row["def_pcs_per_carton"]) ? row["def_pcs_per_carton"] : 1)
                return row["manual_pieces"]
          }
      },


      {
            "targets": "t_volume",
            "data": "t_volume",
            "defaultContent": "",
            "createdCell": function (td, cellData, rowData, row, col) {
              $(td).css('border-right','none');
            },
            "render": function (data, type, row) {
                if(data !== undefined){
                    return data
                }
               manual_cartons = row["ctns_sugg_no_limit"]
               row["t_volume"] = (manual_cartons * (row["def_c_height"] * row["def_c_length"] * row["def_c_width"]/1000000)).toFixed(2)
                // row["t_volume"] = row["est_sug_reorder_volume_no_limit"]
                return row["t_volume"]
          }
      },

      {
            "targets": "t_weight",
            "data": "t_weight",
            "defaultContent": "",
            "createdCell": function (td, cellData, rowData, row, col) {

            },
            "render": function (data, type, row) {
                if(data !== undefined){
                    return data
                }
               manual_cartons = row["ctns_sugg_no_limit"]
               row["t_weight"] = (row["def_c_weight"] * manual_cartons).toFixed(2)
                // row["t_weight"] = row["est_sug_reorder_weight_no_limit"]

//                  return row["t_weight"] = row["ctns_sugg_no_limit"] * (row["def_c_weigh"] != 0 ? row["ctns_sugg_no_limit"] : 1)

                return row["t_weight"]
          }
      },

    ],

    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: `<i class="fas fa-columns"></i>  ${gettext("Select Columns")}`,
        postfixButtons:[{extend: 'columnToggle', text:'Due Date',columns:':gt(9)'}]
      },
      {
        extend: `collection`,
        text: `<i class="fas fa-th-list mr-1"></i>${gettext("Modify Grouping")}`,
        buttons: [
          {
            text: gettext('by Color'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_color"]);
              dt.order([get_ci_rot["cat_product_type"], "asc"], [get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_color"], "asc"])
              dt.draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
            }
          },

          {
            text: gettext('by Size'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_size"]);
              dt.order([get_ci_rot["cat_product_type"], "asc"], [get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_size"], "asc"]);
              dt.draw();
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
            }
          },

          {
            text: gettext('by Shape'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape"]);
              dt.order([get_ci_rot["cat_product_type"], "asc"], [get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_shape"], "asc"])
              dt.draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
            }
          },

          {
            text: gettext('by Shape & Color'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape", "cat_color"]);
              dt.order([get_ci_rot["cat_product_type"], "asc"], [get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_shape"], "asc"], [get_ci_rot["cat_color"], "asc"])
              dt.draw()
              $("tr.dtrg-level-1 td").css("font-weight", "bold")
              $("tr.dtrg-level-2 td").css("padding-left", "3em")
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "4em")
            }
          },

          {
            text: gettext('by Shape & Size'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape", "cat_size"]);
              dt.order([get_ci_rot["cat_product_type"], "asc"], [get_ci_rot["Parent_ASIN"], "asc"], [get_ci_rot["cat_shape"], "asc"], [get_ci_rot["cat_size"], "asc"])
              dt.draw()
              $("tr.dtrg-level-1 td").css("font-weight", "bold")
              $("tr.dtrg-level-2 td").css("padding-left", "3em")
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "4em")
            }
          },

          {
            text: gettext('by Product Type & Parent ASIN (default)'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering"]);
              // {#dt.order([get_ci_rot["main_ordering"],"asc"],[get_ci_rot["cat_color"],"asc"],[get_ci_rot["cat_size"], "asc"])#}
              // {#dt.order([get_ci_rot["cat_color"],"asc"],[get_ci_rot["cat_size"], "asc"],[6, "asc"])#}
              dt.order(
                [get_ci_rot["cat_product_type"], "asc"],
                [get_ci_rot["Parent_ASIN"], "asc"],
                [get_ci_rot["cat_color"], "asc"],
                [get_ci_rot["cat_size"], "asc"]).order.fixed({pre: [get_ci_rot["main_ordering"], 'asc']}).draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "1em")
            }
          },

          {
            text: gettext('by Product Type only'),
            action: function (e, dt, node, config) {
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["cat_product_type"]);
              // {#dt.order([get_ci_rot["main_ordering"],"asc"],[get_ci_rot["cat_color"],"asc"],[get_ci_rot["cat_size"], "asc"])#}
              // {#dt.order([get_ci_rot["cat_color"],"asc"],[get_ci_rot["cat_size"], "asc"],[6, "asc"])#}
              dt.order(
                [get_ci_rot["cat_product_type"], "asc"],
                [get_ci_rot["cat_color"], "asc"],
                [get_ci_rot["cat_size"], "asc"]).order.fixed({pre: [get_ci_rot["cat_product_type"], 'asc']}).draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "1em")
            }
          },
          {
            text: gettext('No Grouping'),
            action: function (e, dt, node, config) {
              dt.rowGroup().disable();
              dt.order.fixed("obj_id").draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "0em")
            }
          },

        ]
      },

      {
        extend: 'collection',
        text: `<i class="fas fa-file-export mr-1"></i>${gettext("Export")}`,
        buttons: [

          {
            extend: 'copy',
            text: gettext('Copy to Clipboard'),
            exportOptions: {
              columns: 'th:not(.no_export)'
            }
          },
          {
            extend: 'excel',
            text: 'Excel',
            exportOptions: {
              columns: 'th:not(.no_export)'
            }
          },
          {
            extend: 'csv',
            text: 'CSV',
            exportOptions: {
              columns: 'th:not(.no_export)'
            }
          },
        ]
      },
      {
            text: `<i class="far fa-edit mr-1"></i>${gettext("Batch Edit")}`,
            action: function (e, dt, node, config) {
              initiate_bulk_update_modal(dt);
              dt_button_collection_close()
            }
      },
      {
            text: `<i class="fa fa-expand-alt mr-1"></i>${gettext("Scale Order")}`,
            action: function (e, dt, node, config) {
                $('#scale_manual_ctns_modal').modal('show');
            }
      },
    ],

    "bPaginate": false,
    "info": true,
    "bFilter": true,

    "createdRow": function (row, data, dataIndex) {
      console.log(data["is_parent_sku"])
      if (data["is_parent_sku"]) {
        $(row).addClass("parent_sku_row")
      }
    },

    drawCallback: function () {
      var api = this.api();

      sum_estimated_revenue_loss_0_days_delay = api.column(get_ci_rot["estimated_revenue_loss_0_days_delay"], {page : 'current'}).data().sum();
      sum_estimated_revenue_loss_14_days_delay = api.column(get_ci_rot["estimated_revenue_loss_14_days_delay"], {page : 'current'}).data().sum();
      sum_estimated_revenue_loss_30_days_delay = api.column(get_ci_rot["estimated_revenue_loss_30_days_delay"], {page : 'current'}).data().sum();

      rev_loss_sums = `<div class="row px-1" style="width: 14rem;  white-space: nowrap" >
                        <span class="col-4 px-0 text-center border-right-separator" data-toggle="tooltip"
                              title="${gettext("Estimated revenue loss, if re-oder placed now")}">
                            ${format_number(sum_estimated_revenue_loss_0_days_delay)} ${main_currency_sign}
                        </span>
                        
                        <span class="col-4 px-0 text-center border-right-separator" data-toggle="tooltip" data-html="true"
                              title="${gettext("Additional revenue loss, if re-oder placed after 14 days")}.<br>
                                        ${gettext("Total")}: ${format_number(sum_estimated_revenue_loss_14_days_delay)} ${main_currency_sign}">
                            ${format_number(sum_estimated_revenue_loss_14_days_delay - sum_estimated_revenue_loss_0_days_delay)} ${main_currency_sign}
                        </span>
                        
                        <span class="col-4 px-0 text-center" data-toggle="tooltip" data-html="true"
                              title="${gettext("Additional revenue loss, if re-oder placed after 30 days")}.<br>
                                        ${gettext("Total")}: ${format_number(sum_estimated_revenue_loss_30_days_delay)} ${main_currency_sign}">
                            ${format_number(sum_estimated_revenue_loss_30_days_delay - sum_estimated_revenue_loss_0_days_delay)} ${main_currency_sign}
                        </span>
                    </div>`


      $(api.table().column(get_ci_rot["estimated_revenue_loss_0_days_delay"]).footer()).html(rev_loss_sums);
      $(api.table().column(get_ci_rot["reorder_pcs_suggest_raw"]).footer()).html(api.column(get_ci_rot["reorder_pcs_suggest_raw"], {page : 'current'}).data().sum() + ` ${gettext("pcs.")}`);
      $(api.table().column(get_ci_rot["pcs_sugg_no_limit"]).footer()).html(api.column(get_ci_rot["pcs_sugg_no_limit"], {page : 'current'}).data().sum() + ` ${gettext("pcs.")}`);
      $(api.table().column(get_ci_rot["est_sug_reorder_volume_no_limit"]).footer()).html(Math.round(api.column(get_ci_rot["est_sug_reorder_volume_no_limit"], {page : 'current'}).data().sum() * 10) / 10 + ` ${gettext("cbm")}`);
      $(api.table().column(get_ci_rot["ctns_sugg_no_limit"]).footer()).html(api.column(get_ci_rot["ctns_sugg_no_limit"], {page : 'current'}).data().sum() + ` ${gettext("ctns.")}`);
      $(api.table().column(get_ci_rot["pcs_sugg_after_limit"]).footer()).html(api.column(get_ci_rot["pcs_sugg_after_limit"], {page : 'current'}).data().sum() + ` ${gettext("pcs.")}`);
      $(api.table().column(get_ci_rot["est_sug_reorder_volume_after_limit"]).footer()).html(Math.round(api.column(get_ci_rot["est_sug_reorder_volume_after_limit"], {page : 'current'}).data().sum() * 10) / 10 + ` ${gettext("cbm")}`);
      $(api.table().column(get_ci_rot["ctns_sugg_after_limit"]).footer()).html(api.column(get_ci_rot["ctns_sugg_after_limit"], {page : 'current'}).data().sum() + ` ${gettext("ctns.")}`);


      $('[data-toggle="popover-hover"]').popover({
        html: true,
        trigger: 'hover',
        placement: 'bottom',
        content: function () {
          return '<img src="' + $(this).data('img') + '" />';
        }
      });

      bind_on_input_change_events()
      update_manual_ctn_footer(api.table())
    }

  };
}

function initiate_bulk_update_modal(dt) {
  // dt = $(dt).DataTable()
  var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    return dt.cell(row_indexes, "obj_id:name").data()
  })

  $('input[name="obj_ids"]').val(obj_ids_list);
  $('input[name="redirect_url"]').val(redirect_url);
  $('#sku_bulk_update_modal').modal('show')

}

function initialize_dt_re_order_template_overview() {

  collapsedGroups = {};
  var top = '';
  var default_grouping = ""

  var columns = get_dt_re_order_template_overview_columns();
  get_ci_rot = create_column_map(columns);

  var dt_re_order_template_overview_config = get_dt_re_order_template_overview_config();

  dt_re_order_template_overview_config["columns"] = columns;
   $.extend(dt_re_order_template_overview_config, def_dt_settings_for_scroller);
  dt_re_order_template_overview_config["scrollY"] = "70vh";
  var dt = $('#dt_re_order_template_overview').DataTable(dt_re_order_template_overview_config);

    $('#dt_re_order_template_overview').on( 'column-visibility.dt', function ( e, settings, column, state ) {
        if(column == 23){
            visible = dt.column(column).visible()
            dt.column(column+1).visible(visible)
            dt.column(column+2).visible(visible)
            dt.column(column+3).visible(visible)
            bind_on_input_change_events()
        }
    });
}





function get_dt_add_skus_manually_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "obj_id select-checkbox noVis", width: "5%"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [{name: "actions", className: "actions noVis text-center"}]);

  return columns
}

function get_config_dt_add_skus_manually(mc_id=null, category="", dt_id="#dt_add_skus_manually") {
  columns = get_dt_add_skus_manually_columns();
  get_ci_am = create_column_map(columns);

  dt_add_skus_manually_config =  {

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
        data.action = "get_active_skus_to_add_to_re_orders";
        data.obj_id= re_order_template_id;
        data.category= category;
        data.csrfmiddlewaretoken = csrfmiddlewaretoken;
        return data;
      }
  },

    // Search Button
    initComplete : function() {
        add_search_for_server_side_table.call(this, dt_id)
    },

  orderFixed: [
    [get_ci_am["cat_product_type"], 'asc'],
//    [get_ci_am["cat_size"], 'asc'],
  ],
  "columnDefs": [
    {
      "targets": [
            "obj_id",
            "actions",
            "variation_name",

      ],
      "orderable":false,
      "searchable":false
    },

    {
      "targets": "obj_id",
      "data": "obj_id",
      "orderable":false,
      "render": function ( data, type, row ) {
        return ``
      },
    },
    {
      "targets": -1,
      "data": "obj_id",
      "render": function ( data, type, row ) {
        if (row["in_re_order_template"]) {
          return `
          <div class="add_buttons d-flex justify-content-center">
            ${get_remove_from_selection_button_html("delete_selected_sku_from_list.call(this)", data)}
           </div>
          `
        } else {
            var add_btn = $(get_add_to_selection_button_html(`add_selected_sku_to_list.call(this)`, data));
            var div_c = $( `<div class="add_buttons d-flex justify-content-center"></div>`);
            var hiden_div = $(`<div style="display: none">not_assigned</div>`);
            if (row["assigned_to_x_no_of_templates"] > 0){
              $(add_btn).removeClass("btn-success");
              $(add_btn).addClass("btn-secondary");
              $(add_btn).attr("data-toggle", "tooltip");
              $(add_btn).attr("title", gettext("This SKU is already part of another template"));
            } else {
              $(div_c).append(hiden_div);
            }
            $(div_c).append(add_btn);
          return div_c.prop('outerHTML');
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
      text: `<i class="fa fa-slash"></i> ${gettext("Disable Grouping")}`,
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
            $.ajax({
                method:'POST',
                url:ajax_call_url,
                data_type: "json",
                data: {
                  "sku_ids" : sku_ids,
                  "re_order_template_id" : re_order_template_id,
                  "action": "add_selected_skus_as_re_order_template_line_items",
                  "csrfmiddlewaretoken": csrfmiddlewaretoken,
                },
                success:function(){
                 $('#dt_add_skus_manually_modal').modal('hide');
                    $("#dt_re_order_template_overview").DataTable().ajax.reload();
                },
                error:function(){
                  alert(gettext("Error. Some SKUs could not be added."))
                }
              })
        },
    },

    {
      text: `<i class="fa fa-filter"></i> ${gettext("Filter SKUs without Template")}`,
      action: function ( e, dt, node, config ) {
        dt.column(-1).search("not_assigned").draw()
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
  dt_add_skus_manually_config["stateSave"] = false;
  dt_add_skus_manually_config["bPaginate"] = true;
  return dt_add_skus_manually_config

}



function initialize_dt_add_skus_manually(dt_id="#dt_add_skus_manually", category=""){
  $(dt_id).DataTable(get_config_dt_add_skus_manually(mc_id=null, category, dt_id));
}



function re_order_template_overview_table_batch_actions(action) {
  dt = $("#dt_re_order_template_overview").DataTable();
  var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    return dt.cell(row_indexes, "obj_id:name").data()
  })

  if (action === "batch_discontinued") {
    var data = {
      'action': "batch_update_skus",
      't_field': "status",
      'new_value': "Discontinued",
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }
    var url = "/ajax_batch_update_values/"
    updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false)
    dt.rows('.selected').remove().draw()
  }

  if (action === "fba_send_in_from_selected") {
    $(".loader-wrapper").fadeIn("slow");
    var data = {
      'action': "fba_send_in_from_selected",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }
    var url = "/ajax_batch_update_values/"

    $.ajax({
      method: 'POST',
      url: url,
      data: data,
      success: function (data) {
        window.location = `${edit_fba_send_in_url}${data["data"]["fba_send_in_id"]}/`;
      }
    })
  }
}

function delete_selected_m2m_obj_from_list(obj_id=null, table_id="not_specified") {
  if (obj_id===null){
    var obj_id = $(this).data('obj_id')
    var table_id = $(this).closest("table").attr("id")
  } else {
  }


  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "sku_id": obj_id,
      "re_order_template_id": re_order_template_id,
      "action": "delete_re_order_template_item",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      if (table_id.length > 0) {
        $("#" + table_id).DataTable().ajax.reload();
      }
    }
  })
}



function change_unit() {
  var selected_unit = $("input[name='unit_selection']:checked").attr("id")
  var target_field = $(this).data('target_field')

  if (selected_unit == "radio_select_Days") {
    selected_unit = "d"
  } else if (selected_unit == "radio_select_Months") {
    selected_unit = "m"
  } else {
    selected_unit = "w"
    // {#    default #}
  }

  var data = {
    'action': "change_reach_unit",
    'selected_unit': selected_unit,
    'target_field': target_field,
  }
  var url = "/ajax_call/"
  updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = true)
  $(`#${target_field}`).html(`[${selected_unit}]`)
  $('#header_cache_button_container').click()
}


$.fn.dataTable.ext.buttons.select_visible = {
  className: 'buttons-select-visible',
  text: gettext('Select Visible'),
  action: function (e, dt) {
    // action: function ( e, dt, node, config ) {
    dt.rows({page: 'current'}).select();
  }
};




function map_icon_to_sales_trend(sales_trend) {
  if (sales_trend === "upward") {
    return `<i class="fas fa-arrow-alt-circle-up cw45 text-success" title="${gettext("Upward sales trend (based on last 7 days)")}"></i>`
  } else if (sales_trend === "strong upward") {
    return `<i class="fas fa-arrow-alt-circle-up text-success" title="${gettext("Strong upward trend (based on last 7 days)")}"></i>`
  } else if (sales_trend === "downward") {
    return `<i class="fas fa-arrow-alt-circle-right cw45 text-warning" title="${gettext("Downward sales trend (based on last 7 days)")}"></i>`
  } else if (sales_trend === "strong downward") {
    return `<i class="fas fa-arrow-alt-circle-down text-danger" title="${gettext("Strong downward sales trend (based on last 7 days)")}"></i>`
  } else if (sales_trend === "no_sales") {
    return `<i class="fas fa-arrow-alt-circle-right text-light" title="${gettext("No sales in the last 7 days")}"></i>`
  } else if (sales_trend === "flat") {
    return `<i class="fas fa-arrow-alt-circle-right text-secondary" title="${gettext("Flat sales trend (based on last 7 days)")}"></i>`
  } else {
    return `<i class="fas fa-arrow-alt-circle-right text-secondary"></i>`
  }

}




function add_selected_sku_to_list() {
  var obj_id = $(this).data('obj_id')

  $(this).closest("div.add_buttons").html(
    get_remove_from_selection_button_html("delete_selected_sku_from_list.call(this)", obj_id)
  )

  $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
      "obj_id": obj_id,
      "re_order_template_id": re_order_template_id,
      "action": "add_reorder_planning_sku",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert(gettext("Error. SKU could not be added."))
    },
  })
}

function delete_selected_sku_from_list() {
  var obj_id = $(this).data('obj_id')
  var table_id = $(this).closest("table").attr("id")

  $(this).closest("div.add_buttons").html(get_add_to_selection_button_html(`add_selected_sku_to_list.call(this)`, obj_id))

  delete_selected_m2m_obj_from_list(obj_id)
}

function add_switch_tabs_functionality() {
  $(this).tab('show');
  var dt_id =  $(this).data('dt_id');
  var category =  $(this).data('category');

  if (dt_id !== "#dt_add_skus_manually") {
    if (!$.fn.DataTable.isDataTable(dt_id)) {
      bind_on_table_drawn_events(dt_id);
      initialize_dt_add_skus_manually(dt_id, category)
    } else {
      $(dt_id).DataTable().ajax.reload();
    }
  }
}

function show_changes_btn(){

}

function bind_on_input_change_events() {
    $('input[name="manual_cartons"].input_change').unbind( "change" );
    $('input[name="manual_cartons"].input_change').change(function (e) {
      sync_row_with_ctn_qty_on_change.call(this)
    });

    $('input[name="manual_cartons"].input_change').unbind( "keyup" );
    $('input[name="manual_cartons"].input_change').keyup(function (e) {
      sync_row_with_ctn_qty_on_change.call(this)
    });
}


function sync_row_with_ctn_qty_on_change(){
  var manual_cartons = $(this).val();
  var td_node = $(this).closest("td");
  var dt = $(this).closest("table").DataTable();
  var current_row = dt.cell(td_node).index()["row"];


  var t_weight_updated = (dt.row(current_row).data()["def_c_weight"] * manual_cartons).toFixed(2)

  var t_volume_updated = (manual_cartons * (dt.row(current_row).data()["def_c_height"] * dt.row(current_row).data()["def_c_length"] * dt.row(current_row).data()["def_c_width"]/1000000)).toFixed(2)

  var def_pcs_per_carton = dt.cell(current_row, "def_pcs_per_carton:name").data()
  var manual_pieces_updated = manual_cartons * ((def_pcs_per_carton !== 0 && def_pcs_per_carton ) ?  def_pcs_per_carton : 1)

  dt.cell(current_row, "t_volume:name").data(t_volume_updated);
  dt.cell(current_row, "t_weight:name").data(t_weight_updated);
  dt.cell(current_row, "manual_pieces:name").data(manual_pieces_updated);

  update_manual_ctn_footer(dt)
}

function calculate_ctns_sum(dt) {
  var sum_ctns = 0;

    dt.rows({page : 'current'}).every( function ( rowIdx, tableLoop, rowLoop ) {

        var manual_cartons = $(dt.cell(this, "manual_cartons:name").node()).find("input").val();
        sum_ctns = sum_ctns + parseInt(manual_cartons)

    });
  return Math.round(sum_ctns)
}

function update_manual_ctn_footer(dt){

    $(dt.column(get_ci_rot["manual_cartons"]).footer()).html(calculate_ctns_sum(dt) + ` ${gettext("ctns.")}`);
    $(dt.column(get_ci_rot["manual_pieces"]).footer()).html(dt.column(get_ci_rot["manual_pieces"], {page : 'current'}).data().sum() + ` ${gettext("pcs.")}`);
    $(dt.column(get_ci_rot["t_volume"]).footer()).html(dt.column(get_ci_rot["t_volume"], {page : 'current'}).data().sum().toFixed(2) + ` ${gettext("cbm")}`);
    $(dt.column(get_ci_rot["t_weight"]).footer()).html(dt.column(get_ci_rot["t_weight"], {page : 'current'}).data().sum().toFixed(2) + ` ${gettext("kg")}`);
}

function PO_from_manual_ctns(){
    var dt = $("#dt_re_order_template_overview").DataTable();
    skus = []
    dt.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        var manual_cartons = $(dt.cell(this, "manual_cartons:name").node()).find("input").val();
        var sku_id = dt.cell(this, "obj_id:name").data();

        if(manual_cartons >0){
            sku = {'sku_id':sku_id, ctns:manual_cartons}
            skus.push(sku)
        }
    });

    $("#overlay").fadeIn("slow");
    data = {
        'action' : 'new_po_from_manual_reot',
        'csrfmiddlewaretoken' : csrfmiddlewaretoken,
        'skus' : JSON.stringify(skus),
        're_order_template_id': re_order_template_id
    }
    $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: data,
    success: function (data) {
        $("#overlay").fadeOut("slow");

        if(data["data"]["new_purchase_order_id"]){
            window.location.href = `${purchase_order_url}${data["data"]["new_purchase_order_id"]}/`;
        }
    }
    })
}

function scale_manual_cartons(){

    target_volume = $("#manual_ctns_scaling_volume").val()

    if (!target_volume || target_volume == ""){
        alert(`${gettext("Please enter your desired scaling volume [CBM]")}`);
        return;
    }

    scale_button = $(this);
    scale_button.prop('disabled', true);
    scale_button.prepend(`<span id="spinner_scale_manual_ctns" class="mr-2 spinner-border spinner-border-sm text-white" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </span>`);

    $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
        'action' : 'scale_manual_ctns_to_volume',
        'csrfmiddlewaretoken' : csrfmiddlewaretoken,
        'target_volume' : target_volume,
        're_order_template_id': re_order_template_id
    },
    success: function (data) {
//        scale_button.prop('disabled', false);
//        $('#spinner_scale_manual_ctns').remove();
//        update_table_with_scaled_quantities(data["data"]["scaled_carton_quantities"]);
//        $('#scale_manual_ctns_modal').modal('hide');
          cache_key = data["data"]["cache_key"]
          setTimeout(function(){
            get_scaled_carton_quantities(cache_key)
          }, 1500)
    }
    })
}

function get_scaled_carton_quantities(cache_key){
    $.ajax({
    method: 'POST',
    url: ajax_call_url,
    data: {
        'action' : 'get_scaled_carton_quantities',
        'csrfmiddlewaretoken' : csrfmiddlewaretoken,
        'cache_key' : cache_key
    },
    success: function (data) {
          if(data["data"]["completed"] == true){
//            scale_button.prop('disabled', false);
            if(data["data"]["error"]){
                alert(data["data"]["error"])
            }else{
                update_table_with_scaled_quantities(data["data"]["scaled_carton_quantities"]);
            }
            $('#spinner_scale_manual_ctns').remove();
            $('#scale_manual_ctns_modal').modal('hide');
            $("#scale_manual_ctns").prop('disabled', false);
          }else{
            setTimeout(function(){
                get_scaled_carton_quantities(cache_key)
            }, 1500)
          }
    }
    })
}

function update_table_with_scaled_quantities(scaled_carton_quantities){
    var dt = $("#dt_re_order_template_overview").DataTable();

    dt.rows().every( function ( rowIdx, tableLoop, rowLoop ) {

        current_row = this;
        dt_row_obj_id = dt.cell(current_row, "obj_id:name").data()

        for (sku of scaled_carton_quantities){

            if(sku["sku_obj_id"] == dt_row_obj_id){
                $(dt.cell(this, "manual_cartons:name").node()).find("input").val(sku["scaled_carton_quantity"]);
                  dt.cell(current_row, "t_volume:name").data(sku["est_scaled_volume"]);
                  dt.cell(current_row, "t_weight:name").data(sku["est_scaled_weight"]);
                  dt.cell(current_row, "manual_pieces:name").data(sku["scaled_pcs_quantity"]);
            }

        }

    });

    update_manual_ctn_footer(dt)
}

function remarks_on_supplier_modal(){

    if(remarks_on_supplier && remarks_on_supplier !== ''){
        $('#remarks_on_supplier_modal').modal('show')
    }
}