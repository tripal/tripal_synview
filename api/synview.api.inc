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
  $sql = "SELECT S.genome1, O.common_name as name1, S.genome2, R.common_name as name2 FROM synfile S 
     LEFT JOIN chado.organism O ON O.organism_id = S.genome1
     LEFT JOIN chado.organism R ON R.organism_id = S.genome2
     ORDER BY S.genome1 
  ";
  $result = chado_query($sql);
  foreach ($result as $r) {
    $org_opts[$r->genome1] = $r->name1;
    $org_opts[$r->genome2] = $r->name2;
  }

  return $org_opts;
}

function get_reference ($org_opts) {

  $result = chado_select_record('cvterm', array('cvterm_id'), array('name' => 'syntenic_region'));
  $type_id = $result[0]->cvterm_id;

  $sql = "SELECT R.feature_id, R.uniquename, R.seqlen FROM chado.feature R
    LEFT JOIN chado.featureloc FL ON R.feature_id = FL.srcfeature_id
    LEFT JOIN chado.feature F ON FL.feature_id = F.feature_id
    WHERE F.type_id = :type_id AND F.organism_id = :organism_id
    ORDER BY R.feature_id ASC";

  foreach ($org_opts as $genome_sel => $org_name) {
    if (isset($_SESSION['tripal_synview_search']['REF'][$genome_sel]) and 
        isset($_SESSION['tripal_synview_search']['RLEN'][$genome_sel]) and
        $_SESSION['tripal_synview_search']['REF'][$genome_sel] and
        $_SESSION['tripal_synview_search']['RLEN'][$genome_sel]) {
      continue;
    }
    $result = chado_query($sql, array(':type_id'=>$type_id, ':organism_id'=>$genome_sel));
    $ref_name = array();
    $seqlen = array(); 
    foreach ($result as $r) {
      $ref_name[$r->feature_id] = $r->uniquename;
      $seqlen[$r->feature_id] = $r->seqlen; 
    }
    // save the reference name array to session
    $_SESSION['tripal_synview_search']['REF'][$genome_sel] = $ref_name;
    $_SESSION['tripal_synview_search']['RLEN'][$genome_sel] = $seqlen;
  }
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




