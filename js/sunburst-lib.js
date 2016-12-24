/**
 *
 * Sunburst visualisation
 *
 * @author julien Gaffuri
 *
 */
(function(d3) {

    d3.sunburst = function(options){
        options = options || {};
        options.div = options.div || "sunburst";
        options.radius = options.radius || 150;
        options.codeToColor = options.codeToColor || function(code){ return "#d9d9d9"; };
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



        //data name,(size),children
        out.set = function(data){
            //draw shapes
            svg.datum(data).selectAll("path")
                .data(partition.value(function(d) { return d.size?d.size:1; }).nodes)
                .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .attr("id", function(d) { return "arc"+d.name; })
                .attr("stroke-width", 0.5)
                .attr("stroke", "gray")
                .attr("fill", function(d) { return out.options.codeToColor(d.name); })
                //.on("mouseover", function(d) { highlightCofog(d.name); })
                //.on("mouseout", function(d) { unHighlightCofog(d.name); })
            ;

        };

        //console.log("aaa");
        return out;
    }

}(d3));
