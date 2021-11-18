$(document).ready(function () {
  collapsedGroups = {}

  $('#header_cache_button_container').on('click', function (e) {
    refresh_page_cache(page_name="current_stock_overview")
  });
  check_refresh_page_cache_status(page_name="current_stock_overview")

  register_order_neutral()
  register_datatable_sums_functionality()
  bind_on_table_drawn_events()
  bind_tab_switching_functionality()

  if (initial_category !== "None"){
    initialize_dt_current_stock_overview('#dt_current_stock_overview', initial_category)
  }else{
    initialize_dt_current_stock_overview()
  }
});


var change_grouping = true


function get_dt_current_stock_overview_columns() {
  var columns = [
    {"data": "obj_id", "name": "obj_id", className: "select-checkbox pr-0 pl-4 no_export noVis"},
    {"data": "main_ordering", "name": "main_ordering", className: "main_ordering no_export noVis"},
    {"data": "fba_source_marketplace", "name": "fba_source_marketplace", className: "fba_source_marketplace"}];
  $.merge(columns, basic_sku_info_columns);
  $.merge(columns, [
      {"data": "sales_last_30_days_for_calc", "name": "sales_last_30_days_for_calc", className: "dt-center"},
      {"data": "multi_channel_sales",         "name": "multi_channel_sales", className: "multi_channel_sales dt-center"},
      {"data": "sales_last_30_days", "name": "sales_last_30_days", className: ""},
      {"data": "total_reach_in_months_wp", "name": "total_reach_in_months_wp", className: "dt-center"},
      {"data": "total_reach_in_months_wop", "name": "total_reach_in_months_wop", className: "dt-center"},
      {"data": "pcs_total_wh_and_fba", "name": "pcs_total_wh_and_fba", className: "pcs_total_wh_and_fba dt-center"},
      {"data": "wh_pcs_left", "name": "wh_pcs_left", className: "dt-center"},
      {"data": "pcs_on_the_way", "name": "pcs_on_the_way", className: "dt-center"},
      {"data": "reorder_pcs_suggest_raw", "name": "reorder_pcs_suggest_raw", className: "dt-center"},
      {"data": "fba_reach_in_weeks_incl_pending", "name": "fba_reach_in_weeks_incl_pending", className: "dt-center"},
      {"data": "TotalSupplyQuantity", "name": "TotalSupplyQuantity", className: "TotalSupplyQuantity dt-center"},
      {"data": "InStockSupplyQuantity", "name": "InStockSupplyQuantity", className: "InStockSupplyQuantity dt-center"},
      {"data": "fba_pcs_on_the_way", "name": "fba_pcs_on_the_way", className: "dt-center"},
      {"data": "afn_reserved_quantity", "name": "afn_reserved_quantity", className: "afn_reserved_quantity dt-center"},
      {"data": "afn_unsellable_quantity", "name": "afn_unsellable_quantity", className: "afn_unsellable_quantity dt-center"},
      {
        "data": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        "name": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        className: "dt-center"
      },
      {"data": "est_stock_value_EUR", "name": "est_stock_value_EUR", className: "est_stock_value_EUR dt-center"},
      {"data": "est_fba_stock_value_EUR", "name": "est_fba_stock_value_EUR", className: "est_fba_stock_value_EUR dt-center"},
      {"data": "est_pcs_in_stock_stock_value_EUR", "name": "est_pcs_in_stock_stock_value_EUR", className: "est_pcs_in_stock_stock_value_EUR dt-center"},
      {"data": "est_pcs_on_the_way_stock_value_EUR", "name": "est_pcs_on_the_way_stock_value_EUR", className: "est_pcs_on_the_way_stock_value_EUR dt-center"},
      {"data": "avg_landed_cost_EUR", "name": "avg_landed_cost_EUR", className: "avg_landed_cost_EUR dt-center"},
      {"data": "def_pcs_per_carton", "name": "def_pcs_per_carton", className: "def_pcs_per_carton dt-center"},
      {"data": "fba_size_category", "name": "fba_size_category", className: "fba_size_category dt-center"},
      { "name": "actions", className: "actions text-center noVis no_export"},
  ]);

  return columns
}


function initialize_dt_current_stock_overview(dt_id='#dt_current_stock_overview', category="") {


  var columns = get_dt_current_stock_overview_columns();
  get_ci_cs = create_column_map(columns);
  dt_current_stock_overview_config = get_dt_current_stock_overview_config(dt_id, category)

  dt_current_stock_overview_config["columns"] = columns;
  $.extend(dt_current_stock_overview_config, def_dt_settings_for_scroller);
  dt_current_stock_overview_config["scrollY"] = "78vh";
  dt_current_stock_overview_config["paging"] = true;
  dt_current_stock_overview_config["lengthMenu"] = [[300, 500, 1000, -1], [300, 500, 1000, "All"]];
  var table = $(dt_id).DataTable(dt_current_stock_overview_config);

   $(dt_id).find("tbody").on('click', 'tr.dtrg-start',function(){
        var name = $(this).data('name');
        collapsedGroups[dt_id][name] = !collapsedGroups[dt_id][name];
        table.draw(false);
    });

  $(".expand-all").click(function(){
       $("tr.dtrg-start").each(function(){
           if ($(this).hasClass("collapsed")==true){
             var names = $(this).attr("data-name");
             collapsedGroups[dt_id][names] = !collapsedGroups[dt_id][names];
             table.draw(false);
           }
       });
  });

  $(".collapse-all").click(function(){
    $("tr.dtrg-start").each(function(){
           if ($(this).hasClass("collapsed")==false){
             var names = $(this).attr("data-name");
             collapsedGroups[dt_id][names] = !collapsedGroups[dt_id][names];
             table.draw(false);
           }
       });
  });

  if (dt_id !== '#dt_current_stock_overview') {
    $(dt_id).on('draw.dt', function () {
      $(dt_id).DataTable().columns.adjust();
    });

  }

}




