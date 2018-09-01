  
var canvasSize = 1000;
var center = 500;
var geneNameLen = 20;
var geneNamePx = 5;
	
function drawSyn(C, data) {
	var geneRadius = center - (geneNameLen * geneNamePx);
	var bed_outerRadius = geneRadius - 25;
	var bed_innerRadius = geneRadius - 27;
	var ide_outerRadius = geneRadius - 5;
	var ide_innerRadius = geneRadius - 25;
	var linkRadius = geneRadius - 27;
	var svg = d3.select("#" + data.canvas).append("svg").attr("width",canvasSize).attr("height",canvasSize).attr("id","synimg" + data.canvas);

	var ideogramTrack = new C.IdeogramTrack({"sid":data.canvas,"collection":data.ideoCollection,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":ide_outerRadius,"innerRadius":ide_innerRadius,"gapAngle":0.01});
	ideogramTrack.render(true);

	//var bedTrack = new C.BedTrack({"collection":data.bedCollection,"el":svg.append("g"),"cx":center,"cy":center,'outerRadius':bed_outerRadius,'innerRadius':bed_innerRadius});
	//bedTrack.render(ideogramTrack);

	var linkTrack = new C.LinkTrack({"collection":data.linkCollection,"el":svg.append("g"),"cx":center,"cy":center,'radius':linkRadius});
	linkTrack.render(ideogramTrack);

	//var labTrack = new C.LabelTrack({"collection":data.labCollection,"el":svg.append("g"),"cx":center,"cy":center,'radius':geneRadius});
	//labTrack.render(ideogramTrack);
}

//console.log(data);

jQuery(document).ready( function (){
	for(var i=0; i<data.length; i++) {
		drawSyn(bam2x.circos, data[i]);
		// Attached actions to the buttons
		//jQuery("#save_as_svg").click(function() { submit_download_form("svg", data[i].cavas); });
		//jQuery("#save_as_pdf").click(function() { submit_download_form("pdf", data[i].cavas); });
		//jQuery("#save_as_png").click(function() { submit_download_form("png", data[i].cavas); });
	}
});
   
function zoomIn() {
	if (canvasSize < 2000) {
		canvasSize = canvasSize + 200;
	}

	if (center < 1000) {
		center = center + 100;
	}
	
	jQuery("#canvas").html("");
	drawSyn(bam2x.circos);
}
   
function zoomOut() {
	if (canvasSize > 600 ) {
		canvasSize = canvasSize - 200;
	} 

	if (center > 300) {
		center = center - 100;
	} 
	jQuery("#canvas").html("");
	drawSyn(bam2x.circos);
}

function submit_download_form(output_format, cavas_name) {
	
	// Get the d3js SVG element
	var tmp = document.getElementById(cavas_name);
	var svg = tmp.getElementsByTagName("svg")[0];
	// Extract the data as SVG text string
	
	var svg_xml = (new XMLSerializer).serializeToString(svg);
	// Submit the <FORM> to the server.
	// The result will be an attachment file to download.
	var form = document.getElementById("svgform");
	form['output_format'].value = output_format;
	form['data'].value = svg_xml ;
	form.submit();
}
