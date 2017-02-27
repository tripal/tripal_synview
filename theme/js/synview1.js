
// below is the data for test

var bed1= new C.BedModel({"chr":"at-Chr1","start":0.011649,"end":0.302315,"id":"32","color":"green"});
var bed2= new C.BedModel({"chr":"at-Chr2","start":18.833364,"end":19.262404,"id":"32","color":"green"});
var bed3= new C.BedModel({"chr":"at-Chr1","start":17.681157,"end":19.336115,"id":"45","color":"green"});
var bed4= new C.BedModel({"chr":"at-Chr3","start":5.844495,"end":7.530677,"id":"45","color":"green"});
var bed5= new C.BedModel({"chr":"at-Chr1","start":0.011649,"end":0.395528,"id":"61","color":"green"});
var bed6= new C.BedModel({"chr":"at-Chr3","start":22.291886,"end":22.952851,"id":"61","color":"green"});
var bed7= new C.BedModel({"chr":"at-Chr2","start":15.037662,"end":19.696821,"id":"131","color":"green"});
var bed8= new C.BedModel({"chr":"at-Chr3","start":19.29301,"end":23.309658,"id":"131","color":"green"});
var bed9= new C.BedModel({"chr":"at-Chr2","start":15.059763,"end":15.171353,"id":"146","color":"green"});
var bed10= new C.BedModel({"chr":"at-Chr3","start":3.623457,"end":3.701493,"id":"146","color":"green"});
var bed11= new C.BedModel({"chr":"at-Chr2","start":10.135605,"end":11.302191,"id":"152","color":"green"});
var bed12= new C.BedModel({"chr":"at-Chr4","start":14.878783,"end":16.077706,"id":"152","color":"green"});
var bed13= new C.BedModel({"chr":"at-Chr2","start":19.090953,"end":19.315241,"id":"158","color":"green"});
var bed14= new C.BedModel({"chr":"at-Chr4","start":0.362169,"end":0.785329,"id":"158","color":"green"});
var bed15= new C.BedModel({"chr":"at-Chr2","start":14.756711,"end":14.866598,"id":"189","color":"green"});
var bed16= new C.BedModel({"chr":"at-Chr5","start":18.829955,"end":19.0532,"id":"189","color":"green"});
var bed17= new C.BedModel({"chr":"at-Chr2","start":15.059763,"end":15.16075,"id":"201","color":"green"});
var bed18= new C.BedModel({"chr":"at-Chr5","start":1.877333,"end":1.955788,"id":"201","color":"green"});
var bed19= new C.BedModel({"chr":"at-Chr3","start":22.818589,"end":23.013909,"id":"224","color":"green"});
var bed20= new C.BedModel({"chr":"at-Chr4","start":0.470515,"end":0.785329,"id":"224","color":"green"});
var bed21= new C.BedModel({"chr":"at-Chr3","start":2.857847,"end":3.925465,"id":"233","color":"green"});
var bed22= new C.BedModel({"chr":"at-Chr5","start":0.41352,"end":2.169391,"id":"233","color":"green"});
var bed23= new C.BedModel({"chr":"at-Chr3","start":19.766664,"end":20.086763,"id":"260","color":"green"});
var bed24= new C.BedModel({"chr":"at-Chr5","start":23.683791,"end":24.213164,"id":"260","color":"green"});

var data = {
    "config":{"canvasSize":800,"center":400,"geneNameLen":20, "geneNameLen":20, "geneNamePx":5, "block_url":"/synview/block/", "gene_url": "/feature/gene/" },

    "ideograms":[
		{"id":"at-Chr1","length":30.425192,"color":"blue"},
		{"id":"at-Chr2","length":19.696821,"color":"blue"},
		{"id":"at-Chr3","length":23.459804,"color":"blue"},
		{"id":"at-Chr4","length":18.584524,"color":"blue"},
		{"id":"at-Chr5","length":26.970641,"color":"blue"}
    ],
    "tracks":[
		{"type":"links","name":"syntenic blocks","values":[
			{"source":bed1,"target":bed2, "id":"test00001"},
			{"source":bed3,"target":bed4, "id":"test00002"},
			{"source":bed5,"target":bed6, "id":"test00003"},
			{"source":bed7,"target":bed8, "id":"test00004"},
			{"source":bed9,"target":bed10, "id":"test00005"},
			{"source":bed11,"target":bed12, "id":"test00006"},
			{"source":bed13,"target":bed14, "id":"test00007"},
			{"source":bed15,"target":bed16, "id":"test00008"},
			{"source":bed17,"target":bed18, "id":"test00009"},
			{"source":bed19,"target":bed20, "id":"test00010"},
			{"source":bed21,"target":bed22, "id":"test00011"},
			{"source":bed23,"target":bed24, "id":"test00012"}
		]},
        {"type":"bed","name":"syntenic regions", "values":[
			{"chr":"at-Chr1","start":0.011649,"end":0.302315,"id":"32","color":"green"},
			{"chr":"at-Chr2","start":18.833364,"end":19.262404,"id":"32","color":"green"},
			{"chr":"at-Chr1","start":17.681157,"end":19.336115,"id":"45","color":"green"},
			{"chr":"at-Chr3","start":5.844495,"end":7.530677,"id":"45","color":"green"},
			{"chr":"at-Chr1","start":0.011649,"end":0.395528,"id":"61","color":"green"},
			{"chr":"at-Chr3","start":22.291886,"end":22.952851,"id":"61","color":"green"},
			{"chr":"at-Chr2","start":15.037662,"end":19.696821,"id":"131","color":"green"},
			{"chr":"at-Chr3","start":19.29301,"end":23.309658,"id":"131","color":"green"},
			{"chr":"at-Chr2","start":15.059763,"end":15.171353,"id":"146","color":"green"},
			{"chr":"at-Chr3","start":3.623457,"end":3.701493,"id":"146","color":"green"}
        ]},
	]
}

