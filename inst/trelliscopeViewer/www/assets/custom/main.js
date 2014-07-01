var spinnerOpts = {
  lines: 13, // The number of lines to draw
  length: 16, // The length of each line
  width: 7, // The line thickness
  radius: 21, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

var spinnerOptsCorner = {
  lines: 11, // The number of lines to draw
  length: 5, // The length of each line
  width: 2, // The line thickness
  radius: 5, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

var univarSpinner = new Spinner(spinnerOpts);
var bivarSpinner = new Spinner(spinnerOpts);
var multivarSpinner = new Spinner(spinnerOpts);
var panelSpinner = new Spinner(spinnerOptsCorner);

// store the URL hash
var appHash = window.location.hash;

function debounce(fn, delay) {
   var timer = null;
   return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
         fn.apply(context, args);
      }, delay);
   };
}

// let a user resize for 250ms before triggering actions
$(window).resize(function() {
   if(this.resizeTO) clearTimeout(this.resizeTO);
   this.resizeTO = setTimeout(function() {
      $(this).trigger('resizeEnd');
   }, 250);
});

$(window).bind('resizeEnd', function() {
   // recompute the panel preview layout after window resize
   // TODO: if that control panel is open, only change it there
   panelLayoutPreview(parseInt($("#panel-rows").val()), parseInt($("#panel-cols").val()));
   $("#panel-rows").trigger("change");
   panelLayoutOutputApplyButton();
});

// bind left and right keys for paging through panels
$(document).keydown(function(e) {
   if(e.keyCode == 37) { // left
      pageBack();
   }
   if(e.keyCode == 39) { // right
      pageForward();
   }
});

function pageForward() {
   var curPage = parseInt($("#curPanelPageInput").val());
   var nPages = parseInt($("#panelPageTotOutput").text());
   var by = parseInt($("#skip-button-value").html().replace("x", ""));

   if(curPage + by <= nPages) {
      $("#curPanelPageInput").val(curPage + by);
      $("#curPanelPageInput").trigger("change");
   }
}

function pageBack() {
   var curPage = parseInt($("#curPanelPageInput").val());
   var by = parseInt($("#skip-button-value").html().replace("x", ""));

   if(curPage - by >= 1) {
      $("#curPanelPageInput").val(curPage - by);
      $("#curPanelPageInput").trigger("change");
   }
}

function pageBeg() {
   $("#curPanelPageInput").val(1);
   $("#curPanelPageInput").trigger("change");
}



function hideColumn(columnIndex) {
   $("#cogTable td:nth-child(" + (columnIndex+1) + "), #cogTable th:nth-child(" + (columnIndex + 1) + ")").hide();
}

function showColumn(columnIndex) {
   $("#cogTable td:nth-child(" + (columnIndex+1) + "), #cogTable th:nth-child(" + (columnIndex + 1) + ")").show();
}

function updateCogTableColumnVisibility() {
   $("#cog-table-vars li").each(function() {
      if($(this).hasClass("active")) {
         showColumn(parseInt($(this).data("col-index")));
      } else {
         hideColumn(parseInt($(this).data("col-index")));
      }
   });
}

