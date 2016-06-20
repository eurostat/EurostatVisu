/**
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {

	$(function() {
		//http://ec.europa.eu/eurostat/statistics-explained/images/2/2b/Euro_area_annual_inflation_and_its_main_components_%28%25%29%2C_2015%2C_September_2014_and_April_-_September_2015-est.png

		//TODO use lastTimePeriod

		var coicops = ["CP00", "TOT_X_NRG", "TOT_X_NRG_FOOD", "TOT_X_NRG_FOOD_NP", "FOOD", "FOOD_P", "FOOD_NP", "NRG", "IGD_NNRG", "SERV"];
		//var imgWaits = "<img src=\"img/wait_s.gif\">";

		var weightsLoaded = false;
		var indicesLoaded = false;

		var doEnd = function(){
			if(!weightsLoaded || !indicesLoaded) return;

			//show html code
			$("#table1html").text( $("#table1").html() );

			//show as an image
			html2canvas($("#table1"), { onrendered: function(canvas) { $("#img-out").empty(); $("#img-out").append(canvas); }});
		};


		//get current year and month
		var now = moment();
		//var now = moment("20011-10-15","YYYY-MM-DD");

		//fill weights column

		//try to get weight data for current year
		var wyear = now.year();
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:"EA",coicop:"CP00",time:wyear})})
		.done(function() {}) //weights ok.
		.fail(function() { wyear--; }) //no weight data for current year: focus on previous year.
		.always(function() {
			//write weight year in table header
			$("#wlabely").text(wyear);
			$("#wlabely").removeAttr("id"); //clean

			//get data and fill weights column
			$.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:"EA",coicop:coicops,time:wyear})})
			.done(function(data) {
				var ds;
				ds = data["prc_hicp_inw"]; EstLib.fixEurostatFormatBug(ds);
				ds = JSONstat(data).Dataset(0);
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
				console.log("Could not retrieve EA product weight in " + wyear);
			}).always(function() {
				weightsLoaded = true;
				doEnd();
			});
		});


		//fill rate of change (ROC) columns

		//try to get ROC data for current month
		var rmonth = now.month()+1;
		var ryear = now.year();
		$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{geo:"EA",unit:"RCH_A",coicop:"CP00",time:ryear+"M"+EstLib.getMonthTXT(rmonth)})})
		.done(function() {}) //ROC ok.
		.fail(function() { rmonth--; if(rmonth==0){rmonth=12;ryear--;} }) //no ROC data for current year: focus on previous year.
		.always(function() {
			var months = [];
			//add same month last year
			months.push((ryear-1)+"M"+EstLib.getMonthTXT(rmonth));
			//add last 6 months
			for(var i=-5;i<=0;i++){
				var m = rmonth+i;
				var y = ryear;
				if(m<=0) {m+=12;y--;}
				months.push(y+"M"+EstLib.getMonthTXT(m));
			}

			//build table
			for(var i=0; i<coicops.length; i++){
				var coicop = coicops[i];
				var row = $("#row"+coicop);
				row.removeAttr("id"); //clean
				for(var j=0; j<months.length; j++){
					var month = months[j];
					if(j==(months.length-1)) $("<td>").html("<b id=\""+"c"+month+coicop+"\">"+":"+"</b>").appendTo(row);
					else $("<td>").attr("id","c"+month+coicop).html(":").appendTo(row);
				}
			}
			//build header cells, with month labels
			var hrow = $("#hrow");
			for(var j=0; j<months.length; j++){
				var month = months[j];
				var y=month.substring(0,4), m=month.substring(5,7);
				$("<td>").html(moment(y+"-"+m,"YYYY-MM").format("MMM YYYY")).appendTo(hrow);
			}
			$("#hrow").removeAttr("id"); //clean

			//get data and fill ROC columns
			$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{geo:"EA",unit:"RCH_A",coicop:coicops,time:months})})
			.done(function(data) {
				var ds;
				ds = data["prc_hicp_manr"]; EstLib.fixEurostatFormatBug(ds);
				ds = JSONstat(data).Dataset(0);
				for(var i=0; i<coicops.length; i++){
					var coicop = coicops[i];
					for(var j=0; j<months.length; j++){
						var month = months[j];
						var d = ds.Data({coicop:coicop,time:month});
						var val = d3.round(d.value, 1).toFixed(1);
						var flag = d.status;

						var elt = $("#c"+month+coicop);
						elt.text( val + (flag?flag:"") );
						elt.removeAttr("id"); //clean
					}
				}
			}).fail(function() {
				console.log("Could not retrieve EA rates of change on " + this.month);
			}).always(function() {
				indicesLoaded = true;
				doEnd();
			});

		});

	});
}(jQuery, window.PrVis = window.PrVis || {} ));
