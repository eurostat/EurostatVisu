/**
 * 
 * Visualisation of coicop information as sunburst
 * 
 * @author julien Gaffuri
 *
 */
(function($, PrVis) {
	$(function() {

		//TODO show flags
		//TODO do something when no data
		//TODO fill empty spaces ?

		//
		PrVis.modifyCoicopHierarchy();

		//size
		var r = 350;

		//year/geo
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
		var titleContentSave = null;

		//svg element
		var svg = d3.select("#sb").append("svg")
		.attr("width", 2*r).attr("height", 2*r)
		.append("g").attr("transform", "translate(" + r + "," + r + ")");
		var partition = d3.layout.partition().sort(null).size([2 * Math.PI, r * r]);
		var arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return Math.sqrt(d.y); })
		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

		//legend
		var lgd = $("#legend");
		lgd.css("height", 2*r);
		var infoDiv = null;
		var refreshLegend = function(){
			lgd.empty();
			if($("input:radio[name=ctype]:checked").val() === "CP00"){
				var mouseoverFun = function() { highlightCoicop($(this).attr("id").replace("lgdElt","")); };
				var mouseoutFun = function() { unHighlightCoicop($(this).attr("id").replace("lgdElt","")); };
				PrVis.buildCOICOPLegend(lgd, coicopToColor, mouseoverFun, mouseoutFun);
			} else {}
			//info
			infoDiv = $("<div>").appendTo(lgd).css("font-size","1.5em").css("margin-top","10px")/*.css("border","solid 1px").css("width","auto")*/;
		};
		refreshLegend();

		var highlightCoicop = function(coicop){
			$("#arc"+coicop).attr("fill","red");
			if($("input:radio[name=ctype]:checked").val() === "CP00") $("#lgdEltRect"+coicop.substring(0,4)).css("fill","red");
			var v = dataIndex[sli.slider("value")][geoList.find(":selected").attr("value")][coicop];
			var html = PrVis.coicopsDict[coicop].desc + " (" + coicop + ")";
			if($("input:radio[name=modeR]:checked").val() === "size") html += "<br>" + d3.round(v,1).toFixed(1) + "&#8240;";
			infoDiv.html(html);
		};
		var unHighlightCoicop = function(coicop){
			$("#arc"+coicop).attr("fill",coicopToColor(coicop));
			if($("input:radio[name=ctype]:checked").val() === "CP00") $("#lgdEltRect"+coicop.substring(0,4)).css("fill",coicopToColor(coicop));
			infoDiv.html("");
		};

		var geoList = $("#geoList");

		var sli = $("#timeslider");
		sli.css("width",2*r);

		//get base information on years and geos
		$.when($.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{coicop:"CP00"})}))
		.then(function(ds) {
			EstLib.overrideCountryNames(ds.dimension.geo.category.label);
			ds = JSONstat(ds).Dataset(0);
			var years = ds.Dimension("time").id.sort();
			var geos = ds.Dimension("geo").id;

			//option
			var cType = $("#ctype");
			$("input[name='ctype']").change(function () {
				updateChart();
				refreshLegend();
			});
			cType.buttonset();

			//option
			$("input[name='modeR']").change(function () {
				if($(this).attr("value") === "count") {
					//disable
					$("#geoListDiv").hide();
					sli.hide();
					titleContentSave = title.html();
					title.html("Products hierarchy");
				} else {
					//enable
					$("#geoListDiv").show();
					sli.show();
					title.html(titleContentSave);
				}
				updateChart();
			});
			$("#modeR").buttonset();

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

			//build years slider
			sli.slider({
				min: +years[0],
				max: +years[years.length-1],
				step: 1,
				value: years[years.length-1],
				change: function( event, ui ) {
					$("#yearTXT").text(sli.slider("value"));
					updateChart();
				},
				slide: function( event, ui ) {
					$("#yearTXT").text(sli.slider("value"));
					updateChart();
				}
			}).each(function() {
				//add labels 
				var opt = $(this).data().uiSlider.options;
				var www = opt.max - opt.min;
				for (var i = 1996; i <= opt.max; i+=opt.step)
					sli.append( $('<label>' + i + '</label>').css('left', ((i-opt.min)/www*100) + '%') );
			});
			$("#yearTXT").text(sli.slider("value"));


			var updateChart_ = function(data,year,geo){
				//build data structure
				var root = {};
				var buildDatasetRec = function(code, obj){
					obj.name = code;
					var children = PrVis.coicopsDict[code].children.sort();
					if(children.length>0){
						obj.children = [];
						for(var i=0; i<children.length; i++){
							var childCode = children[i];
							var childObj = {};
							obj.children.push(childObj);
							buildDatasetRec(childCode, childObj);
						}
					}
					else 
						obj.size = data?data[code]:1;
				};
				var rootLabel = $("input:radio[name=ctype]:checked").val();
				var rootLabelC = rootLabel === "CP00";
				buildDatasetRec(rootLabel,root);

				//clear previous
				svg.selectAll("*").remove();

				//draw shapes
				svg.datum(root).selectAll("path")
				.data(partition.value($("input:radio[name=modeR]:checked").val() === "count"? function() { return 1; } : function(d) { return d.size; }).nodes)
				.enter().append("path")
				.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
				.attr("d", arc)
				.attr("id", function(d) { return "arc"+d.name; })
				.attr("stroke-width", 0.5)
				.attr("stroke", "gray")
				.attr("fill", function(d) {
					//var lev = 2 - Math.min(d.name.length-4,2)
					return coicopToColor(d.name);
				})
				.on("mouseover", function(d) { highlightCoicop(d.name); })
				.on("mouseout", function(d) { unHighlightCoicop(d.name); });

				//draw labels
				svg.datum(root).selectAll("text")
				.data(partition.value($("input:radio[name=modeR]:checked").val() === "count"? function() { return 1; } : function(d) { return d.size; }).nodes)
				.enter().append("text")
				.attr("transform", function(d) {
					var angle = 0;
					var lev = rootLabelC? Math.min(d.name.length-4,2) >= 1 : $.inArray(d.name, PrVis.coicopsDict["SA"].children)<0;
					if(lev){
						var v = data? data[d.name] : 0;
						angle = (d.x + d.dx*0.5) * 180/Math.PI;
						if(v<30){ angle -= 90; if(angle<0) angle+=360; }
						if(angle>90 && angle<270) angle-=180;
						if(angle<0) angle+=360;
					}
					return "translate(" + arc.centroid(d) + ")"+ (angle==0?"":"rotate("+angle+")");
				})
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.style("font-weight", function(d) {
					var lev = rootLabelC? Math.min(d.name.length-4,2) == 0 : $.inArray(d.name, PrVis.coicopsDict["SA"].children)>=0;
					if(lev) return "bold";
				})
				.style("fill", function(d) {
					var lev = rootLabelC? Math.min(d.name.length-4,2) >= 1 : $.inArray(d.name, PrVis.coicopsDict["SA"].children)<0;
					if(lev) return "#555";
				})
				.style("font-size", function(d) {
					var lev = rootLabelC? Math.min(d.name.length-4,2) >= 1 : $.inArray(d.name, PrVis.coicopsDict["SA"].children)<0;
					if(lev) return "10";
				})
				.html(function(d) {
					if(d.name==="CP00" || d.name==="SA") return;
					var lev = rootLabelC? Math.min(d.name.length-4,2) == 0 : $.inArray(d.name, PrVis.coicopsDict["SA"].children)>=0;
					if(lev && !data) return d.name;
					if(!data) {
						return d.name;
					}
					var v = data[d.name];
					if(lev) return (rootLabelC? d.name : PrVis.coicopsDict[d.name].desc) + "<tspan x=\"0\" dy=\"1.2em\">" + d3.round(v,1).toFixed(1) + " &#8240;</tspan>";
					if(v>5) return d.name;
				})
				.on("mouseover", function(d) { highlightCoicop(d.name); })
				.on("mouseout", function(d) { unHighlightCoicop(d.name); });

			};

			var updateChart = function(){
				if($("input:radio[name=modeR]:checked").val() === "count"){
					updateChart_();
					return;
				}
				var geoSel = geoList.find(":selected").attr("value");
				var yearSel = sli.slider("value");

				//get data and update chart
				PrVis.getProductWeightData(geoSel, yearSel, dataIndex, function(){ updateChart_(dataIndex[yearSel][geoSel],yearSel,geoSel); });
			};

			//
			updateChart();

		}, function() {
			console.log("Could not load initialisation data"); //TODO better
		});
	});
}(jQuery, window.PrVis = window.PrVis || {} ));
