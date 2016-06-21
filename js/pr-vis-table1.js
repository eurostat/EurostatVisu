/**
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {

	$(function() {
		//http://ec.europa.eu/eurostat/statistics-explained/images/2/2b/Euro_area_annual_inflation_and_its_main_components_%28%25%29%2C_2015%2C_September_2014_and_April_-_September_2015-est.png

		var coicops = ["CP00", "TOT_X_NRG", "TOT_X_NRG_FOOD", "TOT_X_NRG_FOOD_NP", "FOOD", "FOOD_P", "FOOD_NP", "NRG", "IGD_NNRG", "SERV"];


		//things to do in the end, when all ajax have returned
		var weightsLoaded = false, indicesLoaded = false;
		var doEnd = function(){
			if(!weightsLoaded || !indicesLoaded) return;

			//show html code
			$("#table1html").text( $("#table1").html() );

			//show as an image
			html2canvas($("#table1"), { onrendered: function(canvas) { $("#img-out").empty(); $("#img-out").append(canvas); }});
		};


		//get data and fill weights column
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:"EA",coicop:coicops,lastTimePeriod:1}, null, null, "2.1")})
		.done(function(data) {
			var ds = JSONstat(data).Dataset(0);

			//write weight year in table header
			$("#wlabely").text( ds.Dimension("time").Category(0).label );
			$("#wlabely").removeAttr("id"); //clean

			//fill weights column
			for(var i=0; i<coicops.length; i++){
				var coicop = coicops[i];
				var d = ds.Data({coicop:coicop});
				var val = d3.round(d.value, 1);
				var flag = d.status;

				var elt = $("#w"+coicop);
				elt.text(val+flag);
				$("#w"+coicop).removeAttr("id"); //clean
			}
		}).fail(function() {
			console.log("Could not retrieve EA product weights");
		}).always(function() {
			weightsLoaded = true;
			doEnd();
		});


		//get data and fill ROC columns
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{geo:"EA",unit:"RCH_A",coicop:coicops,lastTimePeriod:7}, null, null, "2.1")})
		.done(function(data) {
			var ds = JSONstat(data).Dataset(0);
			var months = ds.Dimension("time").Category();

			//build table
			for(var i=0; i<coicops.length; i++){
				var coicop = coicops[i];
				var row = $("#row"+coicop);
				row.removeAttr("id"); //clean
				for(var j=0; j<months.length; j++){
					var month = months[j].label;
					if(j==(months.length-1)) $("<td>").html("<b id=\""+"c"+month+coicop+"\">"+":"+"</b>").appendTo(row);
					else $("<td>").attr("id","c"+month+coicop).html(":").appendTo(row);
				}
			}

			//build header cells, with month labels
			var hrow = $("#hrow");
			for(var j=0; j<months.length; j++){
				var month = months[j].label;
				var y=month.substring(0,4), m=month.substring(5,7);
				$("<td>").html(moment(y+"-"+m,"YYYY-MM").format("MMM YYYY")).appendTo(hrow);
			}
			$("#hrow").removeAttr("id"); //clean

			//fill table
			for(var i=0; i<coicops.length; i++){
				var coicop = coicops[i];
				for(var j=0; j<months.length; j++){
					var month = months[j].label;
					var d = ds.Data({coicop:coicop,time:month});
					var val = d3.round(d.value, 1).toFixed(1);
					var flag = d.status;

					var elt = $("#c"+month+coicop);
					elt.text( val + (flag?flag:"") );
					elt.removeAttr("id"); //clean
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
