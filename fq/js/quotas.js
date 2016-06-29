//julien Gaffuri - 04/2014 - http://sourceforge.net/users/jgaffuri

var speciesByYear=JSON.parse(speciesByYearJSON);
var speciesData=JSON.parse(speciesDataJSON);
var countriesData=JSON.parse(countriesDataJSON);
var countriesGeo=JSON.parse(countriesGeoJSON);
var FMZData=JSON.parse(FMZDataJSON);
var FMZGeo=JSON.parse(FMZGeoJSON);

var quotas;
var maxValueCNTR;
var minValueCNTR;
var maxValueFMZ;
var minValueFMZ;
var clicked=false;
var sel_ = null;
var sel = [];
var selColor = "#FF0000";
var selOpacityMap = 1;

var chart, svg, sankey, path;
var cwidth = 400, cheight = 600;
var formatNumber = d3.format(".0f");
var format = function(d) { return formatNumber(d) + " t"; };

var map;
var mwidth = 550, mheight = 600;
var backLayer,FMZLayer,countriesLayer,labelsLayer;
var FMZStyle,countriesStyle;

var nodeFillColorCNT = "#CC7A29";
var nodeFillColorFMZ = "#0033CC";
var nodeFillOpacity = 0.8;
var nodeOpacityMap = 0.8;
var nodeFillOpacityMap = 0.6;
var nodeStrokeColorCNT = "#000000";
var nodeStrokeColorFMZ = "#000000";
var nodeStrokeSizeCNT = 1;
var nodeStrokeSizeFMZ = 1;
var nodeFillOpacity_ = 0.3;
var nodeOpacityMap_ = 0.8;
var nodeFillOpacityMap_ = 0.05;

var linkColor = "#555";
var linkOpacity = 0.4;
var linkOpacity_ = 0.1;

var urlData;
var defaultSpeciesSelection="ANF";

