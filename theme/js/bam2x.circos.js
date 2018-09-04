/**
 * VERSION 0.1.3
 * Improvements:
 * 1. remove dependency on underscore
 * 2. add namespace bam2x.circos
 * 3. remove source code redundacy
 *
 */

var bam2x=bam2x || {};

  (
    function(B){
    B.circos= B.circos || {};
    C=B.circos;
    function default_model()
    {
      return (function(options){
      for (var key in options)
      {
        this[key]=options[key];
      }});
    }
   /**
    * Ideogram Section
    *
    *
    */
    C.IdeogramModel = default_model();
    C.IdeogramView = default_model();
    C.IdeogramView.prototype = {
       	render: function(text, ticks_boolean)
		{
			var ideogram=this.el;
			if(this.track_name){
				ideogram.attr("class",this.track_name);
			}
			if(this.model.id){
				ideogram.attr("id",this.model.id);
			}
			ideogram.selectAll("path").remove();
               
			var self=this;
			ideogram.attr("transform","translate("+this.cx+","+this.cy+")");
			ideogram.append("path").attr("d", d3.svg.arc().outerRadius(this.outerRadius)
				.innerRadius(this.innerRadius)
				.startAngle(this.startAngle)
				.endAngle(this.endAngle))
			.attr("class","symbol")
			.attr("model",this.model)
			.attr("id","symbol-"+this.model.id+this.sid)
			.style("fill",this.model.color)
			.style("opacity",0.5)
			.on("mouseover", function(d,i) {
				d3.select(this).style("opacity",1.0);
				//ideogram.append("path").attr("d",d3.svg.arc().outerRadius(self.cx)
				//	.innerRadius(10)
				//	.startAngle(self.startAngle)
				//	.endAngle(self.endAngle)
				//)	
				//.style("fill","yellow")
				//.attr("class","flash")
				//.style("opacity",0.3);
			})
			.on("mouseout",function(d,i) {
				d3.select(this).style("opacity",0.5);
				ideogram.selectAll(".flash").remove();
			})
			.append("title").text(this.model.chr);
 
			if(text){
				var text_content = ideogram.append("text")
					.attr("x", 10).attr("dy",-20);
				text_content.append("textPath")
					.attr("xlink:href","#symbol-"+this.model.id+this.sid)
					.text(self.model.chr); //.text(self.model.id);
			}
              
			if(ticks_boolean) {
                    var el=this.el;
                    var ticks = el.append("g").selectAll("g")
                                .data([self])
                                .enter().append("g").selectAll("g")
                                .data(self.groupTicks)
                                .enter().append("g")
                                .attr("transform", function(d) {  
                                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + self.outerRadius + ",0)";
                                });
 		    ticks.append("line")
                    .attr("x1", 1)
                    .attr("y1", 0)
                    .attr("x2", 3)
                    .attr("y2", 0)
                    .style("stroke", "#000");

                   ticks.append("text")
                    .attr("x", 8)
                    .attr("dy", ".35em")
                    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		    .attr("font-size", "0.6em")
		    .text(function(d) { return d.label; });
                }
           },
           
           translateBed: function(start,end) //bed format [start,end) 0 index
           {
               var startAngle=start/this.model.length*(this.endAngle-this.startAngle)+this.startAngle;
               var endAngle=end/this.model.length*(this.endAngle-this.startAngle)+this.startAngle;
               return [startAngle,endAngle];
           },
           groupTicks: function(d) {
                var k = (d.endAngle - d.startAngle) / d.model.length;
                var step = Math.round(Math.PI/(k*24*10))*10;
                step = step===0 ? 1:step;
                return d3.range(0, d.model.length, step).map(function(v, i) {
                    return {
                        angle: v * k + d.startAngle,
                        label: i % 5 ? null : v
                        };
                });
            }
    };
    
    C.IdeogramTrack = default_model();
    C.IdeogramTrack.prototype = {
           
		add: function(ideogram) {
			this.collection.push(ideogram);
		},
           
		render: function(ticks) {
			var offsetAngle=0;
			var totalLength=this.totalLength();
			var totalGaps=this.collection.length;
			var gapAngle=this.gapAngle; //set later
			var totalAngle=3.1415926*2-gapAngle*totalGaps;
			var startAngle=offsetAngle;
			var self=this;
			self.ideogramViews={};

			//console.log(this);
               
			this.collection.forEach( function(i) {
				var endAngle=startAngle+i.length/totalLength*totalAngle;
				var ideogramView = new C.IdeogramView({"startAngle":startAngle,"endAngle":endAngle,"innerRadius":self.innerRadius,"outerRadius":self.outerRadius,"model":i,"el":self.el.append("g").attr("id",i.id),"cx":self.cx,"cy":self.cy, "sid": self.sid})
				self.ideogramViews[i.id]=ideogramView;
				if(ticks){
					ideogramView.render(true,true);
				} 
				else {
					ideogramView.render(true);
				}
				startAngle=endAngle+gapAngle;
			});
		},
        
		// bed format [start,end) 0 index   
		translateBed: function(id,start,end) { 
			return this.ideogramViews[id].translateBed(start,end);
		},
           
		totalLength: function() {
			var s=0;
			this.collection.forEach(function(i) {
				s+=i.length;
			});
			return s;
		}
    };

    /**
     *  LABEL
     *
     */
    C.LabelModel=default_model();
    C.LabelView=default_model();
    C.LabelView.prototype={
	render: function(coordinates)
	{
		var self=this;
		var Angles=coordinates.translateBed(this.model.chr,this.model.start,this.model.end);
		var geneg=this.el.append("g").selectAll("g")
			.data([self])
			.enter().append("g")
			.attr("transform", "rotate(" + (Angles[0] * 180 / Math.PI - 90) + ")"
                                + "translate(" + self.radius + ",0)"
                                );

		geneg.append("line")
                    .attr("x1", 1)
                    .attr("y1", 0)
                    .attr("x2", 15)
                    .attr("y2", 0)
                    .style("stroke", "#FF0000");
	
		geneg.append("text")
                .attr("x", 8)
		.attr("dy", ".35em")
		//.attr("transform", "rotate(90)translate(-16)")
		.attr("transform", function(d) { return Angles[0] > Math.PI ? "rotate(180)translate(-26)" : "rotate(0)translate(10)"; })
		.style("text-anchor", function(d) { return Angles[0] > Math.PI ? "end" : null; })
		.attr("font-size", "0.75em")
		.text(this.model.chr);

		//console.log(Angles[0]);
		//console.log(geneg);
		//console.log(this.model.chr);
		//console.log(this.model.start);
		//console.log(this.model.id);
		//console.log(this.model.color);
		//console.log(self.cx);
		//console.log(self.cy);
		//console.log(self.el);
		//console.log(self.radius);
	}
    }

     /* The track is for drawing a group of view*/
     C.LabelTrack=default_model();
     C.LabelTrack.prototype={
       render:  function(coordinates)
      		{   
			var self=this;
               		this.el.attr("transform","translate("+this.cx+","+this.cy+")");

               		this.collection.forEach(function(i)
                       	{
                        	if(self.color) {i.color=self.color}
                        	labelView = new C.LabelView({"el":self.el.append("g"),
                                                 "model":i,
                                                 "radius":self.radius,
                                                 "cx":self.cx,
                                                 "cy":self.cy
                                                });
                        	labelView.render(coordinates);
			});
        	},
     }

    /**
     *  BED6
     *
     */
     C.BedModel=default_model();
     C.BedTrack=default_model();
     C.BedTrack.prototype={
           add: function(bed)
           {
               this.collection.add(bed);
           }
           ,

           render: function(coordinates)
           {   var self=this;
               this.collection.forEach(function(i)
                       {
                           if(self.color) {i.color=self.color}
                            var angles=coordinates.translateBed(i.chr,i.start,i.end);
                            var startAngle=angles[0];
                            var endAngle=angles[1];
                            var ideogramView = new C.IdeogramView({"startAngle":startAngle,"endAngle":endAngle,"innerRadius":self.innerRadius,"outerRadius":self.outerRadius,"model":i,"el":self.el.append("g").attr("id",i.id),"cx":self.cx,"cy":self.cy});
                            ideogramView.render();
			    //ideogramView.render(true);
                       });
           }
     };
     
     /**
      * Link section
      *
      */
     C.LinkModel=default_model();
     C.LinkView=default_model();
     C.LinkView.prototype={
         render: function(coordinates){
                var g=this.el.append("g");
                var self=this;
				console.log(self);
                var targetAngles=coordinates.translateBed(this.model.target.chr,this.model.target.start,this.model.target.end);
                var sourceAngles=coordinates.translateBed(this.model.source.chr,this.model.source.start,this.model.source.end);
                g.append("a").attr("xlink:href", "/synview/block/" + self.model.bid).attr("target","_blank")
				.append("path")
                .attr("d",
                        d3.svg.chord()
                            .source(function() { return {startAngle:sourceAngles[0],
                                endAngle:sourceAngles[1]}})
                            .target(function() { return {startAngle:targetAngles[0],
                                endAngle:targetAngles[1]}})
                            .radius(self.radius)


                    ).attr("model",self.model)
                    .attr("class","symbol")
                    .style("fill",  self.model.color)
                    .style("opacity", 0.5)
                    .on("mouseover", function() {
                          d3.select(this).style('fill','red').style("opacity",1.0);
                          //g.append("path").attr("d",d3.svg.arc().outerRadius(self.cx)
                          //     .innerRadius(10)
                          //     .startAngle(sourceAngles[0])
                          //     .endAngle(sourceAngles[1])
                          //     ).style("fill","yellow")
                          //     .attr("class","flash")
                          //     .style("opacity",0.3);
                          //g.append("path").attr("d",d3.svg.arc().outerRadius(self.cx)
                          //         .innerRadius(10)
                          //         .startAngle(targetAngles[0])
                          //         .endAngle(targetAngles[1])
                          //         ).style("fill","yellow")
                          //     .attr("class","flash")
                          //     .style("opacity",0.3);
                    })
                    .on("mouseout", function() {
                         d3.select(this).style("fill",self.model.color).style("opacity",0.5);
                         //g.selectAll(".flash").remove();
                    })
                    .append("title").text("Block ID:"+ self.model.bid +"\n"+self.model.source.name+":"+Math.floor(self.model.source.start*100000)+"-"+Math.floor(self.model.source.end*1000000)+"\nto\n"+self.model.target.name+":"+Math.floor(self.model.target.start*100000)+"-"+Math.floor(self.model.target.end*1000000)+"\n"
                    )
            }
     };
     C.LinkTrack=default_model();
     C.LinkTrack.prototype={
      render: function(coordinates)
           {   var self=this;
               this.el.attr("transform","translate("+this.cx+","+this.cy+")");

               this.collection.forEach(function(i)
                       {
                        if(self.color) {i.color=self.color}
                        linkView = new C.LinkView({"el":self.el.append("g"),
                                                 "model":i,
                                                 "radius":self.radius,
                                                 "cx":self.cx,
                                                 "cy":self.cy
                                                });
                        linkView.render(coordinates);
                       });
       },
     }
     
     /**
      * Plot section
      */
      C.PlotModel=default_model();
      C.PlotModel.prototype = {
        length: function(){
            return this.values.length;// return value's length.
        },
        max: function(){
            var max=this.values[0];
            for (var v in this.values)
                {
                 if (max < this.values[v]) {max=this.values[v];}
                }
            return max;
        },
        min: function(){
            var min=this.values[0];
            for (var v in this.values)
                {
                 if (min > this.values[v]) {min=this.values[v];}
                }
            return min;
            
        }
      }
      C.PlotView=default_model();
      C.PlotView.prototype={
        render: function(){
        var self=this;
        var bars=this.el.selectAll("path").data(this.model.values).enter().append("path");
        var len=self.model.length();
        var angle=self.endAngle-self.startAngle;
        if (self.yMin >= 0)
         {
         bars.attr("fill",self.model.color).attr("d",
             d3.svg.arc()
                 .outerRadius(function(d) {return self.translateToHeight(d);})
                 .innerRadius(function(d) { return self.innerRadius;}  )
                 .startAngle(function(d,i) { return self.startAngle+i/len*angle;})
                 .endAngle(function(d,i) {return self.startAngle+(i+1)/len*angle;}))
                    
        
         }
         else
         {
            bars.attr("fill",this.model.color).attr("d",
                 d3.svg.arc()
                 .outerRadius(function(d) {return self.translateToHeight(d);})
                 .innerRadius(function(d) { return self.translateToHeight(0);}  )
                 .startAngle(function(d,i) { return self.startAngle+i/len*angle;})
                 .endAngle(function(d,i) {return self.startAngle+(i+1)/len*angle;}))
                 
            
         }
         bars.style("opacity",0.5)
                 .on("mouseover",function(d,i) {
                            d3.select(this).style("opacity",1.0);
                            self.el.append("path").attr("d",d3.svg.arc().outerRadius(self.cx)
                                       .innerRadius(10)
                                       .startAngle(self.startAngle+i/len*angle)
                                       .endAngle(self.startAngle+(i+1)/len*angle)
                                       ).style("fill","yellow")
                                   .attr("class","flash")
                                   .style("opacity",0.3);
                            })
                 
                .on("mouseout",function() {
                    d3.select(this).style("opacity",0.5);
                    self.el.selectAll(".flash").remove();
                })
                .append("title").text( function(d,i) { return "1-index\n pos: "+(i+1)+"\nvalue:"+d })
    
    
    },
    
    translateToHeight: function(value)
    {
        return (value-this.yMin)/(this.yMax-this.yMin)*(this.outerRadius-this.innerRadius)+this.innerRadius;
    }
   };
   
     C.PlotTrack=default_model();
     C.PlotTrack.prototype={
        render: function(coordinates)
           {   var self=this;
               var yMins=[]
              var yMaxs=[]
              for ( var key in this.collection){
                  yMins.push(Math.min.apply(Math,this.collection[key].values))
                  yMaxs.push(Math.max.apply(Math,this.collection[key].values))
              }
              this.yMin=Math.min.apply(Math,yMins)
              this.yMax=Math.max.apply(Math,yMaxs)
              this.el.attr("class","plot");
              this.el.attr("transform","translate("+this.cx+","+this.cy+")");
               this.collection.forEach(function(i)
                       {
                            var angles=coordinates.translateBed(i.chr,0,i.length());
                            var startAngle=angles[0];
                            var endAngle=angles[1];
                            var model=self.el.append("g").attr("id",i.chr+"_"+i.id);
                            var plotView = new C.PlotView({"startAngle":startAngle,"endAngle":endAngle,"innerRadius":self.innerRadius,"outerRadius":self.outerRadius,"model":i,"el":model,"cx":self.cx,"cy":self.cy,"yMin":self.yMin,"yMax":self.yMax});
                            plotView.render();
                       });
       },
     };
    
     /**
      * BedGraph section
      *
      */
      C.BedGraphModel= function(options){
        for (var key in options){
            this[key]=options[key];
        }
        if (options.length && options.start && !options.end){
            this.end=parseInt(options.start)+parseInt(options.length);
        }
        if (options.start && options.end){
            this.length=parseInt(options.end)-parseInt(options.start);
        }
      };
    
       C.BedGraphTrack = default_model();
       C.BedGraphTrack.prototype = {
         max: function(){
            var max=+this.collection[0].value;
            for (var v in this.collection)
                {
                 if (max < +this.collection[v].value) {max=+this.collection[v].value;}
                }
            return max;
        },
        min: function(){
            var min=+this.collection[0].value;
            for (var v in this.collection)
                {
                 if (min > +this.collection[v].value) {min=+this.collection[v].value;}
                }
            return min;
            
        },
         render: function(coordinates) {
        var self=this;
        var bars=this.el.selectAll("path").data(this.collection).enter().append("path");
        this.el.attr("class","plot");
        this.el.attr("transform","translate("+this.cx+","+this.cy+")");
        this.yMin=this.min()
        this.yMax=this.max()
        if (this.yMin > 0) {this.yMin=0}
       
      
        if (self.yMin >= 0)
         {
                bars.attr("fill",self.color).attr("d",
                d3.svg.arc()
                 .outerRadius(function(d) {return self.translateToHeight(d.value);})
                 .innerRadius(function(d) { return self.innerRadius;})
                 .startAngle(function(d,i) { return coordinates.translateBed(d.chr,d.start,d.start+1)[0]})
                 .endAngle(function(d,i) {return coordinates.translateBed(d.chr,d.end-1,d.end)[1];})
                 )
                
                      
         }
         else
         {
            bars.attr("fill",this.color).attr("d",
                 d3.svg.arc()
                 .outerRadius(function(d) {return self.translateToHeight(d.value);})
                 .innerRadius(function(d) { return self.translateToHeight(0);}  )
               .startAngle(function(d,i) { return coordinates.translateBed(d.chr,d.start,d.start+1)[0]})
                 .endAngle(function(d,i) {return coordinates.translateBed(d.chr,d.end-1,d.end)[1];})
                 )
            
         }
         bars.style("opacity",0.5)
                          .on("mouseover",function(d) {
                            d3.select(this).style("opacity",1.0);
                            self.el.append("path").attr("d",d3.svg.arc().outerRadius(self.cx)
                                       .innerRadius(10)
                                       .startAngle(coordinates.translateBed(d.chr,d.start,d.start+1)[0])
                                       .endAngle(coordinates.translateBed(d.chr,d.end-1,d.end)[1])
                                       ).style("fill","yellow")
                                   .attr("class","flash")
                                   .style("opacity",0.3);
                            })
                .on("mouseout",function() {
                    d3.select(this).style("opacity",0.5);
                    self.el.selectAll(".flash").remove();
                })
                .append("title").text( function(d,i) { return d.chr + ":" + (+d.start+1) + "-" + d.end + "\n value:" + d.value })
        
    
    },
    
         translateToHeight: function(value){
        return (value-this.yMin)/(this.yMax-this.yMin)*(this.outerRadius-this.innerRadius)+this.innerRadius;
          }
       };
 
 C.plot_json = function(data,el_id) {
      var el=el_id || "canvas"
      d3.select("#"+el_id).text('');
      
      if (typeof data.config !="undefined")
      {
      var outerRadius=data.config.outerRadius || 250;
      var innerRadius=data.config.innerRadius || 70;
      var plotHeight=data.config.plotHeight || 30;
      var bedHeight=data.config.bedHeight || 10;
      var gapHeight= data.config.gapHeight || 5;
      }
      else
      {
      var outerRadius=250;
      var innerRadius=71;
      var plotHeight=30;
      var bedHeight=10;
      var gapHeight=5;

      }
      var nowRadius=outerRadius;
      //var cy = outerRadius + 30;
      var cy = document.getElementById(el).clientHeight/2
      var cx = document.getElementById(el).clientWidth/2;
      if (cy<300) {cy=300};
      //var cx = outerRadius + 30
      var svg = d3.select("#"+el).append("svg").attr("id","svg").attr("height",cy*2).attr("width",cx*2);
      var collection = []
      var ideograms = []
      for (var i in data.ideograms){
          ideograms.push(new C.IdeogramModel(data.ideograms[i]))
      }
      collection=ideograms;
      var ideogramTrack = new C.IdeogramTrack({"collection":collection,"el":svg.append("g"),"cx":cx,"cy":cy,"outerRadius":nowRadius,"innerRadius":nowRadius-bedHeight,"gapAngle":0.02});
      ideogramTrack.render(true);
     
     nowRadius=nowRadius-bedHeight-gapHeight;
     var trackNames=[]
     var tracks=[]
     for( var i in data.tracks)
     {
     track=data.tracks[i];
     trackNames.push(data.tracks[i].name);
     var plots=[];
     if (track.type=="plot")
     {
     for( var j in track.values)
     {
         var model=new C.PlotModel(track.values[j]);
         if (track.color)
         {
             model.color=track.color
         }
         plots.push(model);

     }
      
      var plotTrack = new C.PlotTrack({"name":track.name,"collection":plots,"el":svg.append("g"),"cx":cx,"cy":cy,'outerRadius':nowRadius,'innerRadius':nowRadius-plotHeight});
      plotTrack.render(ideogramTrack);
      nowRadius-=plotHeight+gapHeight;
      tracks.push(plotTrack);
    };

    if ( track.type=="bedgraph"){
        var collection= track.values
        if (track.color)
        {
        var bedGraphTrack = new C.BedGraphTrack({"collection":collection,"el":svg.append("g"),"cx":cx,"cy":cy,"outerRadius":nowRadius,"innerRadius":nowRadius-plotHeight,"color":track.color});
        }
        else
        {
        var bedGraphTrack = new C.BedGraphTrack({"collection":collection,"el":svg.append("g"),"cx":cx,"cy":cy,"outerRadius":nowRadius,"innerRadius":nowRadius-plotHeight});
        }
        bedGraphTrack.render(ideogramTrack);
        nowRadius-=plotHeight+gapHeight
        tracks.push(bedGraphTrack);
        };
    
    if ( track.type=="bed"){
        var collection= track.values
        if (track.color)
        {
        var bedTrack = new C.BedTrack({"color":track.color,"collection":collection,"el":svg.append("g"),"cx":cx,"cy":cy,"outerRadius":nowRadius,"innerRadius":nowRadius-bedHeight});
        }
        else
        {
        var bedTrack = new C.BedTrack({"collection":collection,"el":svg.append("g"),"cx":cx,"cy":cy,"outerRadius":nowRadius,"innerRadius":nowRadius-bedHeight});
        }
        bedTrack.render(ideogramTrack);
        nowRadius-=bedHeight+gapHeight;
        tracks.push(bedTrack);
        }
    if (track.type=="links")
    {
        var links = []

        for(var i in track.values){
            links.push(new C.LinkModel(track.values[i]));
         }
        if (track.color) {
        var linkTrack = new C.LinkTrack({"collection":links,"el":svg.append("g"),"cx":cx,"cy":cy,'radius':nowRadius,'color':track.color});
        }
        else
        {
        var linkTrack = new C.LinkTrack({"collection":links,"el":svg.append("g"),"cx":cx,"cy":cy,'radius':nowRadius});
        }
        linkTrack.render(ideogramTrack);
        tracks.push(linkTrack);
    };
    }

    var legend = svg.append("g").attr("class","legend")
    legend.selectAll("circle").data(trackNames).enter().append("circle").attr("class","circle").attr("cy",function(d,i) {return cy/3 + i*15 -5}).attr("cx",cx+outerRadius+10).attr("fill",function(d,i) {return data.tracks[i].color || "black"}).attr("r",5).style("opacity",0.7)
    .on("mouseover",function(d,i) {
        d3.select(this).style("opacity",1.0);
        if(data.tracks[i].type!="links")
        {
            svg.append("g").attr("class","flash").attr("transform","translate("+cx+","+cy+")").append("path").attr("d",d3.svg.arc().outerRadius(tracks[i].outerRadius).innerRadius(tracks[i].innerRadius).startAngle(0).endAngle(3.1415926*2)).attr("fill","yellow").style("opacity",0.2);
        }
        else
        {
            svg.append("g").attr("class","flash").attr("transform","translate("+cx+","+cy+")").append("path").attr("d",d3.svg.arc().outerRadius(tracks[i].radius).innerRadius(0).startAngle(0).endAngle(3.1415926*2)).attr("fill","yellow").style("opacity",0.2);
        }

        })
    .on("mouseout",function(d,i) {
        d3.select(this).style("opacity",0.7);
        svg.selectAll(".flash").remove();
        });
    legend.selectAll("text").data(trackNames).enter().append("text").attr("y",function(d,i) {return cy/3 +i*15}).attr("x",cx+outerRadius+20).text(function(d) {return d});
  }
  

   
   
 }(bam2x));