function get_dt_current_stock_overview_config(dt_id='#dt_current_stock_overview' , category="") {
  collapsedGroups[dt_id] = {};
  var top = '';
  var default_grouping = "";

  return {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_current_stock_overview",
        "category": category,
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },
    },
    "processing": true,
    rowGroup: {
      dataSrc: ["main_ordering"],
      endRender: function (rows, group, level) {
          $('[data-toggle="tooltip"]').tooltip({container:"body"});
          $('[data-toggle="tooltip"]').on('click', function () {
            $(this).tooltip('hide')
          });
      },
      startRender: function (rows, group, level) {
        var all;

        if (level === 0) {
          top = group;
          all = group;
        } else {
          // if parent collapsed, nothing to do
          if (!!collapsedGroups[dt_id][top]) {
            return;
          }
          all = top + group;
        }

        var collapsed = !!collapsedGroups[dt_id][all];

        rows.nodes().each(function (r) {
          r.style.display = collapsed ? 'none' : '';
        });

        sums_dict = calculate_group_sums(rows)

        if (level === 0) {

          if (rows.data()[0]["Parent_ASIN"] === "n/a"){
            var parent_asin = rows.data()[0]["ASIN"]
          } else {
            var parent_asin = rows.data()[0]["Parent_ASIN"]
          }
           var non_fba_sales = ""
           if(sums_dict["sum_weighted_sales_non_fba"] > 0){
                non_fba_sales = `<span class="text-secondary" title="${gettext('Sum of weighted sales in group on non-FBA channels')}" data-toggle="tooltip">&nbsp;(+${sums_dict["sum_weighted_sales_non_fba"]})</span>`
           }
          return $('<tr></tr>')
            .append(`<td colspan="100%">
                                  <div class="d-flex align-items-center">
                                    <span class="mr-3 ml-1 "><img src="${rows.data()[0]['small_image_url']}" width="44px" height="44px"/></span>
                                    <span class="mr-auto">
                                      <div class="d-flex">${rows.data()[0]["cat_product_type"]} - <a class="mx-1" target="_blank" href="${get_img_url_base(rows.data()[0]["fba_source_marketplace"][1])}/dp/${parent_asin}">${parent_asin}</a> (${rows.count()})</div>
                                      <div style="font-weight: lighter" class="d-flex">
                                        <span title="${gettext("Sum of weighted sales in group")}" data-toggle="tooltip" data-placement="bottom">${gettext("Sales")}: ${sums_dict["sum_weighted_sales"]}</span>
                                        ${non_fba_sales}
                                        <span class="mx-1" title="Unit">[${gettext("pcs")}/${current_stock_table_weighted_sales_unit}]</span>
                                        <span class="mx-2">|</span>
                                        <span class="mr-1 " title="${gettext("Average total reach (excl. re-ordered), weighted by sales. NOTE: SKUs with 0 sales e.g. due to no stock will be weighted by 0 and therefore not considered.")}" data-toggle="tooltip" data-placement="bottom">&Oslash; ${gettext("Reach")}:</span>
                                        <span>${sums_dict["avg_weighted_total_reach_wop"]}</span>
                                        <span class="mx-1" title="${gettext("Unit")}"> [${current_stock_table_total_reach_wop_unit}]</span>
                                        <span class="mx-2">|</span>
                                        <span class="mr-1 " title="${gettext("Percentage of SKUs that are out-of-stock (OOS)")}" data-toggle="tooltip" data-placement="bottom">${gettext("OOS")}:</span>
                                        <span>${sums_dict["sku_oos_perc"]}</span>
                                        <span class="mx-1" title="Unit">%</span>
                                        <span class="mx-2">|</span>
                                        <div data-html="true" 
                                            title="${gettext("Estimated total capital bound in stock. Thereof:")}<br>${sums_dict["sum_est_fba_stock_value_EUR"]}${main_currency_sign} ${gettext("FBA stock")} |  ${sums_dict["sum_est_pcs_in_stock_stock_value_EUR"]}${main_currency_sign} ${gettext("in WH")} |  ${sums_dict["sum_est_pcs_on_the_way_stock_value_EUR"]}${main_currency_sign} ${gettext("on the way")}"
                                            data-toggle="tooltip" 
                                            data-placement="bottom">
                                          <span class="mr-1" >${gettext("Bound Capital")}:</span>
                                          <span style="border-bottom: 1px dotted; cursor: pointer;">${format_number(sums_dict["sum_est_stock_value_EUR"],0)}</span>
                                          <span class="mx-1" title="${gettext("Unit")}">${main_currency_sign}</span>
                                        </div>
                                      </div>
                                    </span>
                                  </div>
                                  </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        } else if (level === 1 | level === 2) {
           var non_fba_sales = ""
           if(sums_dict["sum_weighted_sales_non_fba"] > 0){
                non_fba_sales = `<span class="text-secondary" title="${gettext('Sum of weighted sales in group on non-FBA channels')}" data-toggle="tooltip">&nbsp;(+${sums_dict["sum_weighted_sales_non_fba"]})</span>`
           }
          return $('<tr></tr>')
            .append(`<td colspan="100%">
                              <div style="font-weight: lighter" class="d-flex text-dark">
                                <span class="text-dark"><strong>${group}</strong></span>
                                <span class="mx-2">|</span>
                                <span title="${gettext("Sum of weighted sales in group")}" data-toggle="tooltip" data-placement="bottom">Sales: ${sums_dict["sum_weighted_sales"]}</span>
                                ${non_fba_sales}
                                <span class="mx-1" title="Unit">[${gettext("pcs")}/${current_stock_table_weighted_sales_unit}]</span>
                                <span class="mx-2">|</span>
                                <span class="mr-1 " title="${gettext("Average total reach (excl. re-ordered), weighted by sales. NOTE: SKUs with 0 sales e.g. due to no stock will be weighted by 0 and therefore not considered.")}" data-toggle="tooltip" data-placement="bottom">&Oslash; ${gettext("Reach")}:</span>
                                <span>${sums_dict["avg_weighted_total_reach_wop"]}</span>
                                <span class="mx-1" title="${gettext("Unit")}"> [${current_stock_table_total_reach_wop_unit}]</span>
                                <span class="mx-2">|</span>
                                <span class="mr-1 " title="${gettext("Percentage of SKUs that are out-of-stock (OOS)")}" data-toggle="tooltip" data-placement="bottom">${gettext("OOS")}:</span>
                                <span>${sums_dict["sku_oos_perc"]}</span>
                                <span class="mx-1" title="${gettext("Unit")}">%</span>
                                <span class="mx-2">|</span>
                                <span class="mr-1 " data-html="true" title="${gettext("Estimated total capital bound in stock. Thereof:")}<br>${sums_dict["sum_est_fba_stock_value_EUR"]}${main_currency_sign} ${gettext("FBA stock")} |  ${sums_dict["sum_est_pcs_in_stock_stock_value_EUR"]}${main_currency_sign} ${gettext("in WH")} |  ${sums_dict["sum_est_pcs_on_the_way_stock_value_EUR"]}${main_currency_sign} ${gettext("on the way")}" data-toggle="tooltip" data-placement="bottom">${gettext("Bound Capital")}:</span>
                                <span>${sums_dict["sum_est_stock_value_EUR"]}</span>
                                <span class="mx-1" title="${gettext("Unit")}">${main_currency_sign}</span>
                              </div>
                                    
                                  </td>`).attr('data-name', all).toggleClass('collapsed', collapsed);
        }
      }
    },

    "order": [[get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_color"], "asc"], [get_ci_cs["cat_size"], "asc"], [get_ci_cs["cat_product_type"], "asc"],[get_ci_cs["sku"], "asc"]],
    orderFixed: [[get_ci_cs["main_ordering"], 'asc']],
    dom: "<'row mt-1'<'col-sm-12 col-md-9 mb-2 'B><'col-sm-12 col-md-3'f>>" +
      "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>" +
      "<'row'<'col-sm-12 col-md-12'l>>",
    "columnDefs": [
      {
        "visible": false,
        "targets": [
          "main_ordering",
          "fba_source_marketplace",
          "pcs_total_wh_and_fba",
          "small_image_url",
          "variation_name",
          "amz_title",
          "FNSKU",
          "ASIN",
          "Parent_ASIN",
          "cat_product_type",
          "cat_size",
          "cat_color",
          "cat_shape",
          "total_reach_in_months_wop",
          "def_pcs_per_carton",
          "InStockSupplyQuantity",
          "fba_pcs_on_the_way",
          "pcs_on_the_way",
          "est_stock_value_EUR",
          "avg_landed_cost_EUR",
          "est_fba_stock_value_EUR",
          "est_pcs_in_stock_stock_value_EUR",
          "est_pcs_on_the_way_stock_value_EUR",
          "afn_reserved_quantity",
          "afn_unsellable_quantity",
          "fba_size_category",
          "multi_channel_sales",
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
        "targets": "fba_source_marketplace",
        "data": "fba_source_marketplace",
        // "orderable": false,
        "render": function (data, type, row) {
          if (type === 'display') {
            return data[0]
          }
          else {
            return data[1]
          }
        },
      },

      {
        "targets": "small_image_url",
        "data": "small_image_url",
        "width": "20px",
        "orderable": false,
        "createdCell": function (td, cellData, rowData, row, col) {
          // $(td).addClass("p-0")
        },
        "render": function (data, type, row) {
          return `<div class="d-flex justify-content-center m-0"><img
                        src="${row["small_image_url"]}"
                        data-toggle="popover-hover"
                        data-img="${row["small_image_url"]}"
                        style="cursor: pointer" 
                        onclick="redirect_blank('${get_img_url_base(row["fba_source_marketplace"][1])}/dp/${row["ASIN"]}')"
                        width="35px" 
                        height="35px"
                        >
                    </div>`
        },
      },

      {
        "targets": "variation_name",
        "data": "variation_name",
        "render": function (data, type, row) {
          return `<div data-toggle="popover-hover" data-img="${row["small_image_url"]}" style="cursor: pointer" onclick="redirect_blank('${get_img_url_base(row["fba_source_marketplace"][1])}/dp/${row["ASIN"]}')">${row["variation_name"]}</div>`
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
              row["child_sku_dict_list"].forEach(function (arrayItem) {
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
                      onclick="redirect_blank('${get_img_url_base(row["fba_source_marketplace"][1])}/dp/${row["ASIN"]}')"></i>
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
        "targets": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        "data": "fba_suggested_send_in_pcs_without_max_allowed_limit",
        "type": "num",
        "render": function (data, type, row) {
          if (type === 'display') {
            var div_c = $(`<div class="d-flex justify-content-center align-items-center" data-search="fba_send_in"
                            onclick="open_popover_fba_suggested_send_in_calc_table.call(this, ${row["obj_id"]}, '${row["fba_source_marketplace"][1]}')" style="cursor: pointer"></div>`)

            if (row["max_allowed_send_in_pcs"] < row["fba_suggested_send_in_pcs_without_max_allowed_limit"]) {
              $(div_c).append(`<span class="text-danger mr-1" title="${gettext("Limit e.g. due to COVID19 restrictions ")}">
                                ${row["max_allowed_send_in_pcs"]}</span>`);

              $(div_c).append(`<span class="text-secondary mr-1" 
                                    style="border-bottom: 1px dotted;"
                                    title="${gettext("Actually suggested pcs for send in")}">
                                    (${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]})
                                </span>`);

              if (row["max_allowed_send_in_pcs"] < row["def_pcs_per_carton"]) {
                $(div_c).append(`<span class="text-danger">
                                    <i class="fas fa-exclamation-triangle" 
                                    title="Default carton size of ${row["def_pcs_per_carton"]} pcs is larger than the max. allowed amount for send-in of ${row["max_allowed_send_in_pcs"]} pcs."></i></span>`)
              }

            } else {

              $(div_c).append(`<div class="d-flex justify-content-center align-items-center" style="border-bottom: 1px dotted;">
                                        <span>${row["fba_suggested_send_in_pcs_without_max_allowed_limit"]}</span>
                                    </div>`)
            }

            if (row["auto_send_in_suggestion"] !== "enabled") {
              $(div_c).append(`<span class="text-danger ml-1"> <i class="fas fa-minus-circle" title="${gettext("Auto fba send-in suggestion is disabled.")}"></i></span>`)
            }

            if (row["forecasting_enabled"] === 0) {
              $(div_c).prepend(`<span class="text-info mr-1">
                                    <i class="fa fa-chart-line" 
                                    data-toggle="tooltip"
                                    onclick="window.location='${forecast_mgmt_url}${row["obj_id"]}'" 
                                    title="${gettext("Advanced forecasting is enabled")}"></i>
                                </span>`)
            }

            return div_c.prop('outerHTML');

          } else {
            if (Number.isNaN(parseFloat(data))) {
                if (type === 'export') {
                return "???"
              } else {
                return 0
              }
            } else {
              return parseFloat(data)
            }
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
                if (type === 'export') {
                return "???"
              } else {
                return 0
              }
            } else {
              return parseFloat(data)
            }
          }
        },
      },

      {
        "targets": "total_reach_in_months_wop",
        "data": "total_reach_in_months_wop",
        "type": "num",
        "createdCell": function (td, cellData, rowData, row, col) {
          reach_cat_td_coloring_and_title(td, rowData["wh_and_fba_wop_cat"])
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
                if (type === 'export') {
                return "???"
              } else {
                return 0
              }
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
                return `<!--<div class="badge py-2" data-toggle="tooltip" style="width: 90%">${data} | ${row["days_until_ideal_fba_send_in_date"]} d</div>-->`
              }


          } else {
            if (Number.isNaN(parseFloat(data))) {
              if (type === 'export') {
                return "???"
              } else {
                return 0
              }
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
<!--                            <div class="pr-2 pl-2"> <a target="_blank" href="${get_img_url_base(row["fba_source_marketplace"][1])}/dp/${row["ASIN"]}" class="text-nowrap text-secondary"><i class="fab fa-amazon text-secondary mr-1" title="View listing on Amazon" style="cursor: pointer"></i>View listing on Amazon</a></div>-->
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
        "type": "num",

        "render": function (data, type, row) {
          if (type === 'display') {
            var div_c = $(`<div class="d-flex justify-content-end align-items-center " 
                          width="100%"></div>`);

            var sales_velocity_number_span = $(`<span class="ml-2 mt-1 " style="white-space: nowrap">
                                                    <span
                                                      onclick="open_popover_weighted_sales_velocity_calc_table.call(this, 
                                                      ${row["obj_id"]}, 
                                                      '${row['fba_source_marketplace'][1]}', 
                                                      )"
                                                      style='cursor: pointer'>
                                                        <strong>${row["sales_last_30_days_for_calc"]}</strong>
                                                    </span>
                                                </span>`);

            if (row["sales_last_30_days_for_calc_NON_FBA"] !== 0){
              var non_fba_sales_c = $(`<span class="text-secondary" title="${gettext('Sales on non-FBA channels')}" data-toggle="tooltip">
                                       (+${row["sales_last_30_days_for_calc_NON_FBA"]})
                                    </span>
                                          `);
               $(sales_velocity_number_span).append(non_fba_sales_c);
            }

            var sales_trend_icon_span = $(`<span class="mr-3 ml-2" style="font-size: x-large">
                                              ${map_icon_to_sales_trend(row["sales_trend"])}
                                            </span>`);

            $(div_c).append(sales_velocity_number_span);
            $(div_c).append(sales_trend_icon_span);


            return div_c.prop('outerHTML');

          } else {
            return parseFloat(data)
          }
        },
      },
      {
        "data": "multi_channel_sales",
        "targets": "multi_channel_sales",
        "render": function (data, type, row) {
          if (type === 'display') {
            var div_c = $(`<div class="d-flex justify-content-start align-items-center px-2" 
                            width="100%"></div>`);
            $.each(data, function (i, el) {
              div_c = append_separate_multi_channel_sales(row, div_c, el, i);
            });

            return div_c.prop('outerHTML');
          } else {
            var sum_sales = 0;
            $.each(data, function (i, el) {
              sum_sales = sum_sales + data["sales_last_30_days_for_calc"];
            });
            return sum_sales
          }
        }
      },
      {
        "targets": "sales_last_30_days",
        "data": "sales_last_30_days",
        // "width": "11rem",
        "orderable": false,
        "render": function (data, type, row) {
          var unit = current_stock_table_sales_velocity_reach_unit;
          if (row["sales_last_30_days_manual"] === 0) {
            var manual_sales_input = " - "
          } else {
            var manual_sales_input = `(${row["sales_last_30_days_manual"]})`
          }
          return `<div class="row px-1" style="width: 18rem;  white-space: nowrap" title="${gettext("Based on sales from the last: 3 days / 7 days / 30 days / 90 days / 180 days (manual sales input)")}" >
                                <span class="col-2 px-0 text-center border-right-separator" title="${gettext("Estimated sales velocity based on sales data from the last 3 days")}">${row["sales_last_3_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" title="${gettext("Estimated sales velocity based on sales data from the last 7 days")}">${row["sales_last_7_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" title="${gettext("Estimated sales velocity based on sales data from the last 30 days")}">${row["sales_last_30_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" title="${gettext("Estimated sales velocity based on sales data from the last 90 days")}">${row["sales_last_90_days"]}</span>
                                
                                <span class="col-2 px-0 text-center border-right-separator" title="${gettext("Estimated sales velocity based on sales data from the last 180 days")}">${row["sales_last_180_days"]}</span>
                                <span class="col-2 px-0 text-center" title="${gettext("Manually provided sales velocity")}">${manual_sales_input}</span>
                            </div>`
        },
      },
      {
        "targets": "reorder_pcs_suggest_pcs",
        "type": "num",
        "data": "reorder_pcs_suggest_raw",

        "render": function (data, type, row) {
          if (type === 'display') {
              return get_re_order_suggestion_pcs_cell_content(row);

          } else {
            if (Number.isNaN(parseInt(data))) {
                if (type === 'export') {
                return "???"
              } else {
                return 0
              }
            } else {
              return parseInt(data)
            }
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
                               onClick="open_popover_fba_stock_detail_table.call(this, '${row["obj_id"]}', '${row["fba_source_marketplace"][1]}')"
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
          }
          else if (type === 'export') {
            return parseInt(row["TotalSupplyQuantity"])
          } else {
            return parseInt(row["TotalSupplyQuantity"])
          }
        },
      },

      {
        "targets": "wh_pcs_left",
        "type": "num",
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
          } else if (type === 'export') {
            return parseInt(data)
          } else {
            return parseInt(data)
          }
        },
      },

    ],

    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: '<i class="fas fa-columns"></i> ' + gettext("Select Columns"),
      },
      {
        extend: 'collection',
        text: '<i class="fas fa-th-list mr-1"></i> ' + gettext("Modify Grouping"),
        buttons: [
          {
            text: gettext('by Color'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Color")}
          },
          {
            text: gettext('by Size'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Size")}
          },
          {
            text: gettext('by Shape'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Shape")}
          },
          {
            text: gettext('by Shape & Color'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Shape & Color")}
          },
          {
            text: gettext('by Shape & Size'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Shape & Size")}
          },
          {
            text: gettext('by Product Type & Parent ASIN (default)'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Product Type & Parent ASIN (default)")}
          },
          {
            text: gettext('by Product Type only'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="by Product Type only")}
          },
          {
            text: gettext('No Grouping'),
            action: function (e, dt, node, config) {btn_group_dt_rows(dt, grouping_descr="No Grouping")}
          },
          {text: '<hr class="p-0 m-0">',},
          {
            text: '<i class="far fa-save mr-2"></i>' + gettext('Save current row grouping'),
            action: function (e, dt, node, config) {
              save_current_stock_table_grouping()
              dt_button_collection_close()
            }
          },

        ]
      },

      {
        extend: 'collection',
        text: '<i class="fas fa-file-export mr-1"></i>' + gettext("Export"),
        buttons: [

          {
            extend: 'copy',
            text: gettext('Copy to Clipboard'),
            exportOptions: {
              columns: 'th:not(.no_export)',
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
          {
            extend: 'csv',
            text: 'CSV',
            exportOptions: {
              columns: 'th:not(.no_export)',
              orthogonal: 'export',
            }
          },
        ]
      },

      {
        extend: 'collection',
        text: '<i class="fas fa-ellipsis-v mr-1"></i>' + gettext("Actions"),
        buttons: [

          {
            text: `<i class="far fa-edit text-secondary mr-1"></i>${gettext("Batch edit selected SKUs")}`,
            action: function (e, dt, node, config) {
              initiate_bulk_update_modal(dt_id)
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="far fa-eye-slash text-secondary mr-1"></i>${gettext('Set selected SKUs to "discontinued"')}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('batch_discontinued', dt=dt);
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="fas fa-dolly text-secondary mr-1"></i>${gettext("Create FBA Send-in from selected")}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('fba_send_in_from_selected', dt=dt);
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="fas fa-magic text-secondary mr-1"></i>${gettext("Use Mixed Carton FBA-Prep. Configurator for selected")}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('mixed_carton_configurator_from_selected', dt=dt);
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="fas fa-magic text-secondary mr-1"></i>${gettext("Use Mixed Carton FBA-Prep. Configurator for selected (source from Loose Stock)")}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('mixed_carton_configurator_from_selected_source_from_loose_stock', dt=dt);
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="fas fa-magic text-secondary mr-1"></i>${gettext("Convert Loose Stock to Plain Cartons for FBA Send-in")}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('plain_cartons_from_selected_for_fba_send_in_from_loose_stock', dt=dt);
              dt_button_collection_close()
            }
          },
          {
            text: `<i class="fas fa-ship text-secondary mr-1"></i>${gettext("Create new purchase order from selected")}`,
            action: function (e, dt, node, config) {
              current_stock_overview_table_batch_actions('purchase_order_from_selected', dt=dt);
              dt_button_collection_close()
            }
          },
        ]
      },
      {
        text: `<div data-toggle="tooltip" title="${gettext("Expand all")}"><i class="fas fa-plus-square "></i></div>`,
        className:'expand-all',
      },
       {
        className:'collapse-all',
        text: `<div data-toggle="tooltip" title="${gettext("Collapse all")}"><i class="fas fa-minus-square "></i></div>` ,
      },

            {
        extend: 'collection',
        text: '<i class="fas fa-filter mr-1"></i>',
        buttons: [

          {
            text: `<strong>${gettext("OOS Filter")}:</strong>`,
          },
          {
            text: `<div class="d-flex">
                    <div><i class="fa fa-warehouse text-secondary mr-2"></i>
                    </div>
                    <div class="text-light">
                        +<i class="fa fa-ship mx-1"></i>
                    </div>
                    ${gettext("In Warehouse")}
                    </div>`,
            action: function (e, dt, node, config) {
              clear_custom_filters(dt)
              dt.column(get_ci_cs["wh_pcs_left"]).search("^0$", regex=true, smart=false).draw();
              dt_button_collection_close()
            }
          },
          {
            text: `<div class="d-flex">
                    <div><i class="fa fa-warehouse text-secondary mr-2"></i>
                    </div>
                    <div class="text-secondary">
                        +<i class="fa fa-ship mx-1"></i>
                    </div>
                    ${gettext("In Warehouse & On the Way")}
                    </div>`,
            action: function (e, dt, node, config) {
              clear_custom_filters(dt)
              dt.column(get_ci_cs["wh_pcs_left"]).search("^0$", regex=true, smart=false).draw();
              dt.column(get_ci_cs["pcs_on_the_way"]).search("^0$", regex=true, smart=false).draw();
              dt_button_collection_close()
            }
          },
          {
            text: `<div class="d-flex">
                    <div><i class="fab fa-amazon text-secondary mr-2"></i>
                    </div>
                    <div class="ml-1 text-light">
                        +<i class="fa mr-2 fa-dolly mx-1"></i>
                    </div>
                    ${gettext("FBA available")}
                    </div>`,
            action: function (e, dt, node, config) {
              clear_custom_filters(dt)
              dt.column(get_ci_cs["TotalSupplyQuantity"]).search("^0$", regex=true, smart=false).draw();
              dt_button_collection_close()
            }
          },
          {
            text: `<div class="d-flex">
                    <div><i class="fab fa-amazon text-secondary mr-2"></i>
                    </div>
                    <div class="ml-1 text-secondary">
                        +<i class="fa mr-2 fa-dolly mx-1"></i>
                    </div>
                    ${gettext("FBA available & On the Way")}
                    </div>`,
            action: function (e, dt, node, config) {
              clear_custom_filters(dt)
              dt.column(get_ci_cs["TotalSupplyQuantity"]).search("^0$", regex=true, smart=false).draw();
              dt.column(get_ci_cs["InStockSupplyQuantity"]).search("^0$", regex=true, smart=false).draw();
              dt_button_collection_close()
            }
          },
                  {
            text: '<hr class="p-0 m-0">',
          },
          {
            text: `<i class="fa fa-undo text-secondary mr-1"></i>${gettext("Clear Filters")}`,
            action: function (e, dt, node, config) {
              clear_custom_filters(dt)
            }
          },

        ]
      },

    ],
    stateLoadParams: function (settings, data) {
      data.columns[get_ci_cs["wh_pcs_left"]].search = {search: "", smart: true, regex: false, caseInsensitive: true};
      data.columns[get_ci_cs["pcs_on_the_way"]].search = {search: "", smart: true, regex: false, caseInsensitive: true};
      data.columns[get_ci_cs["TotalSupplyQuantity"]].search = {search: "", smart: true, regex: false, caseInsensitive: true};
      data.columns[get_ci_cs["InStockSupplyQuantity"]].search = {search: "", smart: true, regex: false, caseInsensitive: true};
    },
    "stateSaveParams" : function (settings, data) {data.search.search = "";},
    drawCallback: function (dt) {
      bind_image_popover_hover_trigger()
      var search_value = $('#dt_current_stock_overview_filter input').val();
      var api = this.api();
      if(api.page.info().pages === 0){
        $(".dataTables_empty").html(gettext('No Matching record found for') + ": <span class='text-danger' style='font-weight: bold; '>" +" " + search_value + "</span>")
      }
    },
    "createdRow": function (row, data, dataIndex) {
      console.log(data["is_parent_sku"])
      if(data["is_parent_sku"]){
        $(row).addClass("parent_sku_row")
      }
    },
  };
}

function clear_custom_filters(dt) {
  dt.column(get_ci_cs["wh_pcs_left"]).search("").draw();
  dt.column(get_ci_cs["pcs_on_the_way"]).search("").draw();
  dt.column(get_ci_cs["TotalSupplyQuantity"]).search("").draw();
  dt.column(get_ci_cs["InStockSupplyQuantity"]).search("").draw();
}


function bind_on_table_drawn_events(dt_id='#dt_current_stock_overview',) {
  // $(dt_id).on('draw.dt', function () {

  $('.dt_current_stock_overview_tables').on('draw.dt', function () {
    if (current_stock_table_grouping !== "by Product Type & Parent ASIN (default)" && $(this).data("change_grouping")) {
    // console.log( $(this).attr("id"))
      $(this).data("change_grouping", false)
      dt = $(this).DataTable()
      group_dt_rows(dt, grouping_descr = current_stock_table_grouping)
    }
    $('[data-toggle="tooltip"]').tooltip({container:"body", trigger : 'hover'});

      $('[data-toggle="tooltip"]').on('click', function () {
        $(this).tooltip('hide')
      });
  });
}


function bind_tab_switching_functionality() {
  $('#tab-list a').on('click', function (e) {
    e.preventDefault();
    add_switch_tabs_functionality.call(this)
  });
}

function add_switch_tabs_functionality() {
  $(this).tab('show');
  var dt_id =  $(this).data('dt_id');
  var category =  $(this).data('category');

  if (dt_id !== "#dt_current_stock_overview") {
    if (!$.fn.DataTable.isDataTable(dt_id)) {
      bind_on_table_drawn_events(dt_id);
      initialize_dt_current_stock_overview(dt_id, category)
    } else {
      $(dt_id).DataTable().ajax.reload();
    }
  }
}

function bind_image_popover_hover_trigger() {
  $('[data-toggle="popover-hover"]').popover({
    html: true,
    trigger: 'hover',
    placement: 'right',
    content: function () {
      return '<img height="80px" src="' + $(this).data('img') + '" />';
    }
  });
}

function save_current_stock_table_grouping(grouping_descr) {
  $.ajax({
    method:'POST',
    url:ajax_call_url,
    data: {
      "grouping_descr" : current_stock_table_grouping,
      "action": "save_current_stock_table_grouping",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success:function(){
      alert(gettext("Grouping saved!"))
    },
    error:function(){
      alert(gettext("Error. Row grouping could not be saved."))
    }
  })
}

function btn_group_dt_rows(dt, grouping_descr) {
  // change_grouping = true
  current_stock_table_grouping = grouping_descr
  group_dt_rows(dt, grouping_descr)
}

function group_dt_rows(dt, grouping_descr) {
    dt.rowGroup().disable();
    dt.order.neutral().draw();

  if(grouping_descr === "No Grouping"){
    dt.order.fixed({pre: [get_ci_cs["actions"], 'asc']}).draw()
    dt.order([ get_ci_cs["sales_last_30_days_for_calc"], 'desc' ]).draw()
    $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "0em")

  }
  else if (grouping_descr === "by Product Type only"){
    dt.rowGroup().enable();
    dt.rowGroup().dataSrc(["cat_product_type"]);
    dt.order([get_ci_cs["sku"], "asc"]).order.fixed({pre: [get_ci_cs["cat_product_type"], 'asc']}).draw()
    $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "1em")
  }
  else if (grouping_descr === "by Product Type & Parent ASIN (default)"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering"]);
              dt.order([get_ci_cs["sku"], "asc"]).order.fixed({pre: [get_ci_cs["main_ordering"], 'asc']}).draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "1em")
  }
  else if (grouping_descr === "by Shape & Size"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape", "cat_size"]);
              dt.order([get_ci_cs["cat_product_type"], "asc"], [get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_shape"], "asc"], [get_ci_cs["cat_size"], "asc"])
              dt.draw()
              $("tr.dtrg-level-1 td").css("font-weight", "bold")
              $("tr.dtrg-level-2 td").css("padding-left", "3em")
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "4em")
  }
  else if (grouping_descr === "by Shape & Color"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape", "cat_color"]);
              dt.order([get_ci_cs["cat_product_type"], "asc"], [get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_shape"], "asc"], [get_ci_cs["cat_color"], "asc"])
              dt.draw()
              $("tr.dtrg-level-1 td").css("font-weight", "bold")
              $("tr.dtrg-level-2 td").css("padding-left", "3em")
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "4em")
  }
  else if (grouping_descr === "by Shape"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_shape"]);
              dt.order([get_ci_cs["cat_product_type"], "asc"], [get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_shape"], "asc"])
              dt.draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
  }
  else if (grouping_descr === "by Size"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_size"]);
              dt.order([get_ci_cs["cat_product_type"], "asc"], [get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_size"], "asc"]);
              dt.draw();
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
  }
  else if (grouping_descr === "by Color"){
              dt.rowGroup().enable();
              dt.rowGroup().dataSrc(["main_ordering", "cat_color"]);
              dt.order([get_ci_cs["cat_product_type"], "asc"], [get_ci_cs["Parent_ASIN"], "asc"], [get_ci_cs["cat_color"], "asc"])
              dt.draw()
              $("tr.odd td:first-child, tr.even td:first-child").css("padding-left", "3em")
  }


}


function get_unique_row_data(rows){

  var unique_identifier = [];
  var unique_rows = [];
    $.each(rows.data(), function(i, el){
        if($.inArray(el["sku"], unique_identifier) === -1){
          unique_identifier.push(el["sku"]);
          unique_rows.push(el);
        }
    });

  return unique_rows
}

function calculate_group_sums(rows) {
  var unique_rows = get_unique_row_data(rows);

  var sum_weighted_sales = rows.data().pluck("sales_last_30_days_for_calc").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_weighted_sales_non_fba = rows.data().pluck("sales_last_30_days_for_calc_NON_FBA").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_est_fba_stock_value_EUR = rows.data().pluck("est_fba_stock_value_EUR").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);


  var sum_est_pcs_in_stock_stock_value_EUR = unique_rows.map(function(a) {return a.est_pcs_in_stock_stock_value_EUR;}).reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_est_pcs_on_the_way_stock_value_EUR = unique_rows.map(function(a) {return a.est_pcs_on_the_way_stock_value_EUR;}).reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_est_stock_value_EUR = sum_est_pcs_in_stock_stock_value_EUR +sum_est_pcs_on_the_way_stock_value_EUR + sum_est_fba_stock_value_EUR;

  var cum_weighted_total_reach_wop = 0;
  rows.every( function ( rowIdx, tableLoop, rowLoop ) {
    if(Number.isNaN(this.data()["sales_last_30_days_for_calc"] * this.data()["total_reach_in_months_wop"])){}
    else{
      cum_weighted_total_reach_wop = cum_weighted_total_reach_wop  + this.data()["sales_last_30_days_for_calc"] * this.data()["total_reach_in_months_wop"]
    }
  } );

  var sku_count_total = rows.count();
  var sku_count_oos = 0;
  rows.every(function (rowIdx, tableLoop, rowLoop) {
    if (this.data()["total_reach_in_months_wop"] === 0) {
      sku_count_oos = sku_count_oos + 1
    } else {
    }
  });

  return {
    "sum_weighted_sales": Math.round(sum_weighted_sales * 10) / 10,
    "sum_weighted_sales_non_fba": Math.round(sum_weighted_sales_non_fba * 10) / 10,
    "avg_weighted_total_reach_wop": Math.round(cum_weighted_total_reach_wop / sum_weighted_sales * 10) / 10,
    "sku_oos_perc": Math.round(sku_count_oos / sku_count_total * 100),
    "sum_est_stock_value_EUR": Math.round(sum_est_stock_value_EUR),
    "sum_est_fba_stock_value_EUR": Math.round(sum_est_fba_stock_value_EUR),
    "sum_est_pcs_in_stock_stock_value_EUR": Math.round(sum_est_pcs_in_stock_stock_value_EUR),
    "sum_est_pcs_on_the_way_stock_value_EUR": Math.round(sum_est_pcs_on_the_way_stock_value_EUR),
  }
}


function initiate_bulk_update_modal(dt_id) {
  dt = $(dt_id).DataTable()
  var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    return dt.cell(row_indexes, "obj_id:name").data()
  })

  $('input[name="obj_ids"]').val(obj_ids_list);
  $('input[name="redirect_url"]').val(redirect_url);
  $('#sku_bulk_update_modal').modal('show')

}

jQuery.extend(jQuery.fn.dataTableExt.oSort, {
  "formatted-num-pre": function (a) {
    a = (a === "-" || a === "") ? 0 : a.replace("/[^\d\-\.]/g", "");
    return parseFloat(a);
  },

  "formatted-num-asc": function (a, b) {
    return a - b;
  },

  "formatted-num-desc": function (a, b) {
    return b - a;
  }
});

function current_stock_overview_table_batch_actions(action, dt=null) {
  if (dt===null){
    dt = $("#dt_current_stock_overview").DataTable();
  }
  var obj_ids_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
    return dt.cell(row_indexes, "obj_id:name").data()
  })

  console.log(obj_ids_list);

  if (action === "batch_discontinued") {
    var data = {
      'action': "batch_update_skus",
      't_field': "status",
      'new_value': "Discontinued",
      'obj_ids_list': JSON.stringify(obj_ids_list),
    };
    var url = "/ajax_batch_update_values/"
    updatePOST(url, data, headers = {}, redirect_url = "", refresh_var = false)
    dt.rows('.selected').remove().draw()
  }

  if (action === "fba_send_in_from_selected") {
     var source_mp_list = $.map(dt.rows('.selected').indexes(), function (row_indexes) {
      return dt.cell(row_indexes, "fba_source_marketplace:name").data()[1]
    });

    var unique_source_mp_list = [];
    $.each(source_mp_list, function(i, el){
        if($.inArray(el, unique_source_mp_list) === -1) unique_source_mp_list.push(el);
    });

    if (unique_source_mp_list.length > 1){
      alert(gettext('Error. Please make sure all the selected SKUs have the same FBA Source.'))
    } else {

      $.ajax({
        method: 'POST',
        url: ajax_batch_update_values_url,
        data: {
          'action': "fba_send_in_from_selected",
          'csrfmiddlewaretoken': csrfmiddlewaretoken,
          'obj_ids_list': JSON.stringify(obj_ids_list),
          'fba_source_marketplace': unique_source_mp_list[0],
        },
        success: function (data) {
          if (data["data"]["some_skus_failed"]) {
            alert(data["data"]["list_of_skus_that_were_not_added_to_fba_send_in"])
          }
          window.location = `${edit_fba_send_in_url}${data["data"]["fba_send_in_id"]}/`;
        }
      })
    }

  }

  if (action === "purchase_order_from_selected") {
    $(".loader-wrapper").fadeIn("slow");
    var data = {
      'action': "purchase_order_from_selected",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }

    $.ajax({
      method: 'POST',
      url: ajax_batch_update_values_url,
      data: data,
      success: function (data) {
        window.location = data["data"]["redirect_url"]
      }
    })
  }


  if (action === "mixed_carton_configurator_from_selected") {
    $(".loader-wrapper").fadeIn("slow");
    var data = {
      'action': "mixed_carton_configurator_from_selected",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }

    $.ajax({
      method: 'POST',
      url: ajax_batch_update_values_url,
      data: data,
      success: function (data) {
        window.location = data["data"]["redirect_url"]
      }
    })
  }

  if (action === "mixed_carton_configurator_from_selected_source_from_loose_stock") {
    $(".loader-wrapper").fadeIn("slow");
    var data = {
      'action': "mixed_carton_configurator_from_selected_source_from_loose_stock",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }

    $.ajax({
      method: 'POST',
      url: ajax_batch_update_values_url,
      data: data,
      success: function (data) {
        window.location = data["data"]["redirect_url"]
      }
    })
  }

  if (action === "plain_cartons_from_selected_for_fba_send_in_from_loose_stock") {
    $(".loader-wrapper").fadeIn("slow");
    var data = {
      'action': "plain_cartons_from_selected_for_fba_send_in_from_loose_stock",
      'csrfmiddlewaretoken': csrfmiddlewaretoken,
      'obj_ids_list': JSON.stringify(obj_ids_list),
    }

    $.ajax({
      method: 'POST',
      url: ajax_batch_update_values_url,
      data: data,
      success: function (data) {
        window.location = data["data"]["redirect_url"]
      }
    })
  }

}


function open_popover_fba_suggested_send_in_calc_table(sku_id, fba_source_marketplace) {

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: gettext("Suggested send-in calculation:"),
    html: true,
    sanitize: false,
    content: init_fba_suggested_send_in_calc_table_html(sku_id)
  }).popover('show')

  bind_event_to_close_popover_when_clicked_somewhere_else()

  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "sku_id": sku_id,
      "fba_source_marketplace": fba_source_marketplace,
      "chart_id": "fba_suggested_send_in_calc_table",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      $(`#container_fba_suggested_send_in_calc_table_${sku_id}`).html(data["table_html"])
      $('[data-toggle="tooltip"]').tooltip({container:"body"});
    }
  })
}


function open_popover_weighted_sales_velocity_calc_table(sku_id, fba_source_marketplace, fulfillment_source=null, actual_sku="same_sku", actual_sku_obj_id=null) {

  var popover_title = gettext("Weighted Sales Velocity Calculation:");
  if (!fba_source_marketplace.includes("amazon")){
    popover_title = `${fba_source_marketplace} - ${popover_title}`
  }
  if (actual_sku !== "same_sku"){
    popover_title = `<strong>${actual_sku}</strong> (${gettext("Sales from different SKU!")})<br>${popover_title}`
  }

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: popover_title,
    html: true,
    sanitize: false,
    content: `<div class="row" style="width:1080px;"><div class="col-6">${init_weighted_sales_velocity_calc_table_html(sku_id)}</div> <div class="col-6">${init_sales_and_fba_stock_chart_html()} </div></div>`
  }).popover('show');

  bind_event_to_close_popover_when_clicked_somewhere_else();

  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "sku_id": sku_id,
      "actual_sku_obj_id": actual_sku_obj_id,
      "fba_source_marketplace": fba_source_marketplace,
      "fulfillment_source": fulfillment_source,
      "chart_id": "weighted_sales_velocity_calc_table",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      $(`#container_weighted_sales_velocity_calc_table_${sku_id}`).html(data["table_html"])
      $('[data-toggle="tooltip"]').tooltip({container:"body"});
    }
  })

  $.ajax({
    method: 'POST',
    url: ajax_get_chart_data_url,
    data: {
      "sku_id": sku_id,
      "chart_id": "sales_and_fba_stock_chart",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
        draw_stock_oos_forecasting_chart(data["sales_and_fba_stock_chart"]);
    }
  })
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

