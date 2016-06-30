/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//TODO mouse pan?

		//http://bl.ocks.org/mbostock/4063550

		//TODO sunburst
		//https://bl.ocks.org/mbostock/4348373
		//https://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad

		var diameter = 2200;
		var svgPadding = 300;

		//SVG element
		var svg = d3.select("#chart").append("svg")
			.attr("width", diameter+2*svgPadding).attr("height", diameter+2*svgPadding)
			.append("g")
			.attr("transform", "translate(" + (diameter/2+svgPadding) + "," + (diameter/2+svgPadding) + ")");

		var tree = d3.layout.tree()
			.size([360, diameter/2])
			.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });



		//colors
		var color = colorbrewer.Set3[12];
		var coicopToColor = function(coicop){
			var fam = coicop.substring(0,4);
			if(fam==="CP00") return "black";
			return color[+(fam.replace("CP",""))-1];
		};


		//load coicop data
		d3.csv("data/coicop.csv", function(error, data) {
			if (error) throw error;

			//index data
			data = PrVis.index(data,"code");
			var codes = Object.keys(data);

			//link to father
			for(var i=0; i<codes.length; i++){
				var childCode = codes[i];
				if( ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"].indexOf(childCode.substring(childCode.length-1, childCode.length)) != -1 ) continue;
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

			//draw links
			var link = svg.selectAll(".link")
				.data(links)
				.enter().append("path")
				.attr("class", "link")
				.attr("d", d3.svg.diagonal.radial()
					.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; })
			);

			//draw nodes
			var node = svg.selectAll(".node")
				.data(nodes)
				.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
			//draw circles
			node.append("circle")
				.attr("r", 4)
				.attr("fill",function(d) { return coicopToColor(d.code); });
			//draw labels - code
			node.append("text")
				.attr("dy", ".31em")
				.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
				.attr("transform", function(d) { return d.x < 180 ? "translate(8,-4)" : "rotate(180)translate(-8,-4)"; })
				.text(function(d) { return d.code; });
			//draw labels - description
			node.append("text")
				.attr("dy", ".31em")
				.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
				.attr("transform", function(d) { return d.x < 180 ? "translate(8,4)" : "rotate(180)translate(-8,4)"; })
				.text(function(d) { return d.desc; });
		});

		//d3.select(self.frameElement).style("height", diameter - 150 + "px");

	});
}(jQuery));
