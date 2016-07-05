/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://bl.ocks.org/mbostock/4063550

		//TODO mouse pan
		//TODO adapt label depending on level

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

		//TODO see options https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
		var tree = d3.layout.tree()
			.size([360, diameter/2])
			.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

		//return the coicop level, from 1 to 5
		var getLevel = function(coicop){
			if(coicop == "00") return 1;
			return coicop.length;
		};

		//returns the color of coicop family
		var color = colorbrewer.Set3[12];
		var coicopToColor = function(coicop){
			var fam = coicop.substring(0,2);
			if(fam==="00") return "gray";
			return color[+(fam)-1];
		};


		//load coicop data
		d3.csv("data/coicop.csv", function(error, data) {
			if (error) throw error;

			//remove CPs
			for(var i=0; i<data.length; i++) data[i].code = data[i].code.replace("CP","");

			//index data
			data = PrVis.index(data,"code");
			var codes = Object.keys(data);

			//link to father
			for(i=0; i<codes.length; i++){
				var childCode = codes[i];
				if( ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"].indexOf(childCode.substring(childCode.length-1, childCode.length)) != -1 ) continue;
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
			data["00"].children = [data["01"],data["02"],data["03"],data["04"],data["05"],data["06"],data["07"],data["08"],data["09"],data["10"],data["11"],data["12"]];
			data = data["00"];

			//TODO use that?
			/*var root = d3.stratify()
				.id(function(d) { return d.name; })
				.parentId(function(d) { return d.parent; })
			(table);*/

			//TODO see options
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

			var circleSize = [0,20,13,7,5,3];
			var fontSize = [0,18,16,12,10,9];
			var getFontSize = function(d) { return fontSize[getLevel(d.code)]; };

			//draw circles
			node.append("circle")
				.attr("r", function(d) {
					return circleSize[getLevel(d.code)];
				})
				.attr("fill",function(d) {
					return coicopToColor(d.code);
				});

			//TODO adapt text position
			//TODO on mouse over on nodes: show text?
			//draw labels - code
			node.append("text")
				.attr("dy", ".31em")
				.attr("font-size", getFontSize)
				.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
				.attr("transform", function(d) {
					var level = getLevel(d.code);
					switch(level){
						case 1: return "rotate("+ (90-d.x) +")translate(80,-30)";
						//case 2: return "rotate("+ (90-d.x) +")";
						case 2: return d.x < 180 ? "translate(18,0)" : "rotate(180)translate(-18,0)";
						case 3: return d.x < 180 ? "translate(11,0)" : "rotate(180)translate(-11,0)";
						case 4: return d.x < 180 ? "translate(8,0)" : "rotate(180)translate(-8,0)";
						case 5: return d.x < 180 ? "translate(8,0)" : "rotate(180)translate(-8,0)";
					}
				})
				.text(function(d) {
					var level = getLevel(d.code);
					switch(level){
						case 1: return d.desc + " ("+d.code+")";
						case 2: return d.desc + " ("+d.code+")";
						case 3: return d.desc + " ("+d.code+")";
						case 4: return d.desc + " ("+d.code+")";
						case 5: return d.desc + " ("+d.code+")";
					}
				});
		});

	});
}(jQuery));
