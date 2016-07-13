/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {
        //https://bost.ocks.org/mike/join/

        var data = [
            {x:10,y:10}
        ];

        var circle =
            d3.select("#join").append("svg").attr("width", 100).attr("height", 100)
                .selectAll("circle")
                .data(data);

        circle.enter().append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", 0).transition().attr("r", 2.5);
        circle.exit().transition().attr("r", 0).remove();



    });
}(jQuery));
