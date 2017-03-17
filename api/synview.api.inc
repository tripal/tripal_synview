<?php

/**
 * @file
 * Contains more generally applicable functions as well as some meant to help developers
 * Plug-in to the synview 
 */

/**
 * retrieve organism from database 
 * 
 * @return array of organism, key: organism_id value: common_name
 */
function get_organism_options () {
  $org_opts = array();
  $org_select = chado_select_record(
     'organism',
     array('organism_id', 'common_name'),
     array()
  );
  foreach ($org_select as $org) {
     $org_opts[$org->organism_id] = $org->common_name;
  }
  return $org_opts;
}

/**
 * Get block info
 *
 * @param $block_id
 *
 * @return
 *   a stdclass of block_info
 */

function get_block_from_chado($block_id) {
  $block_info = array();

  //if (isset($identifiers['nid'])) {
  //  $node = node_load($identifiers['nid']);
  //}
  //elseif (isset($identifiers['name'])) {
  //
  //  $nid = db_query('SELECT nid FROM {blastdb} WHERE name=:name', array(':name' => $identifiers['name']))->fetchField();
  //  $node = node_load($nid);
  //
  //} elseif (isset($identifiers['path'])) {
  //  $nid = db_query('SELECT nid FROM {blastdb} WHERE path LIKE :path', array(':path' => db_like($identifiers['path']) . '%'))->fetchField();
  //  $node = node_load($nid);
  //}

  return $block_info;
}

function get_block_by_location($org_id, $chr, $start, $end, $ref_org) {
  $block = array('test00001', 'test00002', 'test00003');
  return $block;
}




