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
  // drupal_add_js('https://d3js.org/d3.v4.min.js', 'external');
  // drupal_add_js('https://d3js.org/d3-selection-multi.v1.min.js', 'external');
  
  // https://d3js.org/d3.v3.min.js

  //drupal_add_css($path . '/theme/css/display_block.css', array('type'=>'file'));
  //drupal_add_js($path . '/theme/js/search_block.js', array('type'=>'file', 'scope'=>'footer','weight' => 100));
  drupal_add_js('https://d3js.org/d3.v3.min.js', 'external');
  drupal_add_js($path . '/theme/js/bam2x.circos.js', array('type'=>'file'));
  drupal_add_js($path . '/theme/js/test.js', array('type'=>'file', 'scope'=>'footer','weight' => 100));
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
  drupal_add_js('https://d3js.org/d3.v4.min.js', 'external');
  drupal_add_js('https://d3js.org/d3-selection-multi.v1.min.js', 'external');
  drupal_add_css($path . '/theme/css/display_block.css', array('type'=>'file'));

  // drupal_add_js($insert_js, array('type'=>'inline', 'scope'=>'footer','weight' => 50));
  drupal_add_js($path . '/theme/js/display_block.js', array('type'=>'file', 'scope'=>'footer','weight' => 100));

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
  $gene_array = array(); 
  $gene_array_left = array();
  $gene_array_right = array();
 
  if ($vars['record']->value) {
    $lines = explode("\n", $vars['record']->value);
    foreach ($lines as $line) {
      $m = explode("\t", $line);
      if (count($m) == 3) {
        $block_info[] = $m;
      }
      if (isset($m[0]) && $m[0] != 'NA' && $m[0] != '') {
        $gene_array[] = $m[0];
		$gene_array_left[] = $m[0];
      }
      if (isset($m[1]) && $m[1] != 'NA' && $m[1] != '') {
        $gene_array[] = $m[1];
		$gene_array_right[] = $m[1];
      }
    }
  }
  $vars['block_info'] = $block_info;

  // get the genes location 
  $gene_position = array();
  $sql_gene_loc = 'SELECT F.uniquename, F.name, FL.fmin, FL.fmax FROM {feature} F 
    LEFT JOIN {featureloc} FL ON F.feature_id = FL.feature_id
    WHERE F.uniquename IN (:genes)';
  $result_gene_array = chado_query($sql_gene_loc, array(':genes' => $gene_array));
  foreach ($result_gene_array as $gene_pos) {
    $gene_position[$gene_pos->uniquename] = array('name' => $gene_pos->name, 'fmin' => $gene_pos->fmin, 'fmax' => $gene_pos->fmax);
  }
  $vars['gene_position'] = $gene_position;

  $left_pos = array(
		$gene_position[current($gene_array_left)]['fmin'],
		$gene_position[current($gene_array_left)]['fmax'],
		$gene_position[end($gene_array_left)]['fmin'],
		$gene_position[end($gene_array_left)]['fmax']
	);
  $left_start = min($left_pos);
  $left_end = max($left_pos);

  $right_pos = array(
        $gene_position[current($gene_array_right)]['fmin'],
        $gene_position[current($gene_array_right)]['fmax'],
        $gene_position[end($gene_array_right)]['fmin'],
        $gene_position[end($gene_array_right)]['fmax']
    );
  $right_start = min($right_pos);
  $right_end = max($right_pos);
  $vars['block_position_fix'] = array($left_start, $left_end, $right_start, $right_end);
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
ck_position_fix
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
