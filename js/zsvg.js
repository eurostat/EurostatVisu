/**
 *
 * @author julien Gaffuri
 *
 */
(function() {
    //TODO See http://bl.ocks.org/mbostock/3680999
    //TODO https://github.com/jillix/svg.pan-zoom.js/

    //build svg element
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = 600 - margin.left - margin.right, height = 400 - margin.top - margin.bottom;
    var svg = d3.select("#zsvg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")");

    //TODO draw random stuff
    for(var i=0; i<50; i++){
        console.log(i);
        svg.append("rect").attr({x:10*i,y:10*i,height:5,width:5});
    }
    console.log(svg);

    //TODO add pan and zoom

}());