// dray synteny image 

jQuery(document).ready( function (){
	drawSyn(data);
});

// function: drawing syntenic images
//		parameter: 
//			data -- json of block information
//			el_id -- canvas id, default is cavanse, and the image will drawn on cavans with id #canvas
function drawSyn(data,el_id) {

    var el=el_id || "canvas"
    d3.select("#"+el_id).text('');

    // default parameters
	var canvasSize = 800;
	var center = 400;
    var geneNameLen = 20;
    var geneNamePx = 5;
    var block_url = "/synview/block/";
    var gene_url = "/feature/gene/";

	// using the parameters in json to replace the 
    if (typeof data.config !="undefined") {
        canvasSize = data.config.canvasSize || 800;
        center = data.config.center || 400;
        geneNameLen = data.config.geneNameLen || 20;
        geneNamePx = data.config.geneNamePx || 5;
        block_url = data.config.blockURL || "/synview/block/";
        gene_url = data.config.geneURL || "/feature/gene/";
    }

    var geneRadius = center - (geneNameLen * geneNamePx);
    var bed_outerRadius = geneRadius - 25;
    var bed_innerRadius = geneRadius - 27;
    var ide_outerRadius = geneRadius - 40;
    var ide_innerRadius = geneRadius - 50;
    var linkRadius = geneRadius - 55;

    // plot ideograms  
    var svg = d3.select("#"+el).append("svg").attr("id","synimg").attr("height",canvasSize).attr("width",canvasSize);
    var collection = []

    var ideograms = []
    for (var i in data.ideograms){
        ideograms.push(new C.IdeogramModel(data.ideograms[i]))
    }
    collection=ideograms;
    var ideogramTrack = new C.IdeogramTrack({"collection":collection,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":ide_outerRadius,"innerRadius":ide_innerRadius,"gapAngle":0.01});
    ideogramTrack.render(true);

    // plot tracks according to type
    var trackNames=[]
    var tracks=[]

    for( var i in data.tracks)
    {
        track=data.tracks[i];
        trackNames.push(data.tracks[i].name);

        var plots=[];

        // plot histogram 
        if (track.type=="plot") {
            for( var j in track.values) {
                var model=new C.PlotModel(track.values[j]);
                if (track.color) {
                    model.color=track.color
                }
                plots.push(model);
            }

            var plotTrack = new C.PlotTrack({"name":track.name,"collection":plots,"el":svg.append("g"),"cx":cx,"cy":cy,'outerRadius':nowRadius,'innerRadius':nowRadius-plotHeight});
            plotTrack.render(ideogramTrack);
            nowRadius-=plotHeight+gapHeight;
            tracks.push(plotTrack);
        };


        if ( track.type=="bed") {
            var beds = [];
            for (var i in track.values) {
                beds.push(new C.BedModel(track.values[i]));
            }

            if (track.color) {
                var bedTrack = new C.BedTrack({"collection":beds,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":bed_outerRadius,"innerRadius":bed_innerRadius,"color":track.color});
            }
            else {
                var bedTrack = new C.BedTrack({"collection":beds,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":bed_outerRadius,"innerRadius":bed_innerRadius});
            }

            bedTrack.render(ideogramTrack);
            tracks.push(bedTrack);
        }

        // plot links (blocks)
        if (track.type=="links")
        {
            var links = []
            for(var i in track.values){
                links.push(new C.LinkModel(track.values[i]));
            }

            if (track.color) {
                var linkTrack = new C.LinkTrack({"collection":links,"el":svg.append("g"),"cx":center,"cy":center,'radius':linkRadius,"outurl":block_url,'color':track.color});
            } else {
                var linkTrack = new C.LinkTrack({"collection":links,"el":svg.append("g"),"cx":center,"cy":center,'radius':linkRadius,"outurl":block_url});
            }
            linkTrack.render(ideogramTrack);
            tracks.push(linkTrack);
        };
    }
}

function zoomIn() {
	if (data.config.canvasSize < 2000) {
		data.config.canvasSize = data.config.canvasSize + 200;
	}

	if (data.config.center < 1000) {
		data.config.center = data.config.center + 100;
	}
        
	jQuery("#canvas").html("");
	drawSyn(data);
}

function zoomOut() {
	if (data.config.canvasSize > 600 ) {
		data.config.canvasSize = data.config.canvasSize - 200;
	} 

	if (data.config.center  > 300) {
		data.config.center = data.config.center - 100;
	} 
        
	jQuery("#canvas").html("");
	drawSyn(data);
}

