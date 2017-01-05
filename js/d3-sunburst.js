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
        var
            codesHierarchy = {}, //codesHierarchy: code,children[]
            div = "sunburst", //the div element where to build the svg element
            radius = 150, //the chart's size
            strokeWidth = 1.0,
            strokeColor = "white",
            codeToColor = function(code){ return "#ccc";},
            mouseover = function(code){ d3.select("#arc"+code).attr("fill","#aaa"); },
            mouseout = function(code){ d3.select("#arc"+code).attr("fill",codeToColor(code));},

            codeToLabelText = function(code){ return code;},
            fontFamily = function(depth){ return "'Myriad Pro', Myriad, MyriadPro-Regular, 'Myriad Pro Regular', MyriadPro, 'Myriad Pro', 'Liberation Sans', 'Nimbus Sans L', 'Helvetica Neue', vegur, Vegur, Helvetica, Arial, sans-serif";},
            fontSize = function(depth){ return 12;},
            fontFill = function(depth){ return "#333";},
            fontWeight = function(depth){ return depth<=1?"bold":"regular";},
            fontOrientation = function(depth){ return depth<=1?"h":"n";},
            labelRotationParameter = function(depth){ return 1;},
            labelRemovalParameter = function(depth){ return 1; }
            ;

        var
            partition,
            shapesG,
            labelsG,
            shapes
            ;

        //the output object
        var out = {};

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        var build = function(){
            partition = d3.layout.partition().sort(null).size([2 * Math.PI, radius * radius]);
            d3.select("#"+div).selectAll("*").remove();
            var svg = d3.select("#"+div).append("svg")
                .attr("width", 2*radius).attr("height", 2*radius)
                .append("g").attr("transform", "translate(" + radius + "," + radius + ")");
            shapesG = svg.append("g").attr("id", div+"_shapes");
            labelsG = svg.append("g").attr("id", div+"_labels");

            //draw shapes
            shapes = shapesG.datum(codesHierarchy).selectAll("path")
                .data(partition.value(function(d) { return 1; }).nodes)
                .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .attr("id", function(d) { return "arc"+d.code; })
                .attr("stroke-width", strokeWidth)
                .attr("stroke", strokeColor)
                .attr("fill", function(d) { return codeToColor(d.code); })
                .on("mouseover", function(d) { mouseover(d.code); })
                .on("mouseout", function(d) { mouseout(d.code); })
                .each( function(d) { d.x0 = d.x; d.dx0 = d.dx; } );

            out.drawLabels(0);
        };

        //set values, with transition
        //values: code:value
        out.set = function(values, duration){
            duration = duration || 0;

            out.eraseLabels(duration*0.75);

            var arcTween = function(d) {
                var i = d3.interpolate({x: d.x0, dx: d.dx0}, d);
                return function(t) {
                    var b = i(t);
                    d.x0 = b.x; d.dx0 = b.dx;
                    return arc(b);
                };
            };

            shapes.data(partition.value(function(d) { return values?values[d.code]:1; }).nodes)
                .transition().duration(duration).attrTween("d", arcTween)
                .each("end", function(){ out.drawLabels(duration*0.5); })
            ;
            return out;
        };

        //draw labels
        out.drawLabels = function(duration){
            duration = duration || 0;

            //hide labels group
            labelsG.style("opacity","0");

            //draw labels
            labelsG.datum(codesHierarchy).selectAll("text")
                //.data(partition.value(function(d) { return 1; }).nodes)
                .data(partition.nodes)
                .enter().append("text")
                .attr("transform", function(d) {
                    var ori = fontOrientation(d.depth);
                    if(ori==="h") return "translate(" + arc.centroid(d) + ")";
                    var angle = (d.x + d.dx*0.5) * 180/Math.PI;
                    var v= d.value || 0;
                    if(codesHierarchy.value) v/=codesHierarchy.value;
                    v*=12/fontSize(d.depth);
                    if(v<0.024*labelRotationParameter(d.depth)){ angle -= 90; if(angle<0) angle+=360; }
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
                    v*=12/fontSize(d.depth);
                    if(v<0.017*labelRemovalParameter(d.depth)) return "";
                    return codeToLabelText(d.code);
                })
                .on("mouseover", function(d) { mouseover(d.code); })
                .on("mouseout", function(d) { mouseout(d.code); });

            //show labels group
            labelsG.transition().duration(duration).style("opacity","1");

            return out;
        };

        //remove labels
        out.eraseLabels = function(duration){
            duration = duration || 0;

            labelsG.transition().duration(duration).style("opacity","0").each("end", function(){
                labelsG.selectAll("*").remove();
                labelsG.style("opacity","1");
            });

            return out;
        };



        out.codesHierarchy = function(v) {
            if (!arguments.length) return codesHierarchy;
            codesHierarchy=v;
            build();
            return out;
        };

        out.div = function(v) {
            if (!arguments.length) return div;
            div=v;
            build();
            return out;
        };

        out.radius = function(v) {
            if (!arguments.length) return radius;
            radius=v;
            build();
            return out;
        };

        out.strokeWidth = function(v) {
            if (!arguments.length) return strokeWidth;
            strokeWidth=v;
            shapesG.selectAll("path").attr("stroke-width", strokeWidth);
            return out;
        };
        out.strokeColor = function(v) {
            if (!arguments.length) return strokeColor;
            strokeColor=v;
            shapesG.selectAll("path").attr("stroke", strokeColor);
            return out;
        };

        out.codeToColor = function(v) {
            if (!arguments.length) return codeToColor;
            codeToColor=v;
            shapesG.selectAll("path").attr("fill", function(d) { return codeToColor(d.code); });
            return out;
        };

        out.setmouseover = function(v) {
            if (!arguments.length) return mouseover;
            mouseover=v;
            //shapesG.on("mouseover", null);
            //shapesG.on("mouseover", function(d) { mouseover(d.code); });
            //labelsG.on("mouseover", null);
            //labelsG.on("mouseover", function(d) { mouseover(d.code); });
            return out;
        };
        out.setmouseout = function(v) {
            if (!arguments.length) return mouseout;
            mouseout=v;
            //shapesG.on("mouseout", null);
            //shapesG.on("mouseout", function(d) { mouseout(d.code); });
            //labelsG.on("mouseout", null);
            //labelsG.on("mouseout", function(d) { mouseout(d.code); });
            return out;
        };


        out.codeToLabelText = function(v) {
            if (!arguments.length) return codeToLabelText;
            codeToLabelText=v;
            //TODO
            return out;
        };
        out.fontFamily = function(v) {
            if (!arguments.length) return fontFamily;
            fontFamily=v;
            //TODO
            return out;
        };
        out.fontSize = function(v) {
            if (!arguments.length) return fontSize;
            fontSize=v;
            //TODO
            return out;
        };
        out.fontFill = function(v) {
            if (!arguments.length) return fontFill;
            fontFill=v;
            //TODO
            return out;
        };
        out.fontWeight = function(v) {
            if (!arguments.length) return fontWeight;
            fontWeight=v;
            //TODO
            return out;
        };
        out.fontOrientation = function(v) {
            if (!arguments.length) return fontOrientation;
            fontOrientation=v;
            //TODO
            return out;
        };
        out.labelRotationParameter = function(v) {
            if (!arguments.length) return labelRotationParameter;
            labelRotationParameter=v;
            //TODO
            return out;
        };
        out.labelRemovalParameter = function(v) {
            if (!arguments.length) return labelRemovalParameter;
            labelRemovalParameter=v;
            //TODO
            return out;
        };

        return out;
    }

}(d3));
