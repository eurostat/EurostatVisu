/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {
        //TODO show median
        //TODO time slider position
        //TODO better show when no data
        //TODO show quintiles, quartiles, etc.

        //build svg element
        var margin = {top: 0, right: 0, bottom: 30, left: 30};
        var width = 600 - margin.left - margin.right, height = 400 - margin.top - margin.bottom;
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var chart = svg.append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")");

        //define arrow marker
        svg.append("defs").append("marker")
            .attr({"id":"arrow", "viewBox":"0 -5 10 10", "refX":5, "refY":0, "markerWidth":3, "markerHeight":3, "orient":"auto"})
            .append("path").attr("d", "M0,-5L10,0L0,5");

        //draw axis labels
        var labelsG = svg.append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")");
        labelsG.append("text").attr("class","chartLabels").attr("x",47).attr("y",height+17).text("Lowest incomes");
        labelsG.append('line').attr({class:"arrow", "x1":150, "y1":height+25, "x2":40, "y2":height+25});
        labelsG.append("text").attr("class","chartLabels").attr("x",width-150).attr("y",height+17).text("Highest incomes");
        labelsG.append('line').attr({class:"arrow", "x1":width-150, "y1":height+25, "x2":width-45, "y2":height+25});
        labelsG.append("text").attr("class","chartLabels").attr("transform", "translate(17,"+(height*0.5)+")rotate(-90)").attr("x",0).attr("y",0).text("Income level");
        labelsG.append('line').attr({class:"arrow", "x1":25, "y1":height*0.5+5, "x2":25, "y2":height*0.5-90});

        //geo list and time slider
        var geoList = $("#geoList");
        var sli = $("#timeslider");
        sli.css("width",200);

        //info div
        var infoDiv = d3.select("#info").attr("style", "height:"+ (height + margin.top + margin.bottom - 34) + "px");

        //the selection
        var geoSel = PrVis.getParameterByName("geo") || "EU28";
        var timeSel = PrVis.getParameterByName("time") || "2013";

        //some quantile data
        var quantileDict = {P:{percentage:1,text:"percent"},T:{percentage:5,text:"twentieth"},TF:{percentage:4,text:"twentyfifth"},D:{percentage:10,text:"tenth"}};

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",
                quantile:["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"]
            })})
        ).then(function(data) {
                var i;

                //simplify geo label texts
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);

                //build geolist
                var geos = data.Dimension("geo").id;
                EstLib.fillGeoList(geoList, geos, function(geo){return data.Dimension("geo").Category(geo).label;});
                $('#geoList option[value='+geoSel+']').attr('selected', 'selected');
                geoList.selectmenu({
                    change:function(){ geoSel=geoList.find(":selected").attr("value"); update(); }
                })
                    .selectmenu("menuWidget").css("height","200px")/*.css("font-size","70%")*/;

                //build time slider
                var times = data.Dimension("time").id;
                sli.slider({
                    min: +times[0],
                    max: +times[times.length-1],
                    step: 1,
                    value: timeSel,
                    change: function() { timeSel= ""+sli.slider("value"); update(); }
                    //slide: function() { timeSel= ""+sli.slider("value"); update(); }
                }).each(function() {
                    var opt = $(this).data().uiSlider.options;
                    var www = opt.max - opt.min;
                    for (var i = opt.min; i <= opt.max; i+=5)
                        sli.append( $('<label>' + i + '</label>').css('left', ((i-opt.min)/www*100) + '%') );
                });



                //try to retrieve a quantile value
                var getValue = function(quantile){
                    var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:quantile});
                    if(!d) return 0;
                    //if(d.value<0) console.log(quantile,d.value)
                    return d.value || 0;
                };

                //compute second twentile as first decile value minus five first percentiles values
                var get2TwentileValue = function(){
                    var v = getValue("DECILE1");
                    for(i=1;i<=5;i++) v -= getValue("PERCENTILE"+i);
                    return Math.round(v*10)/10;
                };
                //compute 19th twentile value as last decile value, minus five last percentiles values
                var getTwentyFifthValue = function(){
                    var v = getValue("DECILE10");
                    for(i=95;i<=100;i++) v -= getValue("PERCENTILE"+i);
                    return Math.round(v*10)/10;
                };

                //check if percentile data is available
                var percentileDataPresent = function(first){
                    var nbs = first? [1,2,3,4,5] : [95,96,97,98,99];
                    //check presence of 5 percentiles
                    for(var i=0;i<=4;i++){
                        var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:"PERCENTILE"+nbs[i]});
                        if(!d || !d.value){
                            //console.log("No percentile data for PERCENTILE"+nbs[i]);
                            return false;
                        }
                    }
                    return true;
                };

                //chart axis scales
                var xScale = d3.scale.linear().domain([0,100]).range([0, width]);
                var yMax = 75; //TODO adapt max? min?
                var yScale = d3.scale.linear().domain([0,yMax]).range([0, height]);

                //update the chart
                var update = function(){
                    //clear previous
                    chart.selectAll("*").remove();

                    //distribution rectangles group
                    var rects = chart.append("g").attr("id","disrect");

                    //draw distribution rectangle
                    var addRect = function(quantileType,quantileNb,factor,value,pos,size){
                        rects.append("rect").attr("y",yScale(yMax-factor*value)).attr("x",xScale(pos))
                            .attr("width",xScale(size)).attr("height",yScale(factor*value))
                            .attr("fill","peru")
                            .on("mouseover", function() {
                                //TODO improve text - for twentyfifth
                                var html = [];
                                html.push(
                                    "The income of the <b>",
                                    PrVis.getNumbered(quantileNb),
                                    " ",
                                    quantileDict[quantileType].text,
                                    "</b> of the population with the ",
                                    "lowest",
                                    " income is <b>",
                                    value,
                                    "%</b> of the total income.<br>If the income was equally distributed, it would be <b>",
                                    quantileDict[quantileType].percentage,
                                    "%</b>."
                                    //TODO it is then X times more/less than it would be. The income is X times higher/lower than the average income.
                                );
                                infoDiv.html(html.join(""));
                                d3.select(this).attr("fill","darkred ");
                            })
                            .on("mouseout", function() {
                                infoDiv.text("");
                                d3.select(this).attr("fill","peru");
                            })
                        ;
                    };

                    //background rectangle
                    rects.append("rect").attr({y:0,x:0,width:width,height:height,fill:"#f5f5f5"});

                    if(percentileDataPresent(true)){
                        //first 5 percentiles
                        for(i=0;i<=4;i++) addRect("P",i+1,10,getValue("PERCENTILE"+(i+1)),i,1);
                        //second twentile
                        addRect("T",2,2,get2TwentileValue(),5,5);
                    } else {
                        //first decile
                        addRect("D",1,1,getValue("DECILE1"),0,10);
                    }

                    //8 deciles in the middle
                    for(i=2;i<=9;i++) addRect("D",i,1,getValue("DECILE"+i),10*(i-1),10);

                    if(percentileDataPresent(false)){
                        //19th twentyfifth
                        addRect("TF",24,2.5,getTwentyFifthValue(),90,4);
                        //last 5 percentiles
                        for(i=95;i<=100;i++) addRect("P",i,10,getValue("PERCENTILE"+i),i-1,1);
                    } else {
                        //last decile
                        addRect("D",10,1,getValue("DECILE10"),90,10);
                    }

                    //select geoSel in list
                    $('#geoList option[value='+geoSel+']').attr('selected', 'selected');
                    //bold time legend label
                    d3.selectAll(".lgdT").attr("font-weight","normal").attr("fill","black");
                    d3.selectAll(".lgdT[time='"+timeSel+"']").attr("font-weight","bold").attr("fill","maroon");
                    //update title
                    d3.select("#geoTitle").text(data.Dimension("geo").Category(geoSel).label);
                    d3.select("#timeTitle").text(timeSel);
                };

                update();

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
