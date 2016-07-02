/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        var quantiles = ["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"];

        //build svg element
        var margin = {top: 0, right: 0, bottom: 10, left: 10};
        var width = 500 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")")
            ;

        var geoSel = "FR";
        var timeSel = "2013";

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",quantile:quantiles})})
        ).then(function(data) {

                //simplify geo label texts
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);

                var updateChart = function(){

                    var getValue = function(quantile){
                        var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:quantile});
                        if(!d) return 0;
                        return d.value || 0;
                    };

                    var get2Twentilevalue = function(){
                        var v = getValue("DECILE1");
                        for(i=1;i<=5;i++) v -= getValue("PERCENTILE"+i);
                        return v;
                    };
                    var get19Twentilevalue = function(){
                        var v = getValue("DECILE10");
                        for(i=95;i<=99;i++) v -= getValue("PERCENTILE"+i);
                        return v;
                    };

                    //scales
                    var xScale = d3.scale.linear().domain([0,50]).range([0, width]); //TODO adapt max
                    var yScale = d3.scale.linear().domain([0,100]).range([0, height]);

                    //clear previous
                    chart.selectAll("*").remove();

                    //background
                    chart.append("rect").attr("fill","#eee")
                        .attr("y",yScale(0)).attr("x",xScale(0)).attr("width",xScale(100)).attr("height",yScale(100));


                    //draw chart rectangles
                    var rects = chart.append("g").attr("id","disrect");

                    var addRect = function(group,value,pos,size){
                        group.append("rect").attr("y",yScale(pos)).attr("x",xScale(0))
                            .attr("width",xScale(value)).attr("height",yScale(size));
                    };

                    var i;
                    //first 5 percentiles
                    for(i=0;i<=4;i++) addRect(rects,10*getValue("PERCENTILE"+(i+1)),i,1);
                    //second twentile
                    addRect(rects,2*get2Twentilevalue(),5,5);
                    //8 deciles in the middle
                    for(i=2;i<=9;i++) addRect(rects,1*getValue("DECILE"+i),10*(i-1),10);
                    //19th twentile
                    addRect(rects,2*get19Twentilevalue(),90,5);
                    //last 5 percentiles
                    for(i=95;i<=99;i++) addRect(rects,10*getValue("PERCENTILE"+i),i,1);

                };

                //legend
                //width = 100;
                var lgd = d3.select("#legend").append("svg").attr("width", width).attr("height", height + margin.top + margin.bottom);
                var topLgd = 10;

                //geo legend
                var geos = data.Dimension("geo").id;
                geos.sort(EstLib.geoComparison);
                var dy = margin.top+topLgd;
                lgd.append("g").selectAll("text").data(geos).enter().append("text")
                    .attr("class", "lgd")
                    .attr("geo", function(d) { return d; })
                    .attr("x", 0)
                    .attr("y", function() { dy+=12; return dy-10; })
                    .text(function(d) { return d; })
                    .on("mouseover", function() { geoSel = d3.select(this).attr("geo"); updateChart(); })
                    //.on("mouseout", function() { unHighlightGeo(d3.select(this).attr("geo")); })
                ;

                //time legend
                var times = data.Dimension("time").id;
                dy = margin.top+topLgd;
                lgd.append("g").selectAll("text").data(times).enter().append("text")
                    .attr("class", "lgd")
                    .attr("time", function(d) { return d; })
                    .attr("x", 60)
                    .attr("y", function() { dy+=12; return dy-10; })
                    .text(function(d) { return d; })
                    .on("mouseover", function() { timeSel = d3.select(this).attr("time"); updateChart(); })
                    //.on("mouseout", function() { unHighlightTime(d3.select(this).attr("time")); })
                ;

                updateChart();

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
