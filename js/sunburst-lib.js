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



        //data code,desc,(value),children
        out.build = function(codesHierarchy,data){
            //draw shapes
            svg.datum(codesHierarchy).selectAll("path")
                .data(partition.value(function(d) { return data?data[d.code]:1; }).nodes)
                .enter().append("path")
                .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
                .attr("d", arc)
                .attr("id", function(d) { return "arc"+d.code; })
                .attr("stroke-width", 0.5)
                .attr("stroke", "gray")
                .attr("fill", function(d) { return out.options.codeToColor(d.code); })
                //.on("mouseover", function(d) { highlightCofog(d.code); })
                //.on("mouseout", function(d) { unHighlightCofog(d.code); })
            ;


            out.set = function(values){
            }

            };

        //console.log("aaa");
        return out;
    }

}(d3));
