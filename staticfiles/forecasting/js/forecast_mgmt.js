$(document).ready(function () {
  initialize_sales_forecasting_chart();
  purchase_orders_log()

    $("#form_import_manual_forecast_skus_csv_file").submit(function(e) {
      e.preventDefault();
      ajax_upload_po_csv_file.call(this)
    });
});

function purchase_orders_log(){

      dt_purchase_orders_log_config = init_dt_purchase_orders_log_config();

      dt_purchase_orders_log_config["ajax"].data["action"] = "get_sku_purchase_orders";
      dt_purchase_orders_log_config["ajax"].data["sku_id"] = sku_id;
      dt_purchase_orders_log_config["columnDefs"].push(
          {
            "targets": [
              "order_placed_date",
              "order_shipped_date",
            ],
            "visible": false,
          }
      )


      dt_purchase_orders_log_config["columnDefs"][7] =
          {
            "targets": "actions",
            "data": "obj_id",
            "orderable": false,
            "render": function (data, type, row) {

              return `<div class="d-flex align-items-center pl-2" style="cursor: pointer">
                        <div data-toggle="tooltip" title="${gettext("Edit")}" onclick="window.location='${edit_purchase_order_url + row["purchase_order_id"]}'">
                            <i class="mr-1 fas fa-edit text-secondary mr-1" ></i>
                        </div>

                        <div id="${row["purchase_order_id"]}-save_changes_btn" class="badge badge-pill badge-success ml-3 p-2 save_changes_btn" style="display: none" data-toggle="tooltip" title="${gettext("Save row changes")}">
                          <i class="fas fa-save  text-white save_changes_btn " style="display: none"></i>
                        </div>
  
                        <div id="${row["purchase_order_id"]}-cancel_changes_btn" class="badge badge-pill badge-danger ml-1 p-2 cancel_changes_btn" style="display: none" data-toggle="tooltip" title="${gettext("Revert row changes")}">
                          <i class="fas fa-undo  text-white cancel_changes_btn" style="display: none"></i>
                        </div>
                      </div>
                    `
            },
          };
//      dt_purchase_orders_log_config["scrollY"] = false;
//      dt_purchase_orders_log_config["fixedHeader"] = true;

      register_datatable_sums_functionality();
      dt_purchase_orders_log = initialize_dt_purchase_orders_log();
      bind_events()

}

function initialize_sales_forecasting_chart() {
  $.ajax({
    method: 'POST',
    url: sales_forecasting_chart_url,
    data: {
      "chart_id": "forecast_mgmt_charts",
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      current_month_label = data["current_month_label"];
      max_y_axis_value = data["max_y_axis_value"];
      draw_sales_forecasting_chart(data["sales_forecasting_chart"]);
      draw_stock_oos_forecasting_chart(data["stock_oos_forecasting_chart"]);

    }
  })
}


function extend_data_with_drag_functionality(data) {
  var additional_spec = {
    dragData: true,
      dragX: false,
      dragDataRound: 0, // round to full integers (0 decimals)
      dragOptions: {
        // magnet: { // enable to stop dragging after a certain value
        //   to: Math.round
        // },
        showTooltip: true // Recommended. This will show the tooltip while the user
        // drags the datapoint
      },
      onDragStart: function (e, element) {
        // where e = event
      },
      onDrag: function (e, datasetIndex, index, value) {
        // change cursor style to grabbing during drag action
        e.target.style.cursor = 'grabbing'

        // if (index === 0) {
        //   forecastChart.data.datasets[datasetIndex].data[index + 1] = value;
        //   // if the last point is clicked, only update the point before
        // } else if (index === (forecastChart.data.datasets[datasetIndex].data.length - 1)) {
        //   forecastChart.data.datasets[datasetIndex].data[index - 1] = value;
        // } else {
        //   // all other cases
        //   forecastChart.data.datasets[datasetIndex].data[index - 1] = value;
        //   forecastChart.data.datasets[datasetIndex].data[index + 1] = value;
        // }
        // forecastChart.update();
        // where e = event
      },
      onDragEnd: function (e, datasetIndex, index, value) {
        // restore default cursor style upon drag release
        e.target.style.cursor = 'default'
        // console.log(forecastChart.scales.A.max)
        forecastChart.scales.A.max = forecastChart.scales.A.max + 50
        forecastChart.update()
        // alert(value)
        // where e = event
      },
      hover: {
        onHover: function (e) {
          // indicate that a datapoint is draggable by showing the 'grab' cursor when hovered
          const point = this.getElementAtEvent(e)
          if (point.length) e.target.style.cursor = 'grab'
          else e.target.style.cursor = 'default'
        }
      },
  };

  $.extend(data["options"], additional_spec);
  return data
}

