/**
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {

	$(function() {
		//http://ec.europa.eu/eurostat/statistics-explained/images/2/2b/Euro_area_annual_inflation_and_its_main_components_%28%25%29%2C_2015%2C_September_2014_and_April_-_September_2015-est.png

		//coicop codes corresponding to table raws
		var coicops = ["CP00", "TOT_X_NRG", "TOT_X_NRG_FOOD", "TOT_X_NRG_FOOD_NP", "FOOD", "FOOD_P", "FOOD_NP", "NRG", "IGD_NNRG", "SERV"];


		//things to do in the end, when all ajax have returned
		var weightsLoaded = false, indicesLoaded = false;
		var doEnd = function(){
			if(!weightsLoaded || !indicesLoaded) return;

			//show as an image
			html2canvas($("#table1"), { onrendered: function(canvas) { $("#img-out").empty(); $("#img-out").append(canvas); }});

			//show html code
			$("#table1html").text( $("#table1").html() );
		};


		//get weight data fill first table column
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:"EA",coicop:coicops,lastTimePeriod:1}, null, null, "2.1")})
		.done(function(data) {
			//decode data
			var ds = JSONstat(data).Dataset(0);

			//write weight year in table header
			$("#wlabely").text( ds.Dimension("time").Category(0).label ).removeAttr("id");

			//fill weights column
			for(var i=0; i<coicops.length; i++){
				//get weight data
				var coicop = coicops[i];
				var d = ds.Data({coicop:coicop});
				var value = d? d3.round(d.value, 1) + (d.status||"") : ":";

				//fill table cell
				$("#w"+coicop).text(value).removeAttr("id");
			}
		}).fail(function() {
			console.log("Could not retrieve EA product weights");
		}).always(function() {
			weightsLoaded = true;
			doEnd();
		});


		//get ROC data for the last 7 months and fill first columns
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{geo:"EA",unit:"RCH_A",coicop:coicops,lastTimePeriod:7}, null, null, "2.1")})
		.done(function(data) {
			//decode data
			var ds = JSONstat(data).Dataset(0);

			//retrieve months
			var months = ds.Dimension("time").Category();

			//build header cells and fill with month labels
			var hrow = $("#hrow");
			for(var j=0; j<months.length; j++){
				var month = months[j].label;
				var y=month.substring(0,4), m=month.substring(5,7);
				$("<td>").html(moment(y+"-"+m,"YYYY-MM").format("MMM YYYY")).appendTo(hrow);
			}
			$("#hrow").removeAttr("id"); //clean

			//build table cells and fill with ROC data
			for(var i=0; i<coicops.length; i++){
				var coicop = coicops[i];
				var row = $("#row"+coicop).removeAttr("id");
				for(var j=0; j<months.length; j++){
					var month = months[j].label;

					//get ROC data
					var d = ds.Data({coicop:coicop,time:month});
					var value = d? d3.round(d.value, 1).toFixed(1) + (d.status||"") : ":";

					//fill table cell
					if(j==(months.length-1)) $("<td>").html("<b>"+value+"</b>").appendTo(row);
					else $("<td>").appendTo(row).text(value);
				}
			}
		}).fail(function() {
			console.log("Could not retrieve EA rates of change");
		}).always(function() {
			indicesLoaded = true;
			doEnd();
		});

	});
}(jQuery, window.PrVis = window.PrVis || {} ));