function open_popover_wh_stock_detail_table(sku_id) {

  $(this).popover({
    placement: 'bottom',
    container: 'body',
    title: gettext("Warehouse Stock Details:"),
    html: true,
    sanitize: false,
    content: get_wh_stock_details_dt_table_html(sku_id)
  }).popover('show')

  init_dt_wh_stock_details(sku_id)
  bind_event_to_close_popover_when_clicked_somewhere_else()
}



function change_unit() {
  var selected_unit = $("input[name='unit_selection']:checked").attr("id");
  var target_field = $(this).data('target_field');

  if (selected_unit === "radio_select_Days") {
    selected_unit = "d"
  } else if (selected_unit === "radio_select_Months") {
    selected_unit = "m"
  } else {
    selected_unit = "w"
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


function init_fba_suggested_send_in_calc_table_html(sku_id) {
    return `<div id="container_fba_suggested_send_in_calc_table_${sku_id}">
              <div class="d-flex justify-content-center p-5">
                <div class="spinner-grow text-secondary" role="status">
                    <span class="sr-only">${gettext("Loading...")}</span>
                </div>
              </div>
            </div>`
}



function init_weighted_sales_velocity_calc_table_html(sku_id) {
    return `<div id="container_weighted_sales_velocity_calc_table_${sku_id}">
              <div class="d-flex justify-content-center p-5">
                <div class="spinner-grow text-secondary" role="status">
                    <span class="sr-only">${gettext("Loading...")}</span>
                </div>
              </div>
            </div>`
}



function get_wh_stock_details_dt_table_html(sku_id) {
  dt_id = "dt_wh_stock_details_template_id".replace("template_id", sku_id)
  return dt_wh_stock_details_html.replace("dt_wh_stock_details_template_id", dt_id)
}

function init_dt_wh_stock_details(sku_id) {
  dt_id = "#dt_wh_stock_details_template_id".replace("template_id", sku_id)
  $(dt_id).DataTable({
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "dt_wh_stock_details",
        "sku_id": sku_id,
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"data": "order_name", "name": "order_name", className: "order_name"},
      {"data": "status", "name": "status", className: "status"},
      { "name": "wh_cartons_left", className: "wh_cartons_left"},
      {"data": "wh_pcs_left", "name": "wh_pcs_left", className: "wh_pcs_left"},
      {"data": "order_received_date", "name": "order_received_date", className: "order_received_date"},
    ],

        rowGroup: {
      dataSrc: ["warehouse_id"],
      startRender: function (rows, group, level) {
        var group_sums = calculate_wh_details_group_sums(rows);
        return `
          <span >
          <i class="fas fa-warehouse mr-2"></i>
          ${rows.data()[0]["warehouse_name"]}</span> 
          <span class="float-right">
          ${group_sums["sum_wh_pcs_left"]} ${gettext("pcs")} 
                    (<span data-toggle="tooltip" title="${gettext("QTY of plain cartons with this SKU")}"><i class="fas fa-box px-1"></i>${group_sums["sum_qty_cartons_plain"]}</span>
                    <span class="mx-1">/</span>
                    <span data-toggle="tooltip" title="${gettext("QTY of mixed cartons with this SKU")}"><i class="fas fa-boxes px-1"></i>${group_sums["sum_qty_cartons_mixed"]}</span>
                    <span class="mx-1">/</span>
                    <span data-toggle="tooltip" title="${gettext("QTY of loose stock with this SKU")}"><i class="fas fa-box-open px-1"></i>${group_sums["sum_qty_loose_stock"]}</span>)
                  </span>`
      }
      },

    order: [4, "asc"],
    "columnDefs": [
      {
        "targets": "wh_cartons_left",
        "render": function (data, type, row) {
          return `<div class="d-flex justify-content-center px-2" >
                    <span data-toggle="tooltip" title="${gettext("QTY of plain cartons with this SKU")}"><i class="fas fa-box px-1"></i>${row["qty_cartons_plain"]}</span>
                    <span class="mx-1">/</span>
                    <span data-toggle="tooltip" title="${gettext("QTY of mixed cartons with this SKU")}"><i class="fas fa-boxes px-1"></i>${row["qty_cartons_mixed"]}</span>
                    <span class="mx-1">/</span>
                    <span data-toggle="tooltip" title="${gettext("QTY of loose stock with this SKU")}"><i class="fas fa-box-open px-1"></i>${row["qty_loose_stock"]}</span>
                  </div>`
        },
      },
        {
        "targets": "status",
        "data": "status",

        "render": function (data, type, row) {
          return `<span class="badge badge-${Purchase_Order_Status_to_color_mapper(row["status"])} p-1 py-2" style="width:6em">${po_status_translation_dict[row["status"]]}</span>`
        },
      },
    ],
    "lengthChange": false,
    "bPaginate": false,
    "searching": false,
    "info": false,
    "bFilter": false,

    "createdRow": function (row, data, dataIndex) {
      typeof stringValue
      if(typeof data["purchase_order_id"] == "string"){
        $(row).attr('data-warehouse_id', data["warehouse_id"]);
      }
      $(row).attr('data-purchase_order_id', data["purchase_order_id"]);
      $(row).attr('class', "po_row");
      $(row).attr('style', "cursor: pointer;");
    },
    "drawCallback": function (settings) {
      $(".po_row").click(function () {
        if($(this).data('warehouse_id')){
            var warehouse_id = $(this).data('warehouse_id')
            var win = window.open(`/warehouse_management/loose_stock/${warehouse_id}`, '_blank');
        }else{
            var purchase_order_id = $(this).data('purchase_order_id')
            var win = window.open(`${purchase_order_url}${purchase_order_id}/`, '_blank');
        }
        win.focus();
      })
    },

  });

}

