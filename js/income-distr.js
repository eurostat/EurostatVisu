/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        var quantiles = ["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"];

        //build svg element
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 1000 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("transform", "translate("+margin.left+","+margin.top+ ")")
            ;

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",quantile:quantiles})})
        ).then(function(data) {

                //simplify geo label texts
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);

                var getGeoSelection = function(){ return "FR"; }; //TODO get from UI
                var getTimeSelection = function(){ return "2015"; }; //TODO get from UI

                var updateChart = function(){
                    var geoSel = getGeoSelection();
                    var timeSel = getTimeSelection();

                    //scales
                    var xScale = d3.scale.linear().domain([0,100]).range([0, width]);
                    var yScale = d3.scale.linear().domain([0,100]).range([height, 0]);

                    //clear previous
                    chart.selectAll("*").remove();

                    //draw chart
                    chart.append("rect").attr("x",0).attr("y",0).attr("width",100).attr("height",100);
                    //style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9" />

                };
                updateChart();

                //TODO add geo list
                //TODO add time slider

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
