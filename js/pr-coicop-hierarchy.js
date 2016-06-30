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

		var diameter = 1300;

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

			//link to father
			for(var i=0; i<codes.length; i++){
				var childCode = codes[i];
				if( ["A","B","C","D","E","F","G","H","I","J","K","L"].indexOf(childCode.substring(childCode.length-1, childCode.length)) != -1 ) continue;
				//if(childCode.indexOf("C") != -1) continue;
				var father = data[childCode.substring(0, childCode.length-1)];
				if(father) data[childCode].father = father;
				//else console.log(childCode);
			}

			//link to children
			for(i=0; i<codes.length; i++) {
				var child = data[codes[i]];
				if(!child.father) continue;
				if(!child.father.children) child.father.children = [];
				child.father.children.push(child);
			}
			data.CP00.children = [data.CP01,data.CP02,data.CP03,data.CP04,data.CP05,data.CP06,data.CP07,data.CP08,data.CP09,data.CP10,data.CP11,data.CP12];

			data = data.CP00;

			var nodes = tree.nodes(data),
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
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

			node.append("circle")
			.attr("r", 4.5);

			node.append("text")
			.attr("dy", ".31em")
			.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			.attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
			.text(function(d) { return d.code/*+" - "+d.desc*/; });
		});

		d3.select(self.frameElement).style("height", diameter - 150 + "px");

	});
}(jQuery));
