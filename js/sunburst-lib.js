/**
 *
 * Sunburst visualisation
 *
 * @author julien Gaffuri
 *
 */
(function(d3) {
    //See http://bl.ocks.org/mbostock/4063423

    d3.sunburst = function(options){
        options = options || {};
        options.div = options.div || "sunburst";
        options.radius = options.radius || 150;
        options.strokeWidth = options.strokeWidth || 1.0;
        options.strokeColor = options.strokeColor || "gray";
        options.codeToColor = options.codeToColor || function(code){ return "#d9d9d9"; };
        options.highlight = options.highlight || function(code){ d3.select("#arc"+code).attr("fill","darkgray"); };
        options.unhighlight = options.unhighlight || function(code){ d3.select("#arc"+code).attr("fill",out.options.codeToColor(code)); };
        options.duration = options.duration || 1500;

        var out = {options:options};

        var svg = d3.select("#"+options.div).append("svg")
            .attr("width", 2*options.radius).attr("height", 2*options.radius)
            .append("g").attr("transform", "translate(" + options.radius + "," + options.radius + ")");
        var partition = d3.layout.partition().sort(null).size([2 * Math.PI, options.radius * options.radius]);
        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


        //functions used for transition
        function stash(d) { d.x0 = d.x; d.dx0 = d.dx; }
        function arcTween(a) {
            var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
            return function(t) {
                var b = i(t);
                a.x0 = b.x;
                a.dx0 = b.dx;
                return arc(b);
            };
        }

        var path;

        //build chart with values (optional)
        //codesHierarchy: code,children[]
        //values: code:value
        out.build = function(codesHierarchy,values){
            //draw shapes
            path = svg.datum(codesHierarchy).selectAll("path")
                //.data(partition.nodes)
                //.data(partition.value(function(d) { return 1; }).nodes)
                .data(partition.value(function(d) { return values?values[d.code]:1; }).nodes)
                .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .attr("id", function(d) { return "arc"+d.code; })
                .attr("stroke-width", out.options.strokeWidth)
                .attr("stroke", out.options.strokeColor)
                .attr("fill", function(d) { return out.options.codeToColor(d.code); })
                .on("mouseover", function(d) { out.options.highlight(d.code); })
                .on("mouseout", function(d) { out.options.unhighlight(d.code); })
                .each(stash)
            ;
        };

        //set values, with transition
        //values: code:value
        out.set = function(values){
            path
                .data(partition.value(function(d) { return values?values[d.code]:1; }).nodes)
                .transition().duration(out.options.duration).attrTween("d", arcTween);
        };


        //console.log("aaa");
        return out;
    }

}(d3));
