/**
 * 
 * Visualisation of coicop information as time stack
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {
	$(function() {

		//
		PrVis.modifyCoicopHierarchy();
		//TODO remove too low level coicops.

		//geo/coicop/year
		var dataIndex = {};

		//colors
		var color = colorbrewer.Set3[12];
		var colorSA = {"SERV":colorbrewer.Set3[4][0], "NRG":colorbrewer.Set3[4][1], "FOOD":colorbrewer.Set3[4][2], "IGD_NNRG":colorbrewer.Set3[4][3]};
		var coicopToColor = function(coicop){
			if($("input:radio[name=ctype]:checked").val() === "CP00"){
				var fam = coicop.substring(0,4);
				if(fam==="CP00") return;
				return color[+(fam.replace("CP",""))-1];
			} else {
				return colorSA[getFamCode(coicop)];
			}
		};
		var getFamCode = function(coicop){
			if( $.inArray(coicop, PrVis.coicopsDict["SA"].children)>=0 ) return coicop;
			var parents = PrVis.coicopsDict[coicop].parents;
			if(parents.length == 0) return;
			for(var i=0; i<parents.length; i++){
				var out = getFamCode(parents[i]);
				if(out) return out;
			}
		};

		//title
		var title = $("#title");

		//svg element
		var w=600, h=300;
		var svg = d3.select("#stack").append("svg")
		.attr("width", w).attr("height", h)
		.append("g");

		//legend
		var lgd = $("#legend");
		lgd.css("height", h);
		var infoDiv = null;
		var refreshLegend = function(){
			lgd.empty();
			if($("input:radio[name=ctype]:checked").val() === "CP00"){
				var mouseoverFun = function() { /*highlightCoicop($(this).attr("id").replace("lgdElt",""));*/ };
				var mouseoutFun = function() { /*unHighlightCoicop($(this).attr("id").replace("lgdElt",""));*/ };
				PrVis.buildCOICOPLegend(lgd, coicopToColor, mouseoverFun, mouseoutFun);
			} else {}
			//info
			infoDiv = $("<div>").appendTo(lgd).css("font-size","1.5em").css("margin-top","10px")/*.css("border","solid 1px").css("width","auto")*/;
		};
		refreshLegend();

		var geoList = $("#geoList");

		//get base information on years and geos
		$.when($.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{coicop:"CP00"})}))
		.then(function(ds) {
			EstLib.overrideCountryNames(ds.dimension.geo.category.label);
			ds = JSONstat(ds).Dataset(0);
			var geos = ds.Dimension("geo").id;

			//option
			var cType = $("#ctype");
			$("input[name='ctype']").change(function () {
				updateChart();
				refreshLegend();
			});
			cType.buttonset();

			//build geolist
			PrVis.fillGeoList(geoList, geos, function(geo){return ds.Dimension("geo").Category(geo).label;});
			$('#geoList option[value="EA"]').attr('selected', 'selected');
			geoList.selectmenu({
				change:function(){
					$("#geoTXT").text( ds.Dimension("geo").Category(geoList.find(":selected").attr("value")).label );
					updateChart();
				}
			})
			.selectmenu("menuWidget").css("height","200px")/*.css("font-size","70%")*/;
			$("#geoTXT").text( ds.Dimension("geo").Category(geoList.find(":selected").attr("value")).label );

			var updateChart = function(){
				var geoSel = geoList.find(":selected").attr("value");
				console.log(geoSel);

				refreshLegend();

				//get data and update chart
				//PrVis.getProductWeightData(geoSel, yearSel, dataIndex, function(){ updateChart_(dataIndex[yearSel][geoSel],yearSel,geoSel); });
			};

			//
			updateChart();
		}, function() {
			console.log("Could not load initialisation data"); //TODO better
		});
	});
}(jQuery, window.PrVis = window.PrVis || {} ));
