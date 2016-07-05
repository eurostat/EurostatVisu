/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        //build svg element
        var margin = {top: 0, right: 0, bottom: 0, left: 5};
        var width = 250 - margin.left - margin.right, height = 250 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")")
            ;

        //geo list and time slider
        var geoList = $("#geoList");
        var sli = $("#timeslider");
        sli.css("width",300);

        //info div
        var infoDiv = d3.select("#info").attr("style", "height:"+ (height + margin.top + margin.bottom - 34) + "px");

        //the selection
        var geoSel = PrVis.getParameterByName("geo") || "EU28";
        var timeSel = PrVis.getParameterByName("time") || "2013";

        //some quantile data
        var quantileDict = {P:{percentage:1,text:"percent"},T:{percentage:5,text:"twentieth"},D:{percentage:10,text:"tenth"}};

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
                    return d.value || 0;
                };

                //compute second twentile as first decile value minus five first percentiles values
                var get2Twentilevalue = function(){
                    var v = getValue("DECILE1");
                    for(i=1;i<=5;i++) v -= getValue("PERCENTILE"+i);
                    return Math.round(v*10)/10;
                };
                //compute 19th twentile value as last decile value, minus five last percentiles values
                var get19Twentilevalue = function(){
                    var v = getValue("DECILE10");
                    for(i=95;i<=99;i++) v -= getValue("PERCENTILE"+i);
                    return Math.round(v*10)/10;
                };

                //check if percentile data is available
                var percentileDataPresent = function(first){
                    var nbs = first? [1,2,3,4,5] : [95,96,97,98,99];
                    //check presence of 5 percentiles
                    for(var i=0;i<=4;i++){
                        var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:"PERCENTILE"+nbs[i]});
                        if(!d || !d.value){
                            console.log("No percentile data for PERCENTILE"+nbs[i]);
                            return false;
                        }
                    }
                    return true;
                };

                //chart axis scales
                var xScale = d3.scale.linear().domain([0,40]).range([0, width]); //TODO adapt max? min?
                var yScale = d3.scale.linear().domain([0,100]).range([0, height]);

                //update the chart
                var update = function(){
                    //clear previous
                    chart.selectAll("*").remove();

                    //distribution rectangles group
                    var rects = chart.append("g").attr("id","disrect");

                    //draw distribution rectangle
                    var addRect = function(quantileType,quantileNb,factor,value,pos,size){
                        rects.append("rect").attr("y",yScale(pos)).attr("x",value<0?-xScale(-factor*value):0)
                            .attr("width",value<0?0:xScale(factor*value)).attr("height",yScale(size))
                            .attr("fill","peru")
                            .on("mouseover", function() {
                                //TODO improve text
                                var html = [];
                                html.push("The income of the ",PrVis.getNumbered(quantileNb)," poorest ");
                                html.push(quantileDict[quantileType].text);
                                html.push(" of the population is ",value,"% of the total income.<br>If the income was equally distributed, it should be ");
                                html.push(quantileDict[quantileType].percentage,"%.");
                                infoDiv.html(html.join(""));
                                d3.select(this).attr("fill","darkred ");
                            })
                            .on("mouseout", function() {
                                infoDiv.text("");
                                d3.select(this).attr("fill","peru");
                            })
                        ;
                    };

                    if(percentileDataPresent(true)){
                        //first 5 percentiles
                        for(i=0;i<=4;i++) addRect("P",i+1,10,getValue("PERCENTILE"+(i+1)),i,1);
                        //second twentile
                        addRect("T",2,2,get2Twentilevalue(),5,5);
                    } else {
                        //first decile
                        addRect("D",1,1,getValue("DECILE1"),0,10);
                    }

                    //8 deciles in the middle
                    for(i=2;i<=9;i++) addRect("D",i,1,getValue("DECILE"+i),10*(i-1),10);

                    if(percentileDataPresent(false)){
                        //19th twentile
                        addRect("T",19,2,get19Twentilevalue(),90,5);
                        //last 5 percentiles
                        for(i=95;i<=99;i++) addRect("P",i,10,getValue("PERCENTILE"+i),i,1);
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
