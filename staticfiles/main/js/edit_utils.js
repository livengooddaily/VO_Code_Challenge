function edit_cell() {
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var value = $(`span[id="${obj_id}-${t_field}-${carton_type}-value"]`).html();
  var td = $(this).closest("td")
  td.html(
    `<input id="${obj_id}-${t_field}-${carton_type}-input" class="result form-control" data-obj_id="${obj_id}" data-t_field="${t_field}" data-carton_type="${carton_type}"  type="number" min="0" value="${value}">`
  )

  td.attr('id', `${obj_id}-${t_field}-${carton_type}-cell`);
  td.attr('data-t_field', t_field);

  handle_input_change.call(this, obj_id, t_field, carton_type)

  $(`input[id="${obj_id}-${t_field}-${carton_type}-input"]`).keyup(function (event) {
    if (event.keyCode === 13) {
      btn_save.call(this);
    }
  });

  td.popover({
    placement: 'bottom',
    container: 'body',
    html: true,
    sanitize: false,
    content: `<button id="${obj_id}-${t_field}-${carton_type}-btn-save" onclick="btn_save.call(this)" class="btn btn-sm btn-info mr-2" data-obj_id="${obj_id}" data-t_field="${t_field}" data-carton_type="${carton_type}" name="table_edit_save_button">${gettext("Save")}</button>` +
      `<button id="${obj_id}-${t_field}-${carton_type}-btn-cancel" onclick="btn_cancel.call(this)" class="btn btn-sm btn-danger" data-obj_id="${obj_id}" data-t_field="${t_field}" data-carton_type="${carton_type}" data-value_before="${value}" name="table_edit_cancel_button">${gettext("Cancel")}</button>`
  })
}

function btn_save() {
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var input_value = $(`#${obj_id}-${t_field}-${carton_type}-input`).val()
  td = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)
  td.html(editable_td_html(obj_id, t_field, carton_type, input_value))
  td.popover('hide')
  handle_btn_save(input_value, obj_id, t_field, carton_type)

}

function btn_cancel() {
  var obj_id = $(this).data('obj_id')
  var t_field = $(this).data('t_field')
  var carton_type = $(this).data('carton_type')
  var value_before = $(this).data('value_before')
  var td = $(`td[id="${obj_id}-${t_field}-${carton_type}-cell"]`)

  td.html(editable_td_html(obj_id, t_field, carton_type, value_before))
  td.popover('hide')

  handle_btn_cancel(value_before, obj_id, t_field, carton_type)

  $('i[name="editable_int_cell"]').on('click', edit_cell)
}

function bind_editable_int_cell_events() {
  $('.dataTable').on('mouseleave', 'td.editable_int_cell', function () {
    $(this).find('i').attr('style', 'visibility: hidden');
  })

  $(".dataTable").on('mouseenter', 'td.editable_int_cell', function () {
    $(this).find('i').attr('style', 'visibility: visible; cursor: pointer;');
  });

  $(".dataTable").on('click', 'i[name="editable_int_cell"]', edit_cell)
}



