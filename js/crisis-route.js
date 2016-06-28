/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://www.nytimes.com/interactive/2013/10/09/us/yellen-fed-chart.html?_r=0
		//https://www.dashingd3js.com/svg-paths-and-d3js

		var info = $("#info");

		$.when(
				//get inflation data
				//$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{unit:"RCH_A",coicop:"CP00"})}),
				$.ajax({url:EstLib.getEstatDataURL("prc_hicp_aind",{unit:"RCH_A_AVG",coicop:"CP00"})}),
				//get unemployment data
				//$.ajax({url:EstLib.getEstatDataURL("une_rt_m",{age:"TOTAL",sex:"T",s_adj:"NSA",unit:"PC_ACT"})}) //use seasonal adjusted?
				$.ajax({url:EstLib.getEstatDataURL("une_rt_a",{age:"TOTAL",sex:"T",unit:"PC_ACT"})})
		).then(function(inflationData, unemploymentData) {
			EstLib.overrideCountryNames(inflationData[0].dimension.geo.category.label);
			EstLib.overrideCountryNames(unemploymentData[0].dimension.geo.category.label);

			//decode data
			inflationData = JSONstat(inflationData).Dataset(0);
			unemploymentData = JSONstat(unemploymentData).Dataset(0);

			//function to compute intersection of two arrays
			var intersection = function(array1,array2){ return array1.filter(function(n) { return array2.indexOf(n) != -1; }); };

			//get time and geo
			var times = intersection(inflationData.Dimension("time").id, unemploymentData.Dimension("time").id);
			var geos = intersection(inflationData.Dimension("geo").id, unemploymentData.Dimension("geo").id);
			geos.splice(geos.indexOf("US"),1);
			geos.splice(geos.indexOf("TR"),1);

			var margin = {top: 15, right: 10, bottom: 40, left: 50};
			var width = 800 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
			var svg = d3.select("#curves").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

			//unemployment scale
			var xScale = d3.scale.linear().domain([0, 25]).range([0, width]);
			//inflation scale
			var yScale = d3.scale.linear().domain([-2, 15]).range([height, 0]);


			//draw x grid
			var gratUnemp = svg.append("g").attr("transform", "translate("+margin.left+","+(height+margin.top)+")");
			var xAxis = d3.svg.axis().scale(xScale).tickSize(-height).tickFormat(function(d) {return d+"%";}).orient("bottom");
			gratUnemp.call(xAxis);
			//gratUnemp.select("line").style({stroke:"#aaa","stroke-width":1.3});
			//gratUnemp.select("text").style({font:"10px sans-serif"});
			gratUnemp.style({stroke:"#aaa","stroke-width":0.3,font:"10px sans-serif"});
			gratUnemp.select("path").style({fill:"none"});

			//draw y grid
			var gratInfl = svg.append("g").attr("transform", "translate("+margin.left+","+margin.top+")");
			var yAxis = d3.svg.axis().scale(yScale).tickSize(-width).tickFormat(function(d) {return d+"%";}).orient("left");
			gratInfl.call(yAxis);
			gratInfl.style({stroke:"#aaa","stroke-width":0.3,font:"10px sans-serif"});
			gratInfl.select("path").style({fill:"none"});


			//the chart element
			var chart = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//build dataset
			var dataset = {};
			for(var i=0; i<geos.length; i++){
				var geo = geos[i];
				dataset[geo]=[];
				for(var j=0; j<times.length; j++){
					var time = times[j];
					var infl = inflationData.Data({time:time,geo:geo}).value;
					if(!infl) continue;
					var unemp = unemploymentData.Data({time:time,geo:geo}).value;
					if(!unemp) continue;
					dataset[geo].push({time:time,geo:geo,infl:infl,unemp:unemp})
				}
			}

			//drawing function
			var lineFunction = d3.svg.line()
			.x(function(d) { return xScale(d.unemp); })
			.y(function(d) { return yScale(d.infl); })
			//.interpolate("linear")
			.interpolate("cardinal")
			;

			//draw chart
			for(var i=0; i<geos.length; i++){
				var geo = geos[i];
				chart.append("path")
				.attr("d", lineFunction(dataset[geo]))
				.attr("id", "curve"+geo)
				.attr("stroke", "#555").attr("stroke-width", 1).attr("fill", "none")
				.on("mouseover", function() {
					var o = d3.select(this);
					o.attr("stroke", "blue").attr("stroke-width", 3);
					var geoName = inflationData.Dimension("geo").Category(o.attr("id").replace("curve","")).label;
					info.html(geoName);
				})
				.on("mouseout", function() {
					d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
					info.html("");
				})
				;
			}

			//axis labels
			gratUnemp.append("text").attr("x",width*0.5-30).attr("y",20).attr("dy", ".35em").text("Unemployment rate");
			gratInfl.append("text").attr("x",2-margin.left).attr("y",100).attr("dy", ".35em").text("Inflation rate");

		}, function() {
			console.log("Could not load data");
		}
		);
	});
}(jQuery));
