/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {
        //https://bost.ocks.org/mike/join/

        var data = [
            {x:10,y:10},
        ]; //TODO

        var circle =
            d3.select("#join").append("svg").attr("width", 100).attr("height", 100)
                .selectAll("circle")
                .data(data);

        circle.exit().remove();

        circle.enter().append("circle").attr("r", 2.5);

        circle
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

    });
}(jQuery));
