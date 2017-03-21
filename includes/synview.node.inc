<?php

/**
 * @file
 * Contains all functions for creating synteny node type
 */

/**
 * Implements hook_node_info().
 */
function synview_node_info() {
  return array(
    'synteny' => array(
      'name' => t('Synteny File'),
      'base' => 'synteny',
      'description' => t('Add a synteny file generated from MCScanX.'),
    ),
  );
}

/**
 * Implements hook_node_access().
 */
function synview_node_access($node, $op, $account) {
  $node_type = $node;
  if (is_object($node)) {
    $node_type = $node->type;
  }

  if($node_type == 'synteny') {
    if ($op == 'create') {
      if (!user_access('create synteny File', $account)) {
        return NODE_ACCESS_DENY;
      }
      return NODE_ACCESS_ALLOW;
    }
    if ($op == 'update') {
      if (!user_access('edit synteny File', $account)) {
        return NODE_ACCESS_DENY;
      }
    }
    if ($op == 'delete') {
      if (!user_access('delete synteny File', $account)) {
        return NODE_ACCESS_DENY;
      }
    }
    if ($op == 'view') {
      if (!user_access('access synteny File', $account)) {
        return NODE_ACCESS_DENY;
      }
    }

    return NODE_ACCESS_IGNORE;
  }
}

/**
 * Form constructor for the pwy node
 *
 * @see pwy_insert()
 * @see pwy_update()
 * @see pwy_delete()
 * @see pwy_load()
 */
function synteny_form($node, &$form_state) {
  $form = array();

  $form['#validate'] = array('synteny_form_validate');

  // generate options for organisms
  $first_opt = array('SELECT_G' => 'Select a genome');

  $org_select = chado_select_record(
    'organism',
    array('organism_id', 'common_name'),
    array()
  );
  foreach ($org_select as $org) {
    $org_opts[$org->organism_id] = $org->common_name;
  }

  $form['#org_opts']  = $org_opts; // pass org array through from
  $org_opts = $first_opt + $org_opts;

  $form['core'] = array(
    '#type' => 'fieldset',
    '#title' => 'General'
  );

  $form['core']['syn_name']= array(
    '#type' => 'textfield',
    '#title' => t('Human-readable Name for synteny File'),
    '#required' => TRUE,
    '#default_value' => isset($node->syn_name) ? $node->syn_name : '',
    '#description' => t('For example: synteny analysis for cucumber PI and cucumbery Gy14, or synteny analysis for melon'),
  );

  $form['core']['syn_org1'] = array(
    '#type' => 'select',
    '#title' => t('Select Genome 1'),
    '#description' => t('For example，cucumber (PI89643)'),
    '#options' => $org_opts,
    '#required' => TRUE,
    '#default_value' => isset($node->syn_org1) ? $node->syn_org1 : '',
  );

  $form['core']['syn_org2'] = array(
    '#type' => 'select',
    '#title' => t('Select Genome 2'),
    '#description' => t('For example，cucumber (Gy14). The organism 1 and organism 2 can be same!'),
    '#options' => $org_opts,
    '#required' => TRUE,
    '#default_value' => isset($node->syn_org2) ? $node->syn_org2 : '',
  );


  $form['core']['syn_path']= array(
    '#type' => 'textfield',
    '#title' => t('File name and location (Full Path)'),
    '#description' => t('The full path of your synteny file. For example, /home/web/synteny/cpi_cgy_block.txt'),
    '#required' => TRUE,
    '#default_value' => isset($node->syn_path) ? $node->syn_path : '',
  );


  $form['core']['syn_install'] = array(
    '#type' => 'checkbox',
    '#title' => t('Insert/update synteny files to chado database'),
    '#prefix' => '<p><b>Load Synteny File</b></p><span style="float: left; display: block; margin: 10px;">',
    '#suffix' => '</span>',
    '#default_value' => isset($node->syn_install) ? $node->syn_install : '',
  );

  return $form;
}

function synteny_form_validate($form, $form_state) {

  // print error if the two genome exist
  // print error if the 
 
}

/**
 * Implements hook_insert().
 */
function synteny_insert($node) {
  
  // Actually insert the record.
  // get a tripal job to insert database
  db_insert('synfile')->fields(array(
    'nid'        => $node->nid,
    'synname'    => $node->syn_name,
    'genome1'    => $node->syn_org1,
    'genome2'    => $node->syn_org2,
    'synpath'    => $node->syn_path,
    'install'    => $node->syn_install,
  ))->execute();

  // add new blocks (tripal_job)
  if ($node->syn_install == 1) {
    synteny_file_load_job($node);
  }
}

/**
 * Implements hook_node_insert().
 * This function acts on ALL NODES
 */
function synview_node_insert($node) {
  if ($node->type == 'synteny') {
    $node->title = $node->syn_name;
  }
}

/**
 * Implements hook_update().
 * modify pwy in database level
 */
function synteny_update($node) {
  // Update the record.
  db_update('synfile')->fields(array(
    'synname'    => $node->syn_name,
    'genome1'    => $node->syn_org1,
    'genome2'    => $node->syn_org2,
    'synpath'    => $node->syn_path,
    'install'    => $node->syn_install,
  ))->condition('nid', $node->nid)->execute();

  // remove old blocks (tripal job)

  // add new block (tripal job)
  if ($node->syn_install == 1) {
    synteny_file_load_job($node);
  }
}

/**
 * Implements hook_node_update().
 * This function acts on ALL NODES
 * for pwy_tool_node
 */
function synview_node_update($node) {
  if ($node->type == 'synfile')  {
    $node->title = $node->syn_name;
  }
}

/**
 * Implements hook_delete(). 
 * modify pwy in database level 
 */
function synteny_delete($node) {
  db_delete('synfile')->condition('nid',$node->nid)->execute();

  // remove old blocks (tripal job)
  // $node->syn_path
}

/**
 * Implements hook_load().
 * modify pwy in database level
 */
function synteny_load($nodes) {

  $sql = "
    SELECT nid, synname, genome1, genome2, synpath, install
    FROM {synfile} 
    WHERE nid IN (:nids)";
  $result = db_query($sql, array(':nids' => array_keys($nodes)));

  foreach ($result as $record) {
    $nodes[$record->nid]->title = $record->synname;
    $nodes[$record->nid]->syn_name = $record->synname;
    $nodes[$record->nid]->syn_org1 = $record->genome1;
    $nodes[$record->nid]->syn_org2 = $record->genome2;
    $nodes[$record->nid]->syn_path = $record->synpath;
    $nodes[$record->nid]->syn_install = $record->install;
  }
}