function masterControlPostRender() {
   // if any .slide-left divs are open, hide the backdrop, else show
   function toggleBackdrop() {
      if($(".slide-left").length == 0) {
         $("#control-panel-backdrop").removeClass("bd-visible");
         $("#control-panel-backdrop").addClass("bd-hidden");
      } else {
         $("#control-panel-backdrop").removeClass("bd-hidden");
         $("#control-panel-backdrop").addClass("bd-visible");
      }
   }

   // panel sliding by navigation
   $("div.list-group-sidebar a.list-group-item").on("click", function() {
      // when a nav element is clicked
      $(".slide-panel").not($("#" + $(this).data("divlink"))).removeClass("slide-left");
      $(this).toggleClass("selected");
      // if the user opens a control panel, call action function
      // which typically will be making sure the currently exposed state is set
      if($(this).hasClass("selected")) {
         var actionFn = $(this).data("action");
         if(window[actionFn])
            window[actionFn]();
      }
      // open the corresponding panel with a matching class to the button's id
      $("#" + $(this).data("divlink")).toggleClass("slide-left");
      toggleBackdrop();
   });

   $("#control-panel-backdrop").click(function() {
      // close all .slide-left
      $(".slide-left").each(function() {
         $(this).toggleClass("slide-left");
      });
      $("div.list-group a.list-group-item").removeClass("selected");
      $("#control-panel-backdrop").removeClass("bd-visible");
      $("#control-panel-backdrop").addClass("bd-hidden");
   });

   // handle "cancel" button of each control panel
   $(".btn-panel-close").click(function() {
      // update action dispatch
      var actionFn = $(this).data("action");
      if(window[actionFn])
         window[actionFn]();

      $(".slide-panel").removeClass("slide-left");
      $("div.list-group a.list-group-item").removeClass("selected");
      toggleBackdrop();
   });

   // handle "apply" button of each control panel
   $(".btn-panel-update").click(function() {
      // update action dispatch
      var actionFn = $(this).data("action");
      if(window[actionFn])
         window[actionFn]();

      // every time apply is called, set it back to page 1
      $("#curPanelPageInput").val("1");
      $("#curPanelPageInput").trigger("change");

      // get rid of panel and backdrop
      $(".slide-panel").removeClass("slide-left");
      $("div.list-group a.list-group-item").removeClass("selected");
      toggleBackdrop();
   });
}

// initialize code editor
function panelFunctionOutputPostRender() {
   var editor = ace.edit("editor");
   editor.setTheme("ace/theme/tomorrow");
   editor.getSession().setTabSize(3);
   editor.getSession().setUseSoftTabs(true);
   editor.getSession().setMode("ace/mode/r");
}

function relatedDisplayListOutputPostRender() {
   $.getScript("assets/custom/selectables-related.js");
}

function updateControlsExposedState() {
   univarFilterSetFromExposedState();
   bivarFilterSetFromExposedState();
   cogTableSetFromExposedState();
   visibleCogListSetFromExposedState();
   panelLayoutSetFromExposedState();
}

function cogBreadcrumbOutputPostRender() {
   // remove sorting if "x" clicked on filter breadcrumb
   $(".filter-breadcrumb.cog-state-remove").click(function() {
      var filterData = $("#filterStateInput").data("myShinyData");
      delete filterData[$(this).data("name")];
      $("#filterStateInput").trigger("change");
   });

   // if main part of a filter breadcrumb button is clicked
   // open up the univariate filter control panel and select that variable
   $(".filter-breadcrumb.cog-state-edit").click(function() {
      if(!$("#univar-filter").hasClass("slide-left"))
         $("#univar-filter-nav-link").trigger("click");

      $("#univar-var-" + $(this).data("name")).trigger("click");
   });

   // remove sorting if "x" clicked on sort breadcrumb
   $(".sort-breadcrumb.cog-state-remove").click(function() {
      var sortData = $("#sortStateInput").data("myShinyData");
      delete sortData[$(this).data("name")];
      $("#sortStateInput").trigger("change");
   });

   // open Table Sort / Filter control if main part of sort button clicked
   $(".sort-breadcrumb.cog-state-edit").click(function() {
      if(!$("#cog-table-sort-filter").hasClass("slide-left"))
         $("#cog-table-sort-filter-nav-link").trigger("click");

      // make sure appropriate column is active
      // console.log("#cog-table-col-select-li-" + $(this).data("name"));
      var el = $("#cog-table-col-select-li-" + $(this).data("name"));

      if(!el.hasClass("active")) {
         el.trigger("mousedown");
         el.trigger("mouseup");
      }
   });
}