function extend_data_with_annotations(data) {
  var additional_spec = {
    annotation: {
        annotations: [
          {
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: current_month_label,
            borderColor: "red",
            label: {
              content: gettext("Current Month"),
              enabled: true,
              position: "top"
            }
          }
        ]
      },
  };

  $.extend(data["options"], additional_spec);
  return data
}

function extend_data_with_tooltips(data) {
  var additional_spec = {
    tooltips: {
      mode: 'index',
      callbacks: {
        label: function (tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || '';

          if (label) {
            label += ': ';
          }

          label += tooltipItem.yLabel;
          if (tooltipItem.datasetIndex == 5 || tooltipItem.datasetIndex == 4) {
            label += " %";
          }
          return label;
        }
      }
    },
  };

  $.extend(data["options"], additional_spec);
  return data
}

function extend_data_with_animation(data) {
  var additional_spec = {
    animation: {
      onComplete: function () {
        if (!rectangleSet) {
          var scale = window.devicePixelRatio;

          var sourceCanvas = forecastChart.chart.canvas;
          var copyWidth = forecastChart.scales['A'].width - 10;
          var copyHeight = forecastChart.scales['A'].height + forecastChart.scales['A'].top + 10;

          var targetCtx = document.getElementById("axis-Test").getContext("2d");

          targetCtx.scale(scale, scale);
          targetCtx.canvas.width = copyWidth * scale;
          targetCtx.canvas.height = copyHeight * scale;

          targetCtx.canvas.style.width = `${copyWidth}px`;
          targetCtx.canvas.style.height = `${copyHeight}px`;
          targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth * scale, copyHeight * scale, 0, 0, copyWidth * scale, copyHeight * scale);

          var sourceCtx = sourceCanvas.getContext('2d');

          // Normalize coordinate system to use css pixels.

          sourceCtx.clearRect(0, 0, copyWidth * scale, copyHeight * scale);
          rectangleSet = true;
        }
      },
      onProgress: function () {
        if (rectangleSet === true) {
          var copyWidth = forecastChart.scales['A'].width;
          var copyHeight = forecastChart.scales['A'].height + forecastChart.scales['A'].top + 10;

          var sourceCtx = forecastChart.chart.canvas.getContext('2d');
          sourceCtx.clearRect(0, 0, copyWidth, copyHeight);
        }
      }
    },
  };

  $.extend(data, additional_spec);
  return data
}

function extend_data_with_plugins(data) {
  var additional_spec = {
    plugins:[
    {
      id: 'customPlugin',
      beforeDraw: chart => {
        const datasets = chart.config.data.datasets;

        if (datasets) {
          const { ctx } = chart.chart;

          ctx.save();
          ctx.fillStyle = 'black';
          ctx.font = '400 12px Open Sans, sans-serif';

          const target_datasets =  [6,7,8,9,10];

          for (let i = 0; i < datasets.length; i++) {
            if (target_datasets.includes(i)){
              const ds = datasets[i];
              const label = ds.label;
              const meta = chart.getDatasetMeta(i);
              const len = meta.data.length - 1;
              const xOffset = chart.canvas.width - 230;
              const yOffset = meta.data[len]._model.y - 7;
              ctx.fillText(label, xOffset, yOffset);
            }
          }
          ctx.restore();
        }
      }
    }
  ],
  };
 $.extend(data, additional_spec);
  return data
}


