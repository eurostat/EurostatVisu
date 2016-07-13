/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {
        //https://bost.ocks.org/mike/join/

        var data = []; //TODO

        var circle = d3.select("#join").append("svg").selectAll("circle")
            .data(data);

        circle.exit().remove();

        circle.enter().append("circle").attr("r", 2.5);

        circle
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });


    });
}(jQuery));
