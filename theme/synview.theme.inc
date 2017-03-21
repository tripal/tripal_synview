<?php

/**
 * @file
 * This file contains functions specifically related to theme-ing the BLAST module
 */


/**
 * preprocess synview_search_result them to add js code
 */

function synview_preprocess_synview_search_result(&$vars) {
  // Add CSS and Javascript files
  $path = drupal_get_path('module', 'synview');
  //drupal_add_js('https://cdnjs.cloudflare.com/ajax/libs/d3/4.5.0/d3.min.js');
  //drupal_add_js($settings, 'setting');
  //drupal_add_js($path . '/theme/js/synview.js');
}

/**
 * Preprocess function for the show_pwyenrich_report.tpl.php
 *
 * Use this function to prepare variables for use in the template,
 * as well as to add css/javascript needed.
 *
 * @param $vars
 *   The variables currently available to the template.
 *
 * after preprocess: 
 * the var tripal_job, html_path, html_info could be directly use in them: show_goenrich_report
 *   theme show_goenrich_report point to template: goenrich_report
 *   so, these var is directly used in goenrich_report template
 */
function synview_preprocess_display_block(&$vars) {

  // Add CSS and Javascript files
  $path = drupal_get_path('module', 'synview');
  //drupal_add_js($path . '/theme/js/d3.min.js', array('type'=>'file'));
  //drupal_add_js($path . '/theme/js/bam2xjs/bam2x.circos.js', array('type'=>'file'));

  // put your data to obj
  //$obj = array(
  //    'xyz' => "test"
  //);
  //drupal_add_js($obj, array('type'=>'setting', 'group'=>'JS_LIBRARY'));

  $insert_js = '
var canvasSize = 800;
var center = 400;
var geneNameLen = 20;
var geneNamePx = 5;

function drawSyn(C) {
    var geneRadius = center - (geneNameLen * geneNamePx);
    var bed_outerRadius = geneRadius - 25;
    var bed_innerRadius = geneRadius - 27;
    var ide_outerRadius = geneRadius - 40;
    var ide_innerRadius = geneRadius - 50;
    var linkRadius = geneRadius - 55;
    var base_block_url = "http://icugi3.feilab.net/?q=synview/block/";
    var gene_url = "http://icugi3.feilab.net/?q=feature/gene/";
    var svg = d3.select("#canvas").append("svg").attr("width",canvasSize).attr("height",canvasSize).attr("id","synimg");

var ideogram1 = new C.IdeogramModel({"id":"at-Chr1","length":30.425192,"color":"blue"});
var ideogram2 = new C.IdeogramModel({"id":"at-Chr2","length":19.696821,"color":"blue"});
var ideogram3 = new C.IdeogramModel({"id":"at-Chr3","length":23.459804,"color":"blue"});
var ideogram4 = new C.IdeogramModel({"id":"at-Chr4","length":18.584524,"color":"blue"});
var ideogram5 = new C.IdeogramModel({"id":"at-Chr5","length":26.970641,"color":"blue"});
var collection=[ideogram1,ideogram2,ideogram3,ideogram4,ideogram5];
var ideogramTrack = new C.IdeogramTrack({"collection":collection,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":ide_outerRadius,"innerRadius":ide_innerRadius,"gapAngle":0.01});
      ideogramTrack.render(true);
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
var bedsCollection=[bed1,bed2,bed3,bed4,bed5,bed6,bed7,bed8,bed9,bed10,bed11,bed12,bed13,bed14,bed15,bed16,bed17,bed18,bed19,bed20,bed21,bed22,bed23,bed24];
var bedTrack = new C.BedTrack({"collection":bedsCollection,"el":svg.append("g"),"cx":center,"cy":center,"outerRadius":bed_outerRadius,"innerRadius":bed_innerRadius});
      bedTrack.render(ideogramTrack);
var link1 = new C.LinkModel({"source":bed1,"target":bed2, "id":"test00001"   });
var link2 = new C.LinkModel({"source":bed3,"target":bed4, "id":"test00002"   });
var link3 = new C.LinkModel({"source":bed5,"target":bed6, "id":"test00003"   });
var link4 = new C.LinkModel({"source":bed7,"target":bed8, "id":"test00004"   });
var link5 = new C.LinkModel({"source":bed9,"target":bed10, "id":"test00005"  });
var link6 = new C.LinkModel({"source":bed11,"target":bed12, "id":"test00006" });
var link7 = new C.LinkModel({"source":bed13,"target":bed14, "id":"test00007" });
var link8 = new C.LinkModel({"source":bed15,"target":bed16, "id":"test00008" });
var link9 = new C.LinkModel({"source":bed17,"target":bed18, "id":"test00009" });
var link10 = new C.LinkModel({"source":bed19,"target":bed20, "id":"test00010"});
var link11 = new C.LinkModel({"source":bed21,"target":bed22, "id":"test00011"});
var link12 = new C.LinkModel({"source":bed23,"target":bed24, "id":"test00012"});
var linksCollection = [link1,link2,link3,link4,link5,link6,link7,link8,link9,link10,link11,link12];
var linkTrack = new C.LinkTrack({"collection":linksCollection,"el":svg.append("g"),"cx":center,"cy":center,"radius":linkRadius,"outurl":base_block_url});
      linkTrack.render(ideogramTrack);
var lab1 = new C.LabelModel({"chr":"at-Chr1","start":0.011649,"end":0.013714,"id":"AT1G01030","color":"blue"});
var lab2 = new C.LabelModel({"chr":"at-Chr2","start":19.260918,"end":19.262404,"id":"AT2G46870","color":"blue"});
var lab3 = new C.LabelModel({"chr":"at-Chr1","start":18.314178,"end":18.316645,"id":"AT1G49480","color":"blue"});
var lab4 = new C.LabelModel({"chr":"at-Chr3","start":6.548869,"end":6.551853,"id":"AT3G18990","color":"blue"});
var lab5 = new C.LabelModel({"chr":"at-Chr1","start":18.31292,"end":18.314016,"id":"AT1G49475","color":"blue"});
var lab6 = new C.LabelModel({"chr":"at-Chr3","start":6.542509,"end":6.543676,"id":"AT3G18960","color":"blue"});
var lab7 = new C.LabelModel({"chr":"at-Chr1","start":0.011649,"end":0.013714,"id":"AT1G01030","color":"blue"});
var lab8 = new C.LabelModel({"chr":"at-Chr3","start":22.951463,"end":22.952851,"id":"AT3G61970","color":"blue"});
var lab9 = new C.LabelModel({"chr":"at-Chr2","start":19.260918,"end":19.262404,"id":"AT2G46870","color":"blue"});
var lab10 = new C.LabelModel({"chr":"at-Chr3","start":22.951463,"end":22.952851,"id":"AT3G61970","color":"blue"});
var lab11 = new C.LabelModel({"chr":"at-Chr2","start":15.148259,"end":15.151575,"id":"AT2G36080","color":"blue"});
var lab12 = new C.LabelModel({"chr":"at-Chr3","start":3.648924,"end":3.651332,"id":"AT3G11580","color":"blue"});
var lab13 = new C.LabelModel({"chr":"at-Chr2","start":10.48349,"end":10.487571,"id":"AT2G24650","color":"blue"});
var lab14 = new C.LabelModel({"chr":"at-Chr4","start":15.317499,"end":15.32002,"id":"AT4G31610","color":"blue"});
var lab15 = new C.LabelModel({"chr":"at-Chr2","start":10.493263,"end":10.496878,"id":"AT2G24680","color":"blue"});
var lab16 = new C.LabelModel({"chr":"at-Chr4","start":15.325343,"end":15.32722,"id":"AT4G31630","color":"blue"});
var lab17 = new C.LabelModel({"chr":"at-Chr2","start":19.260918,"end":19.262404,"id":"AT2G46870","color":"blue"});
var lab18 = new C.LabelModel({"chr":"at-Chr4","start":0.639247,"end":0.64094,"id":"AT4G01500","color":"blue"});
var lab19 = new C.LabelModel({"chr":"at-Chr2","start":14.864855,"end":14.866598,"id":"AT2G35310","color":"blue"});
var lab20 = new C.LabelModel({"chr":"at-Chr5","start":19.051568,"end":19.0532,"id":"AT5G46915","color":"blue"});
var lab21 = new C.LabelModel({"chr":"at-Chr2","start":15.148259,"end":15.151575,"id":"AT2G36080","color":"blue"});
var lab22 = new C.LabelModel({"chr":"at-Chr5","start":1.892714,"end":1.894124,"id":"AT5G06250","color":"blue"});
var lab23 = new C.LabelModel({"chr":"at-Chr3","start":22.951463,"end":22.952851,"id":"AT3G61970","color":"blue"});
var lab24 = new C.LabelModel({"chr":"at-Chr4","start":0.639247,"end":0.64094,"id":"AT4G01500","color":"blue"});
var lab25 = new C.LabelModel({"chr":"at-Chr3","start":3.648924,"end":3.651332,"id":"AT3G11580","color":"blue"});
var lab26 = new C.LabelModel({"chr":"at-Chr5","start":1.892714,"end":1.894124,"id":"AT5G06250","color":"blue"});
var lab27 = new C.LabelModel({"chr":"at-Chr3","start":19.766664,"end":19.768599,"id":"AT3G53310","color":"blue"});
var lab28 = new C.LabelModel({"chr":"at-Chr5","start":24.211871,"end":24.213164,"id":"AT5G60130","color":"blue"});
var labCollection=[lab1,lab2,lab3,lab4,lab5,lab6,lab7,lab8,lab9,lab10,lab11,lab12,lab13,lab14,lab15,lab16,lab17,lab18,lab19,lab20,lab21,lab22,lab23,lab24,lab25,lab26,lab27,lab28];
var labTrack = new C.LabelTrack({"outurl":gene_url,"collection":labCollection,"el":svg.append("g"),"cx":center,"cy":center,"radius":geneRadius});
      labTrack.render(ideogramTrack);
    //$syn_json
  }
  ';
  //drupal_add_js($insert_js, array('type'=>'inline', 'scope'=>'footer','weight' => 50));
  //drupal_add_js($path . '/theme/js/synview.js', array('type'=>'file', 'scope'=>'footer','weight' => 100));

  $block_id = $vars['block_id'];
  $result = db_query('SELECT b1, b2, value FROM {synblock} WHERE blockid=:block_id ', array(':block_id' => $block_id));

  foreach ($result as $r) {
    $vars['record'] = $r;
  }
        
  $b1 = chado_generate_var('feature', array('feature_id'=>$vars['record']->b1));
  $b1 = chado_expand_var($b1, 'table', 'featureloc');
  $b2 = chado_generate_var('feature', array('feature_id'=>$vars['record']->b2));
  $b2 = chado_expand_var($b2, 'table', 'featureloc');
  $vars['b1'] = $b1;
  $vars['b2'] = $b2;

  // save block value to array
  $block_info = array();
  
  if ($vars['record']->value) {
    $lines = explode("\n", $vars['record']->value);
    foreach ($lines as $line) {
      $m = explode("\t", $line);
      if (count($m) == 3) {
        $block_info[] = $m;
      }
    }
  }
  $vars['block_info'] = $block_info;
}

/**
 * Implements hook_theme_registery_alter().
 *
 * task: get understand what function of these code? 
 */
function synview_theme_registry_alter(&$theme_registry) {

  /**
  $theme_registry_copy = $theme_registry;
  $module_path = drupal_get_path('module', 'go_tool') . '/theme';
  _theme_process_registry($theme_registry_copy, 'phptemplate', 'theme_engine', 'my_custom_theme', $module_path);
  $theme_registry += array_diff_key($theme_registry_copy, $theme_registry);
  // A list of templates the module will provide templates for
  $hooks = array('page');
  foreach ($hooks as $hook) {
    // Add the key 'theme paths' if it doesn't exist in this theme's registry
    if (!isset($theme_registry[$hook]['theme paths'])) {
      $theme_registry[$hook]['theme paths'] = array();
    }
    // Shift this module's directory to the top of the theme path list
    if (is_array($theme_registry[$hook]['theme paths'])) {
      $first_element = array_shift($theme_registry[$hook]['theme paths']);
      if ($first_element) {
        array_unshift($theme_registry[$hook]['theme paths'], $first_element, $module_path);
      }
      else {
        array_unshift($theme_registry[$hook]['theme paths'], $module_path);
      }
    }
  }
  */
}
