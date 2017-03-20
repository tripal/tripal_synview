<?php

/**
 * @file
 *
 */

/**
 * generate form for search syn.
 */
function synview_search_form($form, $form_state) {

  // search block by genome, chr, start, end 
  $first_opt = array('SELECT_G' => 'Select a genome');
  $org_opts = get_organism_options();

  $form['#org_opts']  = $org_opts; // pass org array through from
  $org_opts = $first_opt + $org_opts;

  $form['LOCATION'] = array(
    '#type' => 'fieldset',
    '#title' => t('Search blocks by location.'),
    '#collapsible' => FALSE,
    '#collapsed' => FALSE,
  );

  $form['LOCATION']['SELECT_GENOME'] = array(
    '#type' => 'select',
    '#title' => t('Genome:'),
    '#options' => $org_opts,
    '#default_value' => isset($_SESSION['tripal_synview_search']['SELECT_GENOME']) ? $_SESSION['tripal_synview_search']['SELECT_GENOME'] : 'SELECT_G', // put default db for different web
    '#ajax' => array(
      'event' => 'change',
      'callback' => 'ajax_synview_location_callback',
      'method'   => 'replace',
      'wrapper'  => 'id-textarea',
      'effect'   => 'fade',
    ),
  );

  // retrieve prev selection from session
  $second_opt = array('SELECT_C' => 'Select a chromosome/scaffold');
  if (isset($_SESSION['tripal_synview_search']['SELECT_GENOME']) ) {
    $genome_sel = $_SESSION['tripal_synview_search']['SELECT_GENOME'];
    if (isset($_SESSION['tripal_synview_search']['REF'][$genome_sel])) {
      foreach ($_SESSION['tripal_synview_search']['REF'][$genome_sel] as $rid => $rname) {
        $second_opt[$rid] = $rname;
      }
    }
  }

  $form['LOCATION']['SELECT_CHR'] = array(
    '#type' => 'select',
    '#title' => t('Chromosome/Scaffold:'),
    '#prefix' => '<div id="id-textarea">',
    '#suffix' => '</div>',
    '#options' => $second_opt,
    '#default_value' => isset($_SESSION['tripal_synview_search']['SELECT_CHR']) ? $_SESSION['tripal_synview_search']['SELECT_CHR'] : 'SELECT_C',
    '#validated' => TRUE,
  );

  $form['LOCATION']['START'] = array(
    '#type' => 'textfield',
    '#title' => t('Start:'),
    '#maxlength' => 20,
    '#default_value' => isset($_SESSION['tripal_synview_search']['START']) ? $_SESSION['tripal_synview_search']['START'] : '',
    '#prefix' =>'<div id=xyz>',
  );

  $form['LOCATION']['END'] = array(
    '#type' => 'textfield',
    '#title' => t('End:'),
    '#maxlength' => 20,
    '#default_value' => isset($_SESSION['tripal_synview_search']['END']) ? $_SESSION['tripal_synview_search']['END'] : '',
    '#suffix' =>'</div>',
  );

  $n = 0;
  foreach ($form['#org_opts'] as $org_id => $org_name) {
    $label = "ORG_" . $org_id;
    $n++;
    if ($n == 1) {
      $form['LOCATION'][$label] = array(
        '#type' => 'checkbox',
        '#title' => $org_name,
        '#default_value' => isset($_SESSION['tripal_synview_search']['REFORG'][$org_id]) ? 1 : 0,
        '#prefix' => '<br><b>Please choose one genome at least:</b><br><span style="float: left; display: block; margin: 10px;">',
        '#suffix' => '</span>',
      );
    } else {
      $form['LOCATION'][$label] = array(
        '#type' => 'checkbox',
        '#title' => $org_name,
        '#default_value' => isset($_SESSION['tripal_synview_search']['REFORG'][$org_id]) ? 1 : 0,
        '#prefix' => '<span style="float: left; display: block; margin: 10px;">',
        '#suffix' => '</span>',
      );
    }
  }

  //.........................
  $form['ID'] = array(
    '#type' => 'fieldset',
    '#title' => t('<b>OR</b> Search block by ID.'),
    '#collapsible' => FALSE,
    '#collapsed' => FALSE,
  );

  $form['ID']['INPUT_ID'] = array(
    '#type' => 'textfield',
    '#title' => t('Enter a block ID. Example: test00001'),
    '#maxlength' => 20,
  );

  // Submit
  //.........................
  $form['submit'] = array(
    '#type' => 'submit',
    '#default_value' => ' Search ',
  );

  $form['#prefix'] = '<div class="row"> <div class="col-md-8 col-md-offset-2">';
  $form['#suffix'] = '</div> </div>';

  return $form;
}

/**
 * Validate the user options submitted via the above form.
 */
