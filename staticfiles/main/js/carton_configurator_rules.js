$(document).ready(function () {
  bind_events()
});


function bind_events() {
  bind_modal_dt_columns_adujst_event("add_p_sizes_modal")
  bind_refresh_on_model_hide_event("add_p_sizes_modal", carton_configurator_rules_url)
  bind_input_change_event()
  // bind_form_submit_button_event()
}


function bind_input_change_event() {
  $('input.numberinput').on('change', function (e) {
    $(this).closest(".form-row").find('.btn_save_mixed_carton_dimensions_form').show()
  })
}

function bind_form_submit_button_event() {
  $('.btn_save_mixed_carton_dimensions_form').on('click', function (e) {
    e.preventDefault()
    save_mixed_carton_dimensions_form.call(this,)
  })
}



function show_add_p_sizes_manually_modal(mrCr_id) {
  initialize_dt_p_sizes_for_carton_config_rule_add_manually(mrCr_id)

  $('#add_p_sizes_modal').modal("show")

}

ci_apsm = {
  "obj_id": 0,
  "cat_product_type": 1,
  "cat_size": 2,
  "cat_shape": 3,
  "p_size": 4,
}


function get_config_for_dt_p_sizes_for_carton_config_rule_add_manually(mrCr_id) {
  return {
    "ajax": {
      url: ajax_get_table_data_url,
      method: "POST",
      dataType: 'json',
      data: {
        "action": "get_active_p_sizes",
        "mrCr_id": "mrCr_id",
        "csrfmiddlewaretoken": csrfmiddlewaretoken,
      },

    },
    "columns": [
      {"name": "obj_id", className: " obj_id noVis select-checkbox"},
      {"data": "cat_product_type", "name": "cat_product_type", className: "cat_product_type noVis"},
      {"data": "cat_size", "name": "cat_size", className: "cat_size noVis"},
      {"data": "cat_shape", "name": "cat_shape", className: "cat_shape noVis"},
      {"data": "p_size", "name": "p_size", className: "p_size"},
      {className: "actions noVis text-center"},
    ],

    rowGroup: {
      dataSrc: [
        "cat_product_type",
        // ci_apsm["cat_shape"],
      ]
    },
    "order": [
      [ci_apsm["cat_product_type"], 'asc'],
      [ci_apsm["cat_shape"], 'asc'],
      [ci_apsm["p_size"], 'asc'],
    ],
    orderFixed: [
      [ci_apsm["cat_product_type"], 'asc'],
    ],
    "columnDefs": [
      {
        "targets": "obj_id",
        "width": "10px",
        "orderable": false,
        "render": function (data, type, row) {
          return ``
        },
      },
      {
        "targets": -1,
        "data": "p_size",
        "render": function (data, type, row) {
          return `
                <div class="add_buttons d-flex justify-content-center">
                  ${get_add_to_selection_button_html(`add_selected_p_size_to_rule.call(this, ${mrCr_id}, '${data}')`, data)}
                 </div>
                `
        }
      },
      {
        "targets": [
          "cat_product_type",
          "cat_shape",
          "cat_size",
        ],
        "visible": false,
      }
    ],
    dom: "<'row mt-1'<'col-sm-12 col-md-9 mb-2 'B><'col-sm-12 col-md-3'f>>" +
      "<'row'<'col-sm-12 col-md-12 mb-2' tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 mt-2'p>>" +
      "<'row'<'col-sm-12 col-md-12'l>>",
    select: {
      style: 'multi+shift',
      selector: 'td:first-child'
    },
    buttons: [
      {
        extend: 'colvis',
        columns: ':not(.noVis)',
        text: '<i class="fas fa-columns"></i>  Select Columns',
      },

    ],
    scrollY: '60vh',
    paging: false,
    "info": false,
    // drawCallback : function () {
    //  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    // }}
  }
}

function initialize_dt_p_sizes_for_carton_config_rule_add_manually(mrCr_id) {
  if (!$.fn.DataTable.isDataTable('#dt_p_sizes_for_carton_config_rule_add_manually')) {
    dt_config = get_config_for_dt_p_sizes_for_carton_config_rule_add_manually(mrCr_id)
    $('#dt_p_sizes_for_carton_config_rule_add_manually').DataTable(dt_config)
  } else {
    dt_config = get_config_for_dt_p_sizes_for_carton_config_rule_add_manually(mrCr_id)
    dt_config["destroy"] = true
    $('#dt_p_sizes_for_carton_config_rule_add_manually').DataTable(dt_config)
  }
}


function delete_mixed_carton_rule(mcCr_id) {
  $.ajax({
    method: 'POST',
    url: carton_configurator_rules_url,
    data: {
      "mcCr_id": mcCr_id,
      "action": "delete_mixed_carton_rule_ajax",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      $(`#rule_card-${mcCr_id}`).remove()
    },
    error: function () {
      alert("Error. Rule was not deleted.")
    },
  })
}

function add_selected_p_size_to_rule(mrCr_id, p_size) {
    $(this).closest("button").attr("style", "display: none")
    $.ajax({
    method: 'POST',
    url: carton_configurator_rules_url,
    data: {
      "mcCr_id": mrCr_id,
      "p_size": p_size,
      "action": "add_selected_p_size_to_rule_ajax",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
    },
    error: function () {
      alert("Error. Rule was not deleted.")
    },
  })
}

function remove_selector_id_from_rule(selector_id) {
  $(this).closest("tr").remove()
    $.ajax({
    method: 'POST',
    url: carton_configurator_rules_url,
    data: {
      "selector_id": selector_id,
      "action": "remove_selector_id_from_rule_ajax",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function () {
      $(this).remove()
    },
    error: function () {
      alert("Error. Rule was not deleted.")
    },
  })
}