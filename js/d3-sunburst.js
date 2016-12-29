/**
 *
 * Sunburst visualisation
 *
 * @author julien Gaffuri
 *
 */
(function(d3) {
    //See http://bl.ocks.org/mbostock/4063423

    //codesHierarchy: code,children[]
    d3.sunburst = function(codesHierarchy, iniValues, options){
        options = options || {};
        options.div = options.div || "sunburst";
        options.radius = options.radius || 150;
        options.strokeWidth = options.strokeWidth || 1.0;
        options.strokeColor = options.strokeColor || "white";
        options.codeToColor = options.codeToColor || function(){ return "#ccc"; };
        options.highlight = options.highlight || function(code){ d3.select("#arc"+code).attr("fill","#aaa"); };
        options.unhighlight = options.unhighlight || function(code){ d3.select("#arc"+code).attr("fill",out.options.codeToColor(code)); };

        options.codeToLabelText = options.codeToLabelText || function(code){ return code; };
        options.fontFamily = options.fontFamily || function(depth){ return "'Myriad Pro', Myriad, MyriadPro-Regular, 'Myriad Pro Regular', MyriadPro, 'Myriad Pro', 'Liberation Sans', 'Nimbus Sans L', 'Helvetica Neue', vegur, Vegur, Helvetica, Arial, sans-serif"; };
        options.fontSize = options.fontSize || function(depth){ return 12; };
        options.fontFill = options.fontFill || function(depth){ return "#333"; };
        options.fontWeight = options.fontWeight|| function(depth){ return depth<=1?"bold":"regular"; };

        var out = {codesHierarchy:codesHierarchy,options:options};

        var partition = d3.layout.partition().sort(null).size([2 * Math.PI, options.radius * options.radius]);
        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        //functions used for shapes transition
        function arcStash(d) { d.x0 = d.x; d.dx0 = d.dx; }
        function arcTween(d) {
            var i = d3.interpolate({x: d.x0, dx: d.dx0}, d);
            return function(t) {
                var b = i(t);
                d.x0 = b.x; d.dx0 = b.dx;
                return arc(b);
            };
        }

        var svg = d3.select("#"+options.div).append("svg")
            .attr("width", 2*options.radius).attr("height", 2*options.radius)
            .append("g").attr("transform", "translate(" + options.radius + "," + options.radius + ")");
        var shapesG = svg.append("g").attr("id", out.options.div+"_shapes");
        var labelsG = svg.append("g").attr("id", out.options.div+"_labels");

        //draw shapes
        var shapes = shapesG.datum(out.codesHierarchy).selectAll("path")
            .data(partition.value(function(d) { return iniValues?iniValues[d.code]:1; }).nodes)
            .enter().append("path")
            .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
            .attr("d", arc)
            .attr("id", function(d) { return "arc"+d.code; })
            .attr("stroke-width", out.options.strokeWidth)
            .attr("stroke", out.options.strokeColor)
            .attr("fill", function(d) { return out.options.codeToColor(d.code); })
            .on("mouseover", function(d) { out.options.highlight(d.code); })
            .on("mouseout", function(d) { out.options.unhighlight(d.code); })
            .each(arcStash);

        //set values, with transition
        //values: code:value
        out.set = function(values, duration){
            duration = duration || 0;
            out.eraseLabels(duration*0.75);
            shapes.data(partition.value(function(d) { return values?values[d.code]:1; }).nodes)
                .transition().duration(duration).attrTween("d", arcTween)
                .each("end", function(){ out.drawLabels(duration*0.5); })
            ;
        };

        //draw labels
        out.drawLabels = function(duration){
            duration = duration || 0;

            //hide labels group
            labelsG.style("opacity","0");

            //draw labels
            labelsG.datum(out.codesHierarchy).selectAll("text")
                .data(partition.nodes)
                .enter().append("text")
                .attr("transform", function(d) {
                    var v= d.value || 0;
                    var angle = (d.x + d.dx*0.5) * 180/Math.PI;
                    if(v<2){ angle -= 90; if(angle<0) angle+=360; }
                    if(angle>90 && angle<270) angle-=180;
                    if(angle<0) angle+=360;
                    return "translate(" + arc.centroid(d) + ")"+ (angle==0?"":"rotate("+angle+")");
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .style("font-family", function(d) { return out.options.fontFamily(d.depth); })
                .style("font-size", function(d) { return out.options.fontSize(d.depth); })
                .style("fill", function(d) { return out.options.fontFill(d.depth); })
                .style("font-weight", function(d) { return out.options.fontWeight(d.depth); })
                .html(function(d) {
                    if(!d.depth) return "";  // no inner ring label
                    return out.options.codeToLabelText(d.code);
                })
                .on("mouseover", function(d) { out.options.highlight(d.code); })
                .on("mouseout", function(d) { out.options.unhighlight(d.code); });

            //show labels group
            labelsG.transition().duration(duration).style("opacity","1");
        };

        //remove labels
        out.eraseLabels = function(duration){
            duration = duration || 0;

            labelsG.transition().duration(duration).style("opacity","0").each("end", function(){
                labelsG.selectAll("*").remove();
                labelsG.style("opacity","1");
            });
        };

        out.drawLabels(0);

        return out;
    }

}(d3));
