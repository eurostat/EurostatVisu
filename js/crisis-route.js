/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://www.nytimes.com/interactive/2013/10/09/us/yellen-fed-chart.html?_r=0
		//https://www.dashingd3js.com/svg-paths-and-d3js

		//try with annual data: 

		$.when(
				//get inflation data
				//$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{unit:"RCH_A",coicop:"CP00"})}),
				$.ajax({url:EstLib.getEstatDataURL("prc_hicp_aind",{unit:"RCH_A_AVG",coicop:"CP00"})}),
				//get unemployment data
				//$.ajax({url:EstLib.getEstatDataURL("une_rt_m",{age:"TOTAL",sex:"T",s_adj:"NSA",unit:"PC_ACT"})}) //TODO use seasonal adjusted?
				$.ajax({url:EstLib.getEstatDataURL("une_rt_a",{age:"TOTAL",sex:"T",unit:"PC_ACT"})})
		).then(function(inflationData, unemploymentData) {

			//decode data
			inflationData = JSONstat(inflationData).Dataset(0);
			unemploymentData = JSONstat(unemploymentData).Dataset(0);

			//function to compute intersection of two arrays
			var intersection = function(array1,array2){ return array1.filter(function(n) { return array2.indexOf(n) != -1; }); }

			//get time and geo
			var times = intersection(inflationData.Dimension("time").id, unemploymentData.Dimension("time").id)
			var geos = intersection(inflationData.Dimension("geo").id, unemploymentData.Dimension("geo").id)
			geos.splice(geos.indexOf("US"),1);
			geos.splice(geos.indexOf("TR"),1);

			var margin = {top: 10, right: 10, bottom: 20, left: 20};
			var width = 1000 - margin.left - margin.right, height = 700 - margin.top - margin.bottom;
			var svg = d3.select("#curves").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
			var chart = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			//var grat = svg.append("g").attr("class", "xaxis").attr("transform", "translate("+marginSide+","+(height-marginBottom)+")");
			//grat.style({fill:"none",stroke:"#777",font:"10px sans-serif"});

			//unemployment
			var xScale = d3.scale.linear().domain([0, 20]).range([0, width]);
			//inflation
			var yScale = d3.scale.linear().domain([-5, 20]).range([height, 0]);

			var lineFunction = function(geo) {
				return d3.svg.line()
				.x(function(d) { return xScale(unemploymentData.Data({time:d,geo:geo}).value); })
				.y(function(d) { return yScale(inflationData.Data({time:d,geo:geo}).value); })
				.interpolate("linear");
			}

			for(var i=0; i<geos.length; i++){
				var geo = geos[i];
				chart.append("path")
				.attr("d", lineFunction(geo)(times))
				.attr("stroke", function(d){ return geo==="EU28"?"blue":"gray"; })
				.attr("stroke-width", 1)
				.attr("fill", "none")
				;
			}

		}, function() {
			console.log("Could not load data");
		}
		);
	});
}(jQuery));