function draw_sales_forecasting_chart(chart_data) {
  var rectangleSet = false;
  var ctx = document.getElementById('sales_forecasting_chart').getContext('2d');
  var data = {
    type: 'line',
    data: chart_data,
    responsive: true,
    legend: {
      position: "top",
      align: "start"
    },
    title: {
      display: true,
      text: gettext("SKU Sales Forecasting")
    },

    options: {
      maintainAspectRatio: false,

      legend: {
           labels: {
               filter: function(legendItem, chartData) {
               const target_datasets =  [6,7,8,9,10];
                if (target_datasets.includes(legendItem.datasetIndex)) {
                  return false;
                }
               return true;
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
              labelString: gettext('Sales per Month')
            },
            ticks: {
              min: 0,
              max: Math.max(max_y_axis_value, 300),
            },
          },

          {
            id: 'B',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              display: true,
              labelString: gettext('Share of days in Stock (%)')
            },
            gridLines: {
              display: false
            },
            ticks: {
              min: 0,
              max: 100,
              callback: function (value) {
                return (value).toFixed(0) + '%'; // convert it to percentage
              },
            },
          }]

      }
    }
  };

  data = extend_data_with_drag_functionality(data);
  data = extend_data_with_annotations(data);
  data = extend_data_with_animation(data);
  data = extend_data_with_tooltips(data);
  data = extend_data_with_plugins(data);

  forecastChart = new Chart(ctx, data);


}


function save_manual_forecast() {
  var dataset = forecastChart.data.datasets[0].data;
  var lables = forecastChart.data.labels;

  var manual_sales_data_to_be_updated = []

  $.each(dataset, function (i, el) {
    if (el !== null) {
      label = lables[i];
      manual_sales_data_to_be_updated.push({
        data_label: lables[i],
        manual_sales_forecast: el,
      })
    }
  });


$.ajax({
    method: 'POST',
    url: ajax_update_values_url,
    data: {
      "update_action": "manual_sales_data",
      "manual_sales_data_to_be_updated": JSON.stringify(manual_sales_data_to_be_updated),
      "csrfmiddlewaretoken": csrfmiddlewaretoken,
    },
    success: function (data) {
      alert(gettext("Successfully saved manual forecast."))
    },
    error:function(error_msg){
      alert(gettext("Error."), error_msg)
    },
  })
}


function reset_manual_forecast() {
  var dataset = forecastChart.data.datasets[0].data;
  var updated_dataset = [];

  $.each(dataset, function (i, el) {
    var val = el;
    if (el !== null) {
      val = 0.1
    }
    updated_dataset.push(val)
  });

  forecastChart.data.datasets[0].data = updated_dataset;
  forecastChart.update()
  save_manual_forecast()
}

function toggle_forecasting_enabled() {
  window.location = toggle_forecasting_enabled_url
}



function draw_stock_oos_forecasting_chart(chart_data) {
  var rectangleSet = false;
  var ctx = document.getElementById('stock_oos_forecasting_chart').getContext('2d');
  var data = {
    type: 'line',
    data: chart_data,
    responsive: true,
    legend: {
      position: "top",
      align: "start"
    },
    title: {
      display: true,
      text: gettext("Stock / OOS Forecasting")
    },

    options: {
      maintainAspectRatio: false,

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
              labelString: gettext('Remaining Stock Forecast')
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
              labelString: gettext('Lost Sales due to OOS')
            },
            gridLines: {
              display: false
            },
            ticks: {
              min: 0,
            },
          }]

      }
    }
  };

  // data = extend_data_with_animation(data);

  stock_forecastChart = new Chart(ctx, data);


}

function ajax_upload_po_csv_file(){
  upload_button = $('#btn_import_manual_forecast_skus_csv_file');
  upload_button.prop('disabled', true);
  upload_button.prepend(`<div id="spinner_btn_import_forecast_csv_file" class="mr-2 spinner-border spinner-border-sm text-white" role="status">
                                  <span class="sr-only">${gettext("Loading...")}</span>
                                </div>`);

  var data = new FormData($(this).get(0));
  $.ajax({
    type: "POST",
    url: submit_import_forecast_csv_file_url,
    data: data,
    cache: false,
    processData: false,
    contentType: false,
    success: function(data)
    {
      upload_button.prop('disabled', false);
      alert(gettext("CSV file successfully uploaded!"))
      window.location.reload();
      $('#csv_import_export_modal').modal('hide')
      $('#spinner_btn_import_forecast_csv_file').remove()

    },
    error: function (request, status, error) {
        alert(request.responseJSON["error"]);
        upload_button.prop('disabled', false);
//        $("#dt_purchase_order_line_items").DataTable().ajax.reload();
        $('#spinner_btn_import_forecast_csv_file').remove()
    }
  });
}