// handle "marginal / conditional" style toggle buttons
function buttonToggleHandler() {
   $(".mc-toggle").click(function() {
      // if this button is not the one currently selected
      if($(this).hasClass("btn-default")) {
         // save filter state
         univarFilterLocalSave();
         // make it active
         $(this).removeClass("btn-default");
         $(this).addClass("btn-info");
         $(this).addClass("active");
         // make all others in the group inactive
         var sib = $(this).siblings();
         sib.removeClass("btn-info");
         sib.removeClass("active");
         sib.addClass("btn-default");
         // update the plot
         var actionFn = $(this).parent().data("action");
         if(actionFn)
            window[actionFn]();
      }
   });
}


function panelPageNavOutputPostRender() {
   // set text in panel pagination skip dropdown button to the default value
   $("#skip-button-menu li a").click(function(e) {
      $("#skip-button-value").html($(this).html());
   });

   $("#pageLeftButton").click(function() {
      pageBack();
   });

   $("#pageRightButton").click(function() {
      pageForward();
   });

   // when page input is changed, fire up spinner
   $("#curPanelPageInput").change(function() {
      var target = document.getElementById("panelTableSpinner");
      panelSpinner.stop(target);
      // setTimeout(function(){ panelSpinner.spin(target); }, 500);
      panelSpinner.spin(target);
   });
}

function cogMapOutputPostRender() {
   $(".cogmap-dropdown").click(function(e) {
      alert($(this).html());
      $(this).parent(".cogmap-button").html($(this).html());
   })
}

function panelTableContentOutputPostRender() {
   // stop spinner
   var target = document.getElementById("panelTableSpinner");
   panelSpinner.stop(target);

   // make with of cog name column uniform across
   // TODO: compute this as part of visible cog up front and save it with exposed state
   var maxCogNameWidth = 0;
   var tmp;
   $(".panel-cog-table").first().find(".cog-name-td").each(function() {
      tmp = $(this).find("strong").width();
      if(maxCogNameWidth < tmp)
         maxCogNameWidth = tmp;
   });
   $(".cog-name-td").width(maxCogNameWidth - 1);
   var totWidth = $("#exposedStateDataOutput").data("myShinyData").panelLayout.w;
   $(".cog-value-td").width(totWidth - maxCogNameWidth - 21);
   // $(".panel-cog-table").width(totWidth);
}


$(document).ready(function() {

   // render outer templates
   var outerRender = $.getJSON("templateData.json", function(json) {
      var masterTemplate = document.getElementById("controls-master-template").innerHTML;

      $.each(json, function(key, value) {
         var output = Mustache.render(masterTemplate, value);
         document.getElementById(key).innerHTML = output;
      });
   })
   .complete(function() {
      // register bindings for newly created elements
      masterControlPostRender();

      // if we are viewing index.html outside of being invoked from shiny
      // then grab some dummy data to fill in the mustache templates
      // this is a very useful way to design outside of shiny
      if(!window.Shiny) {
         console.log("Running outside of shiny... filling templates with dummy data...")

         $.getJSON("dummyData.json", function(json) {

            $.each(json["panels"], function(key, value) {
               renderTemplate(key, value);
            })

            renderTemplate("panelPageNavOutput", json["panelPageNavOutput"]);
            renderTemplate("cogBreadcrumbOutput", json["cogBreadcrumbOutput"]);
            renderTemplate("displayListOutput", json["displayListOutput"]);
            renderTemplate("panelTableContentOutput", json["panelTableContentOutput"]);
         })
         .complete(function() {
            $("#headerDisplayNameOutput").html("group / display_name");
         });
      } else {
         console.log("Running in shiny mode...")
         try {
           Shiny.unbindAll();
           Shiny.bindAll()
         } catch (e) {
          // do nothing
         }

         if(appHash == "") {
            $("#openModal").modal('show');
         } else {
            // $("#appHash").val(appHash);
         }
      }
   });

   $(".right-sticky").click(function() {
      $(".right-panel").toggleClass("right-slide");
      $("#sticky-icon").toggleClass("icon-chevron-left icon-chevron-right")
   });
});

