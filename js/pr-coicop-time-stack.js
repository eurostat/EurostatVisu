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
		/*var getFamCode = function(coicop){
			if( $.inArray(coicop, PrVis.coicopsDict["SA"].children)>=0 ) return coicop;
			var parents = PrVis.coicopsDict[coicop].parents;
			if(parents.length == 0) return;
			for(var i=0; i<parents.length; i++){
				var out = getFamCode(parents[i]);
				if(out) return out;
			}
		};*/

		//title
		var title = $("#title");

		//svg elements
		var width = 800, height = 400, marginBottom = 30, marginSide = 20;
		var svg = d3.select("#stack").append("svg").attr("width", width).attr("height", height);
		var chart = svg.append("g").attr("transform", "translate("+marginSide+",0)");
		var grat = svg.append("g").attr("class", "xaxis").attr("transform", "translate("+marginSide+","+(height-marginBottom)+")");
		grat.style({fill:"none",stroke:"#777",font:"10px sans-serif"});

		//legend
		var lgd = $("#legend");
		lgd.css("height", height);
		var refreshLegend = function(){
			lgd.empty();
			if($("input:radio[name=ctype]:checked").val() === "CP00"){
				var mouseoverFun = function() { highlightCoicop($(this).attr("id").replace("lgdElt","")); };
				var mouseoutFun = function() { unHighlightCoicop($(this).attr("id").replace("lgdElt","")); };
				PrVis.buildCOICOPLegend(lgd, coicopToColor, mouseoverFun, mouseoutFun);
			} else {}
		};
		refreshLegend();

		var highlightCoicop = function(coicop){
			$("#area"+coicop).css("fill","red");
			$("#lgdEltRect"+coicop.substring(0,4)).css("fill","red");
		};
		var unHighlightCoicop = function(coicop){
			$("#area"+coicop).css("fill",coicopToColor(coicop));
			$("#lgdEltRect"+coicop.substring(0,4)).css("fill",coicopToColor(coicop));
		};

		var geoList = $("#geoList");

		//get base information on geos
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
			var geoURL = PrVis.getParameterByName("geo") || "EA";
			$('#geoList option[value="'+geoURL+'"]').attr('selected', 'selected');
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
					chart.selectAll("*").remove();

					//get years interval
					var years = ds.Dimension("time").id,
					yearMin = +years[0], yearMax = +years[years.length-1]

					//structure dataset
					data = [];
					for(var c=coicops.length-1; c>=0; c--){
						var coicop = coicops[c];
						var data_ = [];
						for(var year=yearMin; year<=yearMax; year++){
							var s = ds.Data({coicop:coicop,time:""+year,geo:geoSel});
							data_.push({year:year,y0:0,y:s.value});
							data_.coicop = coicop;
						}
						data.push(data_);
					}
					var stack = d3.layout.stack().offset("zero");
					data = stack(data);

					//scales
					var xScale = d3.scale.linear().domain([yearMin, yearMax]).range([0, width-2*marginSide]);
					var yScale = d3.scale.linear().domain([0, 1000]).range([height-marginBottom, 0]);

					//area construction function
					var area = d3.svg.area()
					.x(function(d) { return xScale(d.year); })
					.y0(function(d) { return yScale(d.y0); })
					.y1(function(d) { return yScale(d.y0 + d.y); });

					chart.selectAll("path").data(data).enter().append("path").attr("d", area)
					.style("fill", function(d) { return coicopToColor(d.coicop); })
					.attr("id", function(d) { return "area"+d.coicop; })
					.on("mouseover", function(d) { highlightCoicop(d.coicop); })
					.on("mouseout", function(d) { unHighlightCoicop(d.coicop); })
					//.interpolate("monotone") TODO test that

					//year labels
					grat.selectAll("*").remove();
					var xAxis = d3.svg.axis().scale(xScale).tickSize(-height).tickValues(years).tickFormat(function(d) {return d;}).orient("bottom");
					grat.call(xAxis);
					//rotate labels
					grat.selectAll(".xaxis text").attr("transform", function(d) { return "translate(" + (10+this.getBBox().height*-2) + "," + this.getBBox().height + ")rotate(-45)"; });

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
