
	// set the svg and other parameters for drawing synteny genes
	var svg = d3.select("#svg"),
		margin = { left:110, right:110, top:100, bottom:100},
		wsvg  = +svg.attr("width"),
		hsvg  = +svg.attr("height"),
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	let scale_A = d3.scaleLinear().domain([data.A.min, data.A.max]).range([margin.top, margin.top + height]);
	let scalerA = d3.scaleLinear().domain([margin.top, margin.top + height]).range([data.A.min, data.A.max]);
	let scale_B = d3.scaleLinear().domain([data.B.min, data.B.max]).range([margin.top, margin.top + height]);
	let scalerB = d3.scaleLinear().domain([margin.top, margin.top + height]).range([data.B.min, data.B.max]);

	//var yAxis = d3.axisLeft(scale_A);

	var chrWidth = 20;			// width of chromosome
	var chrHeight = height;		// height of chromosome
	var spaceBetweenChr = 250;	// distance between two chromosomes
	var txtToChr = 5;			// distance of text to chromosome

	// the related include the path for synteny links
	let relateD = relate.map(function(d){
        let _d = [];
        _d.push([margin.left + chrWidth,data.A.rect[d[0]-1][1]]);
        _d.push([margin.left + spaceBetweenChr,data.B.rect[d[1]-1][1]]);
        _d.push([margin.left + spaceBetweenChr,data.B.rect[d[1]-1][2]]);
        _d.push([margin.left + chrWidth,data.A.rect[d[0]-1][2]]);
        return _d;
    });

	// for cover the images out of border when zoom
	svg.append("defs").append("clipPath")
    	.attr("id", "clip")
  		.append("rect")
		.attr('x',0)
		.attr('y',margin.top)
		.attr("width", wsvg)
		.attr("height", height);

	// draw chr A and B as background
	svg.append('rect')
		.attr('x',margin.left)
		.attr('y',margin.top)
		.attr('width', chrWidth)
		.attr('height',chrHeight)
		.style('stroke','#D7702A')
		.style('fill','#ED7C30')
		
	svg.append('text')
        .attr('x',margin.left + 40)
        .attr('y',margin.top - 40)
        .attr('text-anchor','end')
        .html(data.A.name);

	svg.append('rect')
		.attr('x',margin.left + spaceBetweenChr)
		.attr('y',margin.top)
		.attr('width',chrWidth)
		.attr('height',chrHeight)
		.style('stroke','#4C84B7')
		.style('fill','#5A9BD5');

    svg.append('text')
        .attr('x',margin.left + 40 + spaceBetweenChr)
        .attr('y',margin.top - 40)
        .attr('text-anchor','end')
        .html(data.B.name);


    // zoom and pan funcation
	//var yrange = scale_A.range();
    var myZoom = d3.zoom()
        .scaleExtent([1, 20])   // the scale range is from 1x to 10x
        .translateExtent([[0, 0], [wsvg, hsvg]]) // set limit of 
        .extent([[0, 0], [wsvg, hsvg]])
        .on("zoom", zoomed);
	svg.call(myZoom);

  let subRectG = svg.append('g');

  var drawFunction = function(){

    let chrA_start = subRectG.selectAll('.start_a').data([data.A.min]);
	chrA_start.enter().append('text')
		.classed('start_a',true)
		.merge(chrA_start)
		.attr('x',margin.left + 40)
		.attr('y',margin.top - 20)
		.attr('text-anchor','end')
		.html(Math.floor(scalerA(100)));
	chrA_start.exit().remove();

    let chrA_end = subRectG.selectAll('.end_a').data([data.A.max]);
    chrA_end.enter().append('text')
        .classed('end_a',true)
		.merge(chrA_end)
        .attr('x',margin.left + 40)
        .attr('y',margin.top + chrHeight + 20)
        .attr('text-anchor','end')
        .html(Math.floor(scalerA(700)));
    chrA_end.exit().remove();

	let chrB_start = subRectG.selectAll('.start_b').data([data.B.min]);
    chrB_start.enter().append('text')
        .classed('start_b',true)
        .merge(chrB_start)
        .attr('x',margin.left + 40 + spaceBetweenChr)
        .attr('y',margin.top - 20)
        .attr('text-anchor','end')
        .html(Math.floor(scalerB(100)));
    chrB_start.exit().remove();

    let chrB_end = subRectG.selectAll('.end_b').data([data.B.max]);
    chrB_end.enter().append('text')
        .classed('end_b',true)
        .merge(chrB_end)
        .attr('x',margin.left + 40 + spaceBetweenChr)
        .attr('y',margin.top + chrHeight + 20)
        .attr('text-anchor','end')
        .html(Math.floor(scalerB(700)));
    chrB_end.exit().remove();

	// draw
	let data_A = data.A.rect;
	let rect_A = subRectG.selectAll(".bar_a")
		.data(Object.keys(data_A));				// binding gene ID to selected .bar_a 

	rect_A.enter().append('rect')				// enter: select DOM base on data, then create them by append
		.classed('bar_a',true)
		.merge(rect_A)							// position for genes in chrA
		.attr('x',margin.left) 					// 100 
		.attr('y',d=>scale_A(data_A[d][1]))		// scale  
		.attr('width',chrWidth)
		.attr('height',d=>scale_A(data_A[d][2])-scale_A(data_A[d][1]));
	rect_A.exit().remove();						// exit: select DOM not in data, then remove them

	let initA = 0;
	let textA = subRectG.selectAll('.textA')
		.data(Object.keys(data_A));
	textA.enter().append('text')
		.classed('textA',true)
		.merge(textA)							// position for txt of all genes in chrA
		.attr('x',margin.left - txtToChr)		// 90
		.attr('y',d=>(scale_A(data_A[d][2]) + scale_A(data_A[d][1]))/2)
		.attr('text-anchor','end')
		.html(function(d){
			if (d == 0) {
				return "<a href=/feature/gene/" + data_A[d][0] + " target=_blank>" + data_A[d][0] + "</a>";
			}
			let gene_space = Math.abs(scale_A(data_A[d][1]) - scale_A(data_A[initA][1]));
			if (gene_space > 14) {
				initA = d;
				return "<a href=/feature/gene/" + data_A[d][0] + " target=_blank>" + data_A[d][0] + "</a>";
			}
		});
	textA.exit().remove();

	let data_B = data.B.rect;
	let rect_B = subRectG.selectAll(".bar_b")
		.data(Object.keys(data_B));
	rect_B.enter().append('rect')
		.classed('bar_b',true)
		.merge(rect_B)								// position for genes in chrB
		.attr('x',margin.left + spaceBetweenChr)	// 500
		.attr('y',d=>scale_B(data_B[d][1]))		// scale
		.attr('width',chrWidth)
		.attr('height',d=>scale_B(data_B[d][2])-scale_B(data_B[d][1]));
	rect_B.exit().remove();

	let initB = 0;
	let textB = subRectG.selectAll('.textB')
		.data(Object.keys(data_B));
	textB.enter().append('text')
		.classed('textB',true)
		.merge(textB)							// position for txt of all genes in chrB
		.attr('x',margin.left + spaceBetweenChr + chrWidth + txtToChr)	
		.attr('y',d=>(scale_B(data_B[d][2])+scale_B(data_B[d][1]))/2) 
		.attr('text-anchor','start')
		.html(function(d){
			if (d == 0) {
				return "<a href=/feature/gene/" + data_B[d][0] + " target=_blank>" + data_B[d][0] + "</a>";
			}
			let gene_space = Math.abs(scale_B(data_B[d][1]) - scale_B(data_B[initB][1]));
			if (gene_space > 14) {
				initB = d;
				return "<a href=/feature/gene/" + data_B[d][0] + " target=_blank>" + data_B[d][0] + "</a>"; 
			}
		});
	textB.exit().remove();

	// draw path for synteny 
	let path = d3.path();
	for (var i=0; i< relateD.length; i++) {
		let r = relateD[i];
		path.moveTo(r[0][0],scale_A(r[0][1]));
	    path.lineTo(r[1][0],scale_B(r[1][1]));
	    path.lineTo(r[2][0],scale_B(r[2][1]));
	    path.lineTo(r[3][0],scale_A(r[3][1]));
	}
	path.closePath();

	var pathelement = subRectG.select('.synPath');
	if (pathelement.empty()) pathelement = subRectG.append('path').classed('synPath', true);
	pathelement.attr('d', path.toString());
  }

  drawFunction();

    // the zoom funcation works through reset scale range for A and B.   
    var yrange = scale_A.range();
	function zoomed() {
		//**
		var fullsize = yrange[1]-yrange[0];
		var newsize = fullsize * d3.event.transform.k;
		var offset = newsize - fullsize;
		var ty = Math.min(0, Math.max(d3.event.transform.y, -1 * fullsize * d3.event.transform.k + fullsize));
		var newrange = [yrange[0]+ty,yrange[1]+offset+ty];

		//var offset = (newsize - fullsize)/2;
		//var newrange = [yrange[0]-offset+d3.event.transform.y), yrange[1]+offset+d3.event.transform.y)];

		//console.log(ty);
		//console.log(d3.event.transform.y);
		//console.log(newrange);
		//console.log(d3.event);

		scale_A.range(newrange);
		scale_B.range(newrange);
		scalerA.domain(newrange);
		scalerB.domain(newrange);
		drawFunction();
	}


