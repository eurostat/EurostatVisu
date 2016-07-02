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
        var width = 500 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")")
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
                    var yScale = d3.scale.linear().domain([0,100]).range([0, height]);

                    //clear previous
                    chart.selectAll("*").remove();

                    //draw chart
                    //chart.append("rect").attr("fill","lightgray")
                    //    .attr("y",yScale(0)).attr("x",xScale(0)).attr("width",xScale(100)).attr("height",yScale(100));

                    //first 5 percentiles
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(0)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(1)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(2)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(3)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(4)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));

                    //second twentile
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(5)).attr("x",xScale(0)).attr("width",70).attr("height",yScale(5));

                    //8 deciles in the middle
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(10)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(20)).attr("x",xScale(0)).attr("width",55).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(30)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(40)).attr("x",xScale(0)).attr("width",55).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(50)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(60)).attr("x",xScale(0)).attr("width",55).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(70)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(10));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(80)).attr("x",xScale(0)).attr("width",55).attr("height",yScale(10));

                    //19th twentile
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(90)).attr("x",xScale(0)).attr("width",70).attr("height",yScale(5));

                    //last 5 percentiles
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(95)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(96)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(97)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(98)).attr("x",xScale(0)).attr("width",50).attr("height",yScale(1));
                    chart.append("rect").attr("class","disrect")
                        .attr("y",yScale(99)).attr("x",xScale(0)).attr("width",100).attr("height",yScale(1));
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
