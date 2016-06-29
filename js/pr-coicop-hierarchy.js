/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://jgaffuri.github.io/EurostatVisu/coicop_hierarchy.html

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

			//index data
			data = PrVis.index(data,"code");
			var codes = Object.keys(data);

			//link to father and build children list
			for(var i=0; i<codes.length; i++){
				var code = codes[i];
				var father = data[code.substring(0, code.length-1)];
				if(father) data[code].father = father;
				data[code].children = [];
			}

			//fill children list
			for(var i=0; i<codes.length; i++) data[data[code].father].children.push(code);
			data["CP00"].children = ["CP01","CP02","CP03","CP04","CP05","CP06","CP07","CP08","CP09","CP10","CP11","CP12"];

			console.log(data);

			/*
			var dataH = {code:"CP00", children:[]};
			var buildHierarchyFrom = function(root){
				//find children codes in data
				var childrenCodes = data[root.code].children;
				//TODO something to do when no children? fill .size attribute?

				//for each, build object and launch recursivelly
				for(i=0; i<childrenCodes.length; i++){
					var child = {code:childrenCodes[i], children:[]};
					root.children.push(child);
					buildHierarchyFrom(child);
				}
			};
			buildHierarchyFrom(dataH);
			data = null;
			 */
			console.log(dataH);

			var nodes = tree.nodes(dataH),
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
			.text(function(d) { return d.code+" - "+data[d.code].desc; });
		});

		d3.select(self.frameElement).style("height", diameter - 150 + "px");




	});
}(jQuery));
