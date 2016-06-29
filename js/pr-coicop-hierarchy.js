/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://bl.ocks.org/mbostock/4063550
		//sunburst

		var diameter = 960;

		var tree = d3.layout.tree()
		.size([360, diameter / 2 - 120])
		.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

		var diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

		var svg = d3.select("#chart").append("svg")
		.attr("width", diameter).attr("height", diameter - 150)
		.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

		d3.csv("data/coicop.csv", function(error, data) {
			if (error) throw error;

			data = PrVis.index(data,"code");
			var root = {code:"CP00", children:[
			                                   {code:"CP01", children:[]},
			                                   {code:"CP02", children:[]},
			                                   {code:"CP03", children:[]},
			                                   {code:"CP04", children:[]},
			                                   {code:"CP05", children:[]},
			                                   {code:"CP06", children:[]},
			                                   {code:"CP07", children:[]},
			                                   {code:"CP08", children:[]},
			                                   {code:"CP09", children:[]},
			                                   {code:"CP10", children:[]},
			                                   {code:"CP11", children:[]},
			                                   {code:"CP12", children:[]}
			                                   ]};

			var nodes = tree.nodes(root),
			links = tree.links(nodes);

			var link = svg.selectAll(".link")
			.data(links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", diagonal);

			var node = svg.selectAll(".node")
			.data(nodes)
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

			node.append("circle")
			.attr("r", 4.5);

			node.append("text")
			.attr("dy", ".31em")
			.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			.attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
			.text(function(d) { return data[d.code].desc; });
		});

		d3.select(self.frameElement).style("height", diameter - 150 + "px");




	});
}(jQuery));
