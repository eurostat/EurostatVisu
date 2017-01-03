/**
 *
 * Sunburst visualisation
 * Generic function. reusable.
 *
 * @author julien Gaffuri
 *
 */
(function(d3) {

    d3.sunburst = function(){

        //codesHierarchy: code,children[]
        var codesHierarchy = {},
            div = "sunburst",
            radius = 150,
            strokeWidth =  1.0,
            strokeColor = "white",
            codeToColor = function(){ return "#ccc";},
            highlight = function(code){ d3.select("#arc"+code).attr("fill","#aaa");},
            unhighlight = function(code){ d3.select("#arc"+code).attr("fill",codeToColor(code));},

            codeToLabelText = function(code){ return code;},
            fontFamily = function(depth){ return "'Myriad Pro', Myriad, MyriadPro-Regular, 'Myriad Pro Regular', MyriadPro, 'Myriad Pro', 'Liberation Sans', 'Nimbus Sans L', 'Helvetica Neue', vegur, Vegur, Helvetica, Arial, sans-serif";},
            fontSize = function(depth){ return 12;},
            fontFill = function(depth){ return "#333";},
            fontWeight = function(depth){ return depth<=1?"bold":"regular";};


        var partition = d3.layout.partition().sort(null).size([2 * Math.PI, radius * radius]);
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


        var out = function () {
            var svg = d3.select("#"+div).append("svg")
                .attr("width", 2*radius).attr("height", 2*radius)
                .append("g").attr("transform", "translate(" + radius + "," + radius + ")");
            var shapesG = svg.append("g").attr("id", div+"_shapes");
            var labelsG = svg.append("g").attr("id", div+"_labels");

            //draw shapes
            var shapes = shapesG.datum(codesHierarchy).selectAll("path")
                .data(partition.value(function(d) { return iniValues?iniValues[d.code]:1; }).nodes)
                .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .attr("id", function(d) { return "arc"+d.code; })
                .attr("stroke-width", strokeWidth)
                .attr("stroke", strokeColor)
                .attr("fill", function(d) { return codeToColor(d.code); })
                .on("mouseover", function(d) { highlight(d.code); })
                .on("mouseout", function(d) { unhighlight(d.code); })
                .each(arcStash);
        };

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
            labelsG.datum(codesHierarchy).selectAll("text")
                .data(partition.nodes)
                .enter().append("text")
                .attr("transform", function(d) {
                    var v= d.value || 0;
                    if(codesHierarchy.value) v/=codesHierarchy.value;
                    var angle = (d.x + d.dx*0.5) * 180/Math.PI;
                    if(v<0.024){ angle -= 90; if(angle<0) angle+=360; }
                    if(angle>90 && angle<270) angle-=180;
                    if(angle<0) angle+=360;
                    return "translate(" + arc.centroid(d) + ")"+ (angle==0?"":"rotate("+angle+")");
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .style("font-family", function(d) { return fontFamily(d.depth); })
                .style("font-size", function(d) { return fontSize(d.depth); })
                .style("fill", function(d) { return fontFill(d.depth); })
                .style("font-weight", function(d) { return fontWeight(d.depth); })
                .html(function(d) {
                    if(!d.depth) return "";  // no inner ring label
                    var v= d.value || 0;
                    if(codesHierarchy.value) v/=codesHierarchy.value;
                    if(v<0.017) return "";
                    return codeToLabelText(d.code);
                })
                .on("mouseover", function(d) { highlight(d.code); })
                .on("mouseout", function(d) { unhighlight(d.code); });

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


        out.codesHierarchy = function(v) { if (!arguments.length) return codesHierarchy; codesHierarchy=v; return out; };
        out.div = function(v) { if (!arguments.length) return div; div=v; return out; };
        out.radius = function(v) { if (!arguments.length) return radius; radius=v; return out; };
        out.strokeWidth = function(v) { if (!arguments.length) return strokeWidth; strokeWidth=v; return out; };
        out.strokeColor = function(v) { if (!arguments.length) return strokeColor; strokeColor=v; return out; };
        out.codeToColor = function(v) { if (!arguments.length) return codeToColor; codeToColor=v; return out; };
        out.highlight = function(v) { if (!arguments.length) return highlight; highlight=v; return out; };
        out.unhighlight = function(v) { if (!arguments.length) return unhighlight; unhighlight=v; return out; };

        out.codeToLabelText = function(v) { if (!arguments.length) return codeToLabelText; codeToLabelText=v; return out; };
        out.fontFamily = function(v) { if (!arguments.length) return fontFamily; fontFamily=v; return out; };
        out.fontSize = function(v) { if (!arguments.length) return fontSize; fontSize=v; return out; };
        out.fontFill = function(v) { if (!arguments.length) return fontFill; fontFill=v; return out; };
        out.fontWeight = function(v) { if (!arguments.length) return fontWeight; fontWeight=v; return out; };

        return out;
    }

}(d3));