function calculate_wh_details_group_sums(rows) {
  var sum_qty_cartons_plain = rows.data().pluck("qty_cartons_plain").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_qty_cartons_mixed = rows.data().pluck("qty_cartons_mixed").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_qty_loose_stock = rows.data().pluck("qty_loose_stock").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  var sum_wh_pcs_left = rows.data().pluck("wh_pcs_left").reduce(function (accumulator, item) {
    return accumulator + item;
  }, 0);

  return {
    "sum_qty_cartons_plain": sum_qty_cartons_plain,
    "sum_qty_cartons_mixed": sum_qty_cartons_mixed,
    "sum_qty_loose_stock": sum_qty_loose_stock,
    "sum_wh_pcs_left": sum_wh_pcs_left,
  }
}


function append_separate_multi_channel_sales(row, div_c, mc_entry, i) {
  var actual_sku = "same_sku";
  if (row["sku"] !== mc_entry['actual_sku']){
    actual_sku = mc_entry['actual_sku']
  }

  var mc_c = $(`<span 
                                    class="text-center inline_row_cell cell_${mc_entry['marketplace']}" 
                                    onclick='open_popover_weighted_sales_velocity_calc_table.call(this, 
                                        ${row["obj_id"]}, 
                                        "${mc_entry['marketplace']}", 
                                        "${mc_entry['fulfillment_source']}", 
                                        "${actual_sku}", 
                                        "${mc_entry['actual_sku_obj_id']}"
                                        )' 
                                    data-toggle="tooltip"
                                    data-html="true"
                                    
                                    data-title="${mc_entry['marketplace_name']}"
                                    width="100%">${mc_entry["sales_last_30_days_for_calc"]}</span>`);

  if(mc_entry['fulfillment_source'] === "externally_tracked_stock"){
    $(mc_c).attr("data-title", `${mc_entry['marketplace_name']} | ${gettext("Externally managed stock")}<br>
                            ${gettext("This channel sources its stock from an externally managed source.<br>" +
                            "Sales will be considered for re-orders only - not for FBA Send-Ins.<br>" +
                            "Sales are not included in the total weighted sales figure.")}`);
    $(mc_c).addClass("text-secondary")
  }

  if(mc_entry['fulfillment_source'].includes("fbm_wh_")){
    $(mc_c).attr("data-title", `${mc_entry['marketplace_name']} | FBM - ${mc_entry['warehouse_name']}<br>
                            ${gettext("This channel sources its stock from your loose stock.<br>" +
                            "Sales will be considered for re-orders only - not for FBA Send-Ins.<br>" +
                            "Sales are not included in the total weighted sales figure.")}`);
    $(mc_c).addClass("text-secondary")
  }

  if(mc_entry['fulfillment_source'].includes("amazon.")){
    $(mc_c).attr("data-title", `${mc_entry['marketplace_name']} | FBA - Multi-Channel<br>
                            ${gettext("This channel sources its stock from Amazon FBA.")}`);
  }

  if (i > 0){
    mc_c.addClass("non_first_inline_row_cell")
  }

  $(div_c).append(mc_c);
  return div_c
}

