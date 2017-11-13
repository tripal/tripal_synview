/* BAM2X
 * Version: 0.2
 * Author: zhuxp
 * Copyright: GPL
 */
 var bam2x = bam2x || {};
 
 (function(B)
 {
   function default_model()
    {
      return (function(options){
      for (var key in options)
      {
        this[key]=options[key];
      }});
    }
   B.AxisModel= function(options) {
  /* options include
   * chr,start,end,strand
   */
  this.strand="+"; //default strand
  for (var key in options)
  {
    this[key]=options[key];
  }
  };
  B.AxisModel.prototype = {
  
  length: function() {
     return this.end-this.start;
   }
  };
B.AxisView=function(options){
  /* options include
   * el,
   * model,
   * height,width,color,x,y
   *
   */
  for (var key in options)
  {
    this[key]=options[key];
  }
  this.resetscale();

 
}
B.AxisView.prototype = {
  resetscale : function() {
     if (this.model.strand=="-")
               {
               this.scale=d3.scale.linear().domain([this.model.end,this.model.start]).range([this.x,this.x+this.width]);
               }
               else
               {
               this.scale=d3.scale.linear().domain([this.model.start,this.model.end]).range([this.x,this.x+this.width]);
               }
  },
  render: function(ticks) {
               if(typeof ticks=="undefined") {ticks=false}
               var axis=this.el;
               if(this.model.id)
               {
               axis.attr("id",this.model.id);
               }
               var self=this;
               axis.selectAll("rect").data([self]).enter().append("rect")
               .attr("x",function(d) {return d.x})
               .attr("y",function(d) {return d.y})
               .attr("height",function(d) {return d.height})
               .attr("width",function(d) {return d.width})
               .attr("fill",function(d) {return d.color})
               .append("title").text(function(d) { return self.model.id });
                text = axis.append("text").attr("class","chr-name");
              
                var repr="";
                if (self.model.strand=="-")
                {repr=self.model.chr+":"+self.model.end+"-"+self.model.start}
                else
                {repr=self.model.chr+":"+self.model.start+"-"+self.model.end}
                
                text.attr("transform","translate("+(self.x) +","+(self.y-25)+")").attr("x",0).text(repr);
                console.log(text);
                //TODO ticks
                if(ticks)
                {
               var step=Math.pow(10,Math.floor(Math.log(this.model.end-this.model.start)/Math.log(10)));
               var first_tick=step*(Math.floor(this.model.start/step)+1);
                var ticks_data=[];
                 for(var i0=first_tick;i0<this.model.end;i0+=step)
                 {ticks_data.push(i0)}
                 var ticks_v=this.el.append("g").selectAll("g")
                 .data(ticks_data).enter().append("g").attr("transform",function(d) {return "translate("+self.scale(d)+","+self.y+")"} );

                  ticks_v.append("line").attr("x1", 0)
                  .attr("x2",0 )
                 .attr("y1",-5)
                  .attr("y2",0)
                  .attr("stroke",self.color);

               ticks_v.append("text")
                 .attr("x",-5)
                 .attr("y",-10)
                  .text(function(d) { return d});
                }
           },
  translateBed: function(start,end) {
               xstart=this.scale(start)
               xend=this.scale(end)
               if (xend>xstart)
               {
               return [xstart,xend-xstart]  //return x,width
               }
               else
               {
                return [xend,xstart-xend]
               }
            }
  
}

B.BedModel= default_model()
  /* options include
   * chr,start,stop,id,score,strand,
   */
   
B.BedModel.prototype = {
   length: function() {
     return this.stop-this.start;
   },
   exons: function() {
    var exons = [];
        if (!this.blockCount) {
            exons.push(new BedModel({"chr":this.chr,"start":this.start,"stop":this.stop,"strand":this.strand,"score":this.score,"id":this.id+"_Exon1"}));
        }
        else
        {
            var step=1;
            var j=0
            if (this.strand=="-") {
                step=-1;
                j=this.blockCount-1;
                }
            for(var i=0;i<this.blockCount;i++)
            {
                var exon_start=this.start+this.blockStarts[i];
                var exon_end=this.start+this.blockStarts[i]+this.blockSizes[i];
                var exon_id=this.id+"_Exon_"+(j+1);
                j+=step;
                exons.push( new B.BedModel({
                "chr":this.chr,"start":exon_start,"stop":exon_end,"id":exon_id,"score":0.0,"strand":this.strand,"end":exon_end
                }));
            }
        }
        return exons;
   },
   introns: function() {
    var introns=[];
    if (this.blockCount) {
        var step=1;
        var j=0;
        if (this.strand=="-") {
            step=-1;
            j=this.blockCount-2;
        }
        for(var i=0;i<this.blockCount-1;i++)
        {
            var intron_start=this.start+this.blockStarts[i]+this.blockSizes[i];
            var intron_end=this.start+this.blockStarts[i+1];
            var intron_id=this.id+"_Intron_"+(j+1);
            j+=step;
            introns.push( new B.BedModel({
                "chr":this.chr,"start":intron_start,"stop":intron_end,"id":intron_id,"score":0.0,"strand":this.strand
            }));
        }
    }
    return introns;
   },
   slice: function(start,stop,suffix) {
     if (typeof suffix == "undefined")
     {
         suffix="sliced";
     }
     var chr=this.chr;
     if (start < this.start) {start=this.start}
     if (stop > this.stop) {stop=this.stop}
     strand=this.strand;
     id=this.id+"_"+suffix;
     score=this.score;
     itemRgb=this.itemRgb;
     cds_start=Math.max(start,this.cds_start);
     cds_stop=Math.min(stop,this.cds_stop);
     blockCount=0;
     sliceBlockStarts=[];
     sliceBlockSizes=[];
     for(var i=0;i<this.blockCount;i++)
     {
         var blockStart=this.blockStarts[i];
         var blockSize=this.blockSizes[i];
         var exon_start=blockStart+this.start;
         var exon_stop=blockStart+blockSize+this.start;
         var slice_start=Math.max(start,exon_start);
         var slice_stop=Math.min(stop,exon_stop);
         if (slice_start < slice_stop)
         {
             blockCount+=1;
             sliceBlockStarts.push(slice_start-start);
             sliceBlockSizes.push(slice_stop-slice_start);
         }
         
     }
     if (blockCount===0) {return null}
     else {
       return new B.BedModel({
           "chr":chr,"start":start,"stop":stop,
           "id":id,"score":score,"strand":strand,
           "cds_start":cds_start,"cds_stop":cds_stop,"itemRgb":itemRgb,
           "blockCount":blockCount,"blockSizes":sliceBlockSizes,"blockStarts":sliceBlockStarts
       });
     }
   },
   
   UTR3: function() {
    if (this.strand=="-") { return this.slice(this.start,this.cds_start,"UTR3") }
    if (this.strand=="+") { return this.slice(this.cds_stop,this.stop,"UTR3") }
   },
   UTR5: function() {
    if (this.strand=="+") { return this.slice(this.start,this.cds_start,"UTR5") }
    if (this.strand=="-") { return this.slice(this.cds_stop,this.stop,"UTR5") }
   },
   CDS: function() {
     return this.slice(this.cds_start,this.cds_stop,"CDS")
   }
   
   
};

B.Bed6View= default_model();
  // options include  , height color
 
B.Bed6View.prototype = {
  render: function(axis,y) // x axis, and y axis
           {
               var bed=this.el;
               var t=axis.translateBed(this.model.start,this.model.stop);
               var x=t[0];
               var width=t[1];
               bed.append("rect")
               .attr("x",x)
               .attr("y",y)
               .attr("height",this.height)
               .attr("width",width)
               .attr("fill",this.color)
               .attr("opacity",0.7)
               .on("mouseover",function(d,i) {d3.select(this).attr("opacity",1.0)})
               .on("mouseout",function(d,i) {d3.select(this).attr("opacity",0.7)})
               .append("title").text(this.model.id+" "+this.model.start+"-"+this.model.stop);
           },
};



B.Bed12View= default_model();

B.Bed12View.prototype = {
   render: function(axis,y)
   {
     if (this.model.cds_start==this.model.cds_stop)
     {
       this.render_lincRNA(axis,y);
     }
     else
     {
       this.render_mRNA(axis,y);
     }
   },
   render_lincRNA: function(axis,y)
    {
            self=this;
            exons=this.model.exons();
            exons.forEach( function(d) {
            var exon=new B.BedModel(d);
            var exonView= new B.Bed6View({"model":exon,"el":self.el,"height":self.height,"color":self.color});
            exonView.render(axis,y);
            });
            introns=this.model.introns();
            introns.forEach( function(d) {
            var intron=new B.BedModel(d);
            var intronView= new B.Bed6View({"model":intron,"el":self.el,"height":2,"color":"grey"});
            intronView.render(axis,y+self.height/2-1);
            });
         
        },
   render_mRNA: function(axis,y)
        {
            self=this;
            console.log(this.model);
            var utr3=this.model.UTR3();
            var utr3_exons;
            if (utr3)
              {
                console.log(utr3);
              utr3_exons=utr3.exons(); // null test?
              }
              else
              {
              utr3_exons=[] ;
              }
            var utr5=this.model.UTR5();
            var utr5_exons;
            if(utr5)
            {
            utr5_exons=utr5.exons();
            }
            else
            {
              utr5_exons=[]
            }
            utr5_exons.forEach( function(d) {
            var exon=new B.BedModel(d)
            var exonView= new B.Bed6View({"model":exon,"el":self.el,"height":self.height/2,"color":self.color});
            exonView.render(axis,y+self.height/4);
            })
            utr3_exons.forEach( function(d) {
            var exon=new B.BedModel(d)
            var exonView= new B.Bed6View({"model":exon,"el":self.el,"height":self.height/2,"color":self.color});
            exonView.render(axis,y+self.height/4);
            })
            
            var cds_exons=this.model.CDS().exons();
            cds_exons.forEach( function(d) {
            var exon=new B.BedModel(d)
            var exonView= new B.Bed6View({"model":exon,"el":self.el,"height":self.height,"color":self.color});
            exonView.render(axis,y);
            })

            introns=this.model.introns();
            introns.forEach( function(d) {
            var intron=new B.BedModel(d)
            var intronView= new B.Bed6View({"model":intron,"el":self.el,"height":2,"color":"grey"});
            intronView.render(axis,y+self.height/2-1);
            })
         
        }

  
};

B.PlotModel=function(options) {
  for (var key in options)
 {
    /*
     * chr,name,values,start,end
     */
    this[key]=options[key];
    
 }
 if(!options["end"]) {this["end"]=this.start+this.values.length;}
}
B.PlotModel.prototype= {
  length: function(){
        return this.end-this.start;// return value's length.
        },
  max: function(){
        var max=this.values[0];
        for (var v in this.values){
          if (max < this.values[v]) {max=this.values[v];}
          }
        return max;
       },
  min: function(){
        var min=this.values[0];
        for (var v in this.values){
          if (min > this.values[v]) {min=this.values[v];}
        }
        return min;
  }
}
B.PlotView= function(options) {
      for (var key in options){ this[key]=options[key];}
      this.yMax=Math.max.apply(Math,this.model.values);
      this.yMin=Math.min.apply(Math,this.model.values);
      if (!this.color) {this["color"]="black";}
      
   }
B.PlotView.prototype= {
   render: function(coord_v){
    var self=this;
    var coord=coord_v.model
    var len=self.model.length();
    var bars,start,end,values;
    if (coord.start > this.model.start && coord.end < this.model.end)
    {
    values=this.model.values.slice(coord.start-this.model.start,coord.end-this.model.start)
    start=coord.start;
    end=coord.end;
    }
    else if (coord.start > this.model.start && coord.end > this.model.end)
    {
    values=this.model.values.slice(coord.start-this.model.start,this.model.end-this.model.start)
    start=coord.start;
    end=this.model.end;
    }
    else if (coord.start < this.model.start && coord.end < this.model.end)
    {
    values=this.model.values.slice(0,coord.end-this.model.start)
    start=this.model.start;
    end=coord.end;
    }
    else
    {
      values=this.model.values;
      start=this.model.start;
      end=this.model.end;
    }
    
    bars=this.el.selectAll("rect").data(values).enter().append("rect");
    
    
    var xw=coord_v.translateBed(start,end)
    var x=xw[0]
    var width=xw[1]
    var k=width/(end-start);
    bars.attr("fill",self.color)
    .attr("x",function(d,i) { return coord_v.scale(start+i)})
    .attr("y",function(d,i) { if (d<0) {return self.y} else {return self.y - d/self.yMax*self.height}})
    .attr("height",function(d,i){
          console.log(self.yMax)
          return Math.abs(d)/self.yMax*self.height
          })
    .attr("width",function(d,i) {return k})
    .attr("opacity",0.7)
    .on("mouseover",function(d,i) {d3.select(this).attr("opacity",1.0)})
    .on("mouseout",function(d,i) {d3.select(this).attr("opacity",0.7)})
    .append("title").text(function(d,i) { return "pos:"+ (i+start) +" value:"+d })
    }
 }
}(bam2x))
 
 