function synview_search_form_validate($form, &$form_state) {

  if (empty($form_state['values']['INPUT_ID'])) {
    // if no block ID is provided
    // the genome, chr, and ref genome should be required
    $org_id = $form_state['values']['SELECT_GENOME'];
    $chr    = $form_state['values']['SELECT_CHR'];
    $start  = $form_state['values']['START'];
    $end    = $form_state['values']['END'];

    if (empty($form_state['values']['SELECT_GENOME']) || $form_state['values']['SELECT_GENOME'] == 'SELECT_G') {
      form_set_error('SELECT_GENOME', t('No genome selected. Choose a genome from the list.'));
    }

    if (empty($chr)) {
      form_set_error('SELECT_CHR', t('No chromosome selected. Choose a chromosome from the list.'));
    }

    if ($start and !preg_match('/^\d+$/', $start)) {
      form_set_error('START', 'Please enter a positive numeric value for the start');
    }
    if ($end and !preg_match('/^\d+$/', $end)) {
      form_set_error('END', 'Please enter a positive numeric value for the end');
    }
  
    if ($start and $end) { 
      if ($end - $start + 1 > 1000000) {
        form_set_error('START', 'Please reduce the searching range to 1M bp');
        form_set_error('END', 'Please reduce the searching range to 1M bp');
      }
    } 
    elseif ($start) {
      $end = $start + 1000000 - 1;
      $form_state['values']['END'] = $end;
    }
    elseif ($end) {
      $start = $end - 1000000 + 1;
      if ($start < 1) {
        $start = 1;
      }
      $form_state['values']['START'] = $start;
    } 
    else {
      form_set_error('START', 'Please enter a positive numeric value for the start');
      form_set_error('END', 'Please enter a positive numeric value for the end');
    }

    $ref_org = array();
    foreach ($form['#org_opts'] as $org_id => $org_name) {
      $label = "ORG_" . $org_id;
      if ($form_state['values'][$label]) {
        $ref_org[$org_id] = $org_name;
      }  
    }

    if (count($ref_org) == 0) {
      form_set_error('LOCATION', t('No reference genome selected. Check one genome at least.'));
    }

    $form_state['refORG'] = $ref_org;
    $form_state['byFlag'] = 'location';
  } else {
    $form_state['byFlag'] = 'id';
  }

}

/**
 * Process the user options submitted.
 */
function synview_search_form_submit($form, &$form_state) {

  $error = FALSE;

  // search database
  if ($form_state['byFlag'] == 'location') {
    $org_id = $form_state['values']['SELECT_GENOME'];
    $chr = $form_state['values']['SELECT_CHR'];
    $start = $form_state['values']['START'];
    $end = $form_state['values']['END'];
    $ref_org = $form_state['refORG']; 

    $_SESSION['tripal_synview_search']['SELECT_GENOME'] = $form_state['values']['SELECT_GENOME'];
    $_SESSION['tripal_synview_search']['SELECT_CHR']    = $form_state['values']['SELECT_CHR'];
    $_SESSION['tripal_synview_search']['START']         = $form_state['values']['START'];
    $_SESSION['tripal_synview_search']['END']           = $form_state['values']['END'];
    $_SESSION['tripal_synview_search']['REFORG']        = $form_state['refORG'];

    drupal_goto("synview/search/result");
  } 
  elseif ($form_state['byFlag'] == 'id') {
    // if search block id, go to display_block page
    // otherwise, show error information
    $block_id = $form_state['values']['INPUT_ID'];
    $blk_info = db_query('SELECT value FROM {synblock} WHERE blockid=:block_id ', array(':block_id' => $block_id))->fetchField();
   
    if(!empty($blk_info)) {
      drupal_goto("synview/block/$block_id");
    } else {
      drupal_set_message("Can not find block ID: $block_id", 'warning');
    }
  }
  else {
    $error = TRUE;
    tripal_report_error(
      'synview',
      TRIPAL_ERROR,
      "Can not determine the search method byFlag."
    );
  }
}

/**
 * AJAX: change the selection of chr according genome.
 */
function ajax_synview_location_callback($form, $form_state) {

  $genome_sel = $form_state['values']['SELECT_GENOME'];

  $ref_name = array();
  $chr_opts = array('SELECT_G' => 'Select a genome');

  // retrieve reference id and name from session for saving search time
  if (isset($_SESSION['tripal_synview_search']['REF'][$genome_sel])) {
    foreach ($_SESSION['tripal_synview_search']['REF'][$genome_sel] as $rid => $rname) {
      $chr_opts[$rid] = $rname;
    }
  }
  // otherwise, searching database to retrieve reference id and name
  else {
    $result = chado_select_record('cvterm', array('cvterm_id'), array('name' => 'syntenic_region'));
    $type_id = $result[0]->cvterm_id;

    $sql = "SELECT R.feature_id, R.uniquename FROM chado.feature R
      LEFT JOIN chado.featureloc FL ON R.feature_id = FL.srcfeature_id
      LEFT JOIN chado.feature F ON FL.feature_id = F.feature_id
      WHERE F.type_id = :type_id AND F.organism_id = :organism_id
      ORDER BY R.feature_id ASC";

    $result = chado_query($sql, array(':type_id'=>$type_id, ':organism_id'=>$genome_sel));
    foreach ($result as $r) {
      $chr_opts[$r->feature_id] = $r->uniquename;
      $ref_name[$r->feature_id] = $r->uniquename;
    }

    // save the reference name array to session
    $_SESSION['tripal_synview_search']['REF'][$genome_sel] = $ref_name;
  }

  // set default value
  $form['LOCATION']['SELECT_CHR']['#default_value'] = isset($_SESSION['tripal_synview_search']['SELECT_CHR']) ? $_SESSION['tripal_synview_search']['SELECT_CHR'] : 'SELECT_C'; 

  $form['LOCATION']['SELECT_CHR']['#options'] = $chr_opts;
  $form['LOCATION']['SELECT_CHR']['#validated'] = TRUE;

  return $form['LOCATION']['SELECT_CHR'];
}

