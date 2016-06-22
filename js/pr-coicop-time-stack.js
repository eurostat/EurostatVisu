/**
 * 
 * Visualisation of coicop information as time stack
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {
	$(function() {
		//http://bl.ocks.org/mbostock/4060954
		//http://bl.ocks.org/mbostock/3943967

		//
		//PrVis.modifyCoicopHierarchy();
		//TODO remove too low level coicops.

		//TODO add ECB
		var coicops = ["CP01","CP02","CP03","CP04","CP05","CP06","CP07","CP08","CP09","CP10","CP11","CP12"];

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
		var color = d3.scale.linear().range(["#aad", "#556"]); //TODO deprecated

		//title
		var title = $("#title");

		//svg, with a bottom-right origin.
		var width = 960, height = 500;
		var svg = d3.select("#stack").append("svg")
		.attr("width", width)
		.attr("height", height);

		//legend
		var lgd = $("#legend");
		lgd.css("height", height);
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
		.then(function(geoDim) {
			EstLib.overrideCountryNames(geoDim.dimension.geo.category.label);
			geoDim = JSONstat(geoDim).Dataset(0).Dimension("geo");

			//option
			var cType = $("#ctype");
			$("input[name='ctype']").change(function () {
				updateChart();
				refreshLegend();
			});
			cType.buttonset();

			//build geolist
			PrVis.fillGeoList(geoList, geoDim.id, function(geo){return geoDim.Category(geo).label;});
			$('#geoList option[value="EA"]').attr('selected', 'selected');
			geoList.selectmenu({
				change:function(){
					$("#geoTXT").text( geoDim.Category(geoList.find(":selected").attr("value")).label );
					updateChart();
				}
			})
			.selectmenu("menuWidget").css("height","200px")/*.css("font-size","70%")*/;
			$("#geoTXT").text( geoDim.Category(geoList.find(":selected").attr("value")).label );

			var updateChart = function(){
				var geoSel = geoList.find(":selected").attr("value");

				//get data and update chart
				$.when(
						$.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:geoSel,coicop:coicops})})
				).then(function(ds) {
					EstLib.overrideCountryNames(ds.dimension.geo.category.label);
					ds = JSONstat(ds).Dataset(0);

					//clear previous
					svg.selectAll("*").remove();

					var n = coicops.length;
					var yearMin = 1996, yearMax = 2016; //TODO replace
					var stack = d3.layout.stack().offset("zero");

					var data = [];
					for(var c=0; c<coicops.length; c++){
						var data_ = [];
						for(var year=yearMin; year<yearMax; year++){
							var value = ds.Data({coicop:coicops[c],time:""+year,geo:geoSel}).value;
							data_.push({x:year,y0:0,y:value});
						}
						data.push(data_);
					}
					data = stack(data);

					var x = d3.scale.linear().domain([yearMin, yearMax]).range([0, width]);
					var y = d3.scale.linear().domain([0, 1000]).range([height, 0]);

					//area construction function
					var area = d3.svg.area()
					.x(function(d) { return x(d.x); })
					.y0(function(d) { return y(d.y0); })
					.y1(function(d) { return y(d.y0 + d.y); });

					svg.selectAll("path").data(data).enter().append("path").attr("d", area)
					.style("fill", function() { return color(Math.random()); }); //TODO use coicopToColor
				}, function() {
					console.log("Could not load data"); //TODO better
				});

			};

			//
			updateChart();
		}, function() {
			console.log("Could not load initialisation data"); //TODO better
		});
	});
}(jQuery, window.PrVis = window.PrVis || {} ));