function init_sales_and_fba_stock_chart_html(){
    return `<div class="d-flex align-items-center">
             </div>
             <div class="chartWrapper">
                <div class="chartAreaWrapper">
                    <div class="chartAreaWrapper2">
                        <canvas style="height:350px;" id="sales_and_fba_stock_chart"></canvas>
                    </div>
                </div>
            </div>`
}

function draw_stock_oos_forecasting_chart(chart_data) {
  var rectangleSet = false;
  var ctx = document.getElementById('sales_and_fba_stock_chart').getContext('2d');
  var data = {
    type: 'line',
    data: chart_data,
    responsive: true,
    legend: {
      position: "top",
      align: "start"
    },
    // title: {
    //   display: true,
    //   text: gettext("Sales / FBA Stock")
    // },

    options: {
      maintainAspectRatio: false,
      // plugin: {
      //       tooltip: {
      //         enabled: true,
      //         mode: "x",
      //       }
      // },
      legend: {
           labels: {
               filter: function(legendItem, chartData) {
               const target_datasets =  [0,1];
                if (target_datasets.includes(legendItem.datasetIndex)) {
                  return true;
                }
               return false;
               }
            }
        },


      scales: {

        yAxes: [
          {
            id: 'A',
            type: 'linear',
            position: 'left',
            scaleLabel: {
              display: true,
              labelString: gettext('Total FBA Sales')
            },
          ticks: {
              min: 0,
            },
          },

          {
            id: 'B',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              display: true,
              labelString: gettext('Total FBA Stock')
            },
            gridLines: {
              display: false
            },
            ticks: {
              min: 0,
            },
          }]

      },

        elements: {
            point:{
                radius: 0
            }
        }
    }
  };

  stock_forecastChart = new Chart(ctx, data);


}