function load() {
	//?y=2012&s=SAL&sel=GER
	urlData = queryString.parse(location.search);
	defaultSpeciesSelection = urlData.s;

	//load years
	for(var i=0;i<speciesByYear.length;i++){
		var year=speciesByYear[i][0];
		$("#yearsList").append("<option value='"+year+"'>"+year+"</option>");
	}
	if(typeof urlData.y != 'undefined') $("#yearsList").val(urlData.y);


	//build chart

	//build svg element
	svg = d3.select("#chart").append("svg")
	//.remove()
	.attr("width", cwidth)
	.attr("height", cheight)
	.attr("id", "svgchart");

	//build sankey
	sankey = d3.sankey().nodeWidth(22).nodePadding(4).size([cwidth, cheight]);
	path = sankey.link();


	//build map
	map = L.map('map', { center: [50, 4], zoom:3, attributionControl:false, minZoom:1, maxZoom:6 });
	L.control.scale({imperial: false}).addTo(map);
	map.on('click', function(e) {
		clicked=false;
		unfocus();
	});


	//build layers
	//backLayer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {"opacity": 0.3,});
	//backLayer = L.tileLayer('https://a.tiles.mapbox.com/v3/examples.map-9d0r2yso/{z}/{x}/{y}.png', {"opacity": 1,});
	backLayer = L.tileLayer('https://a.tiles.mapbox.com/v3/examples.map-20v6611k/{z}/{x}/{y}.png', {"opacity": 1,});
	//backLayer = L.tileLayer('https://b.tiles.mapbox.com/v3/examples.map-dev-fr/{z}/{x}/{y}.png', {"opacity": 1,});

	//labelsLayer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {});

	function getMapFillColorCNTR(feature){
		//var value = $("#rect_"+feature.id)[0].__data__.value;
		return nodeFillColorCNT;
	}

	function getFillColorFMZ(feature){
		//var value = $("#rect_"+feature.id)[0].__data__.value;
		return nodeFillColorFMZ;
	}

	//countries style
	countriesStyle = function (feature) {
		if(sel == null || sel.length==0)
			return {color:nodeStrokeColorCNT, weight:nodeStrokeSizeCNT, fillColor:getMapFillColorCNTR(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};

		if( $.inArray(feature.id, sel) != -1 )
			if(feature.id==sel_)
				if(clicked)
					return {color:selColor, weight:nodeStrokeSizeCNT*2.5, fillColor:getMapFillColorCNTR(feature), opacity:selOpacityMap, fillOpacity:nodeFillOpacityMap,};
				else
					return {color:nodeStrokeColorCNT, weight:nodeStrokeSizeCNT*2.5, fillColor:getMapFillColorCNTR(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};
			else
				return {color:nodeStrokeColorCNT, weight:nodeStrokeSizeCNT, fillColor:getMapFillColorCNTR(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};
		else
			return {color:nodeStrokeColorCNT, weight:nodeStrokeSizeCNT, fillColor:getMapFillColorCNTR(feature), opacity:nodeOpacityMap_, fillOpacity:nodeFillOpacityMap_,};
	};

	//FMZ style
	FMZStyle = function (feature) {
		if(sel == null || sel.length==0)
			return {color:nodeStrokeColorFMZ, weight:nodeStrokeSizeFMZ, fillColor:getFillColorFMZ(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};

		if( $.inArray(feature.id, sel) != -1 )
			if(feature.id==sel_)
				if(clicked)
					return {color:selColor, weight:nodeStrokeSizeFMZ*2.5, fillColor:getFillColorFMZ(feature), opacity:selOpacityMap, fillOpacity:nodeFillOpacityMap,};
				else
					return {color:nodeStrokeColorFMZ, weight:nodeStrokeSizeFMZ*2.5, fillColor:getFillColorFMZ(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};
			else
				return {color:nodeStrokeColorFMZ, weight:nodeStrokeSizeFMZ, fillColor:getFillColorFMZ(feature), opacity:nodeOpacityMap, fillOpacity:nodeFillOpacityMap,};
		else
			return {color:nodeStrokeColorFMZ, weight:nodeStrokeSizeFMZ, fillColor:getFillColorFMZ(feature), opacity:nodeOpacityMap_, fillOpacity:nodeFillOpacityMap_,};
	};

	//add background
	backLayer.addTo(map);
	//add labels
	//labelsLayer.addTo(map);

	yearChanged();
}

function yearChanged() {
	//get selected year
	var selectedYear = $('#yearsList').find(":selected").text();
	//store selected species
	var selectedSpecies = $('#speciesList').find(":selected").val();
	if(typeof selectedSpecies === 'undefined') selectedSpecies = defaultSpeciesSelection;
	for(var i=0;i<speciesByYear.length;i++){
		var year=speciesByYear[i][0];
		if(year!=selectedYear) continue;
		var species=speciesByYear[i][1];
		//clean previous and fill with new
		$("#speciesList").empty(); 
		for(var j=0;j<species.length;j++){
			var code = species[j];
			$("#speciesList").append("<option value='"+code+"'>"+speciesData[code]+"</option>");
			//select it if it was previously selected
			if(species[j] == selectedSpecies) $("#speciesList").val(selectedSpecies);
		}
		break;
	}
	speciesChanged();
}

function speciesChanged() {
	//get selection
	var selectedSpecies = $('#speciesList').find(":selected").text();
	var selectedYear = $('#yearsList').find(":selected").text();

	//update fish image
	$("#speciesImage").attr("src","data/fish_images/"+$('#speciesList').find(":selected").val()+".jpg");

	//update title with selected species and year
	$("#title").text("Quotas for "+selectedSpecies+" in "+selectedYear);

	//clear chart
	$("#svgchart").empty();

	//load data
	var selectedSpeciesCode = $('#speciesList').find(":selected").val().replace("/", "-");
	var dataFile = "data/"+selectedYear+"/"+selectedSpeciesCode+".json?v=3";
	d3.json(dataFile, function(quotas_) {
		quotas = quotas_;

		//mark countries and FMZ to be displayed
		for(var cntrCode in countriesData) countriesData[cntrCode][5]=false;
		for(var FMZCode in FMZData) FMZData[FMZCode][5]=false;
		for(var i=0;i<quotas.nodes.length;i++) {
			var obj;
			//countries
			obj = countriesData[quotas.nodes[i].name];
			if(typeof obj != 'undefined') obj[5]=true;
			//FMZ
			obj = FMZData[quotas.nodes[i].name];
			if(typeof obj != 'undefined') obj[5]=true;
		}


		//nodes
		for(var i=0;i<quotas.nodes.length;i++) {
			//set ids
			quotas.nodes[i].id = quotas.nodes[i].name;
			//change labels with country name
			if(typeof countriesData[quotas.nodes[i].name] != 'undefined')
				quotas.nodes[i].name = countriesData[quotas.nodes[i].name][0];
			//quotas.nodes[i].name = FMZData[quotas.nodes[i].name][0];
		}

		//prepare links
		for(var i=0;i<quotas.links.length;i++) {
			//set ids
			var link = quotas.links[i];
			link.id = quotas.nodes[link.source].id + "_" + quotas.nodes[link.target].id;
			link.id1 = quotas.nodes[link.source].id;
			link.id2 = quotas.nodes[link.target].id;
		}


		//update chart

		//link data to sankey
		sankey.nodes(quotas.nodes).links(quotas.links).layout(32);

		function clickChart(d){ click(d.id); }

		//draw links
		var link = svg.append("g").selectAll(".link")
		.data(quotas.links)
		.enter().append("path")
		.attr("class", function(d) { return "link "+d.id1+"_"+d.id2; })
		.attr("d", path)
		//.attr("id", function(d) { return d.id1+"_"+d.id2; })
		.attr("id1", function(d) { return d.id1; })
		.attr("id2", function(d) { return d.id2; })
		.on("mouseover", function (d){ if(clicked) return; focusLink(d.id); })
		.on("mouseout", function (d){ if(clicked) return; unfocus(d.id); })
		.on("click", clickChart)
		.style("fill","none")
		.style("stroke",linkColor)
		.style("stroke-width", function(d) { return Math.max(1, d.dy); })
		.style("opacity", linkOpacity)
		.sort(function(a, b) { return b.dy - a.dy; });

		//link tooltips
		link.append("title")
		//.text(function(d) { return d.value+"t\n"+d.source.name+"\n"+d.target.name; });
		.text(function(d) { return d.stockCode+"\n"+d.value+"t"; });

		//get nodes
		var node = svg.append("g").selectAll(".node")
		.data(quotas.nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		//draw node rectangles
		node.append("rect")
		.attr("height", function(d) { return d.dy; })
		.attr("width", sankey.nodeWidth())
		.attr("id", function(d) { return "rect_"+d.id; })
		.attr("class", "rect")
		.on("mouseover", function (d){ if(clicked) return; focusNode(d.id); })
		.on("mouseout", function (d){ if(clicked) return; unfocus(); })
		.on("click", clickChart)
		.style("fill-opacity", nodeFillOpacity)
		.style("stroke", selColor)
		.style("stroke-width", 0);
		//.style("fill", nodeFillColorCNT);

		//draw node tooltips
		node.append("title").text(function(d) { return getNodeText(d.id); });

		//draw node text
		node.append("text")
		.attr("x", -6)
		.attr("y", function(d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("transform", null)
		.attr("id", function(d) { return "text_"+d.id; })
		.attr("class", "nodetext unselectable")
		.text(function(d) { return d.name; })
		.filter(function(d) { return d.x < cwidth / 2; })
		.attr("x", 6 + sankey.nodeWidth())
		.attr("text-anchor", "start");
		//.style("font-size","10px");

		//apply different colors to nodes (countries and FMZ)
		//get values distributions
		var nodes = $('.rect');
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			//var value = node.__data__.value;
			if(node.id.replace("rect_","").length==3){
				//country
				$("#"+node.id).css({"fill": nodeFillColorCNT});
			}
			else{
				//FMZ
				$("#"+node.id).css({"fill": nodeFillColorFMZ});
			}
		}


		//update map

		//clean
		//if(map.hasLayer(labelsLayer)) map.removeLayer(labelsLayer);
		if(map.hasLayer(FMZLayer)) map.removeLayer(FMZLayer);
		if(map.hasLayer(countriesLayer)) map.removeLayer(countriesLayer);
		//if(map.hasLayer(backLayer)) map.removeLayer(backLayer);


		function clickMap(e){
			click(e.target.feature.id);
		}
		function mousemove(e){
			$("#popup").css({ left: e.containerPoint.x+"px", top: (e.containerPoint.y+25)+"px" });
		}
		function mouseover(e){
			var popup = $("<div></div>", {
	            id: "popup",
	            css: {position:"absolute",left:"0px",top:"0px",backgroundColor:"white",padding:"1px",border: "1px solid #ccc",fontSize:"12px"}
	        });
	        // Insert a headline into that popup
	        $("<div></div>", { html: getNodeText(e.target.feature.id,"html")}).appendTo(popup);
	        // Add the popup to the map
	        popup.appendTo("#map");
			if(clicked) return;
			focusNode(e.target.feature.id);
		}
		function mouseout(e){
	        $("#popup").remove();
			if(clicked) return;
			unfocus();
		}

		//add FMZ
		function onEachFeatureFMZ(feature, layer) {
			//layer.bindPopup("ahahaha!");
			layer.on({
				click:clickMap,
				mousemove:mousemove,
				mouseover:mouseover,
				mouseout:mouseout
			});
		}
		function filterFMZ(feature, layer) { return FMZData[feature.id][5]; }
		FMZLayer = L.geoJson(FMZGeo, {style:FMZStyle, onEachFeature:onEachFeatureFMZ, filter:filterFMZ});
		FMZLayer.addTo(map);

		//add countries
		function onEachFeatureCountries(feature, layer) {
			layer.on({
				click:clickMap,
				mousemove:mousemove,
				mouseover:mouseover,
				mouseout:mouseout
			});
		}
		function filterCountries(feature, layer) { return countriesData[feature.id][5]; }
		countriesLayer = L.geoJson(countriesGeo, {style:countriesStyle, onEachFeature:onEachFeatureCountries, filter:filterCountries});
		countriesLayer.addTo(map);


		//update FMZ descriptions text and assign FMZ node text
		var nodes = $(".nodetext");
		var desc="",j=1;
		for(var i=0;i<nodes.length;i++) {
			var node = nodes[i];
			if(typeof FMZData[node.__data__.name] == 'undefined') continue;
			//console.log(node);
			//console.log(node.id);
			//console.log(FMZData[node.__data__.name]);
			desc += "<b>("+j+")</b> "+FMZData[node.__data__.name][1]+". Code: <i>"+FMZData[node.__data__.name][0]+"</i><br>";
			node.innerHTML = "("+j+")";
			j++;
		}
		$("#fmzdesc").html(desc);

	});

}

function getNodeText(id,type){
	if(type=="html") return $("#rect_"+id)[0].__data__.value + "t";
	return $("#rect_"+id)[0].__data__.value + "t";
}

//get the ids of the nodes linked to given one
function getRelatedNodes(id){
	var ids = [];
	var a1 = $("path[id1='"+id+"']");
	for(var i=0;i<a1.length;i++)
		ids.push(a1[i].__data__.id2);
	var a2 = $("path[id2='"+id+"']");
	for(var i=0;i<a2.length;i++)
		ids.push(a2[i].__data__.id1);
	return ids;
}


function focusNode(id){
	//get related node ids
	var rel = getRelatedNodes(id);
	rel.push(id);

	//show sankey nodes
	$(".rect").css({"fill-opacity":nodeFillOpacity_,"stroke-width":0});
	for(var i=0;i<rel.length;i++)
		$("#rect_"+rel[i]).css({"fill-opacity":nodeFillOpacity});
	if(clicked) $("#rect_"+id).css({"stroke-width":1});

	//show sankey links
	$(".link").css({"opacity":linkOpacity_});
	$("path[id1='"+id+"']").css({"opacity": linkOpacity});
	$("path[id2='"+id+"']").css({"opacity": linkOpacity});

	//show map object
	sel_ = id;
	sel = rel;
	countriesLayer.setStyle(countriesStyle);
	FMZLayer.setStyle(FMZStyle);
}

function focusLink(id){
	var cntrId = $('.'+id).attr("id1");
	var fmzId = $('.'+id).attr("id2");

	//show chartlink
	$(".link").css({"opacity":linkOpacity_});
	$('.'+id).css({ "opacity":linkOpacity});

	//show sankey nodes
	$(".rect").css({"fill-opacity":nodeFillOpacity_,"stroke-width":0});
	$("#rect_"+cntrId).css({"fill-opacity":nodeFillOpacity});
	$("#rect_"+fmzId).css({"fill-opacity":nodeFillOpacity});

	//show map objects
	sel = [cntrId,fmzId];
	countriesLayer.setStyle(countriesStyle);
	FMZLayer.setStyle(FMZStyle);
}

function unfocus(){
	//unshow sankey node
	$(".rect").css({"fill-opacity":nodeFillOpacity, "stroke-width":0});

	//unshow sankey links
	$(".link").css({"opacity":linkOpacity});

	//unshow map object
	sel_ = null;
	sel = [];
	countriesLayer.setStyle(countriesStyle);
	FMZLayer.setStyle(FMZStyle);
}

function click(id){
	if(clicked)
		if(sel_==id) {
			clicked=false;
		} else {
			sel_=id;
		}
	else {
		clicked = true;
	}
	if(sel_!=null && sel_.indexOf("_")==-1) focusNode(sel_);
	else focusLink(sel_);
}
