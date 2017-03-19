<?php
/**
 * Display the syntenic block
 */

if ($block_info) {
  // display basic info of block 
  $rows = array();
  $headers = array();

  // show block ID
  $block_id = l($block_id, "synview/block/" . $block_id, array('html' => TRUE) );
  $rows[] = array(
    array(
      'data' => 'Block ID',
      'header' => TRUE,
      'width' => '20%',
    ),
    $block_id
  );

  // show organism A
  $orgA = $b1->organism_id->common_name;
  if (property_exists($b1->organism_id, 'nid')) {
    $orgA = l($orgA, "node/" . $b1->organism_id->nid, array('html' => TRUE));
  }

  $rows[] = array(
    array(
      'data' => 'Organism A',
      'header' => TRUE,
      'width' => '20%',
    ),
    $orgA
  );

  $locA = $b1->featureloc->feature_id->srcfeature_id->uniquename . " : " .
    $b1->featureloc->feature_id->fmin . " - ". 
    $b1->featureloc->feature_id->fmax;
  $rows[] = array(
    array(
      'data' => 'Location A',
      'header' => TRUE,
      'width' => '20%',
    ),
    $locA
  );
  // show organism B
  $orgB = $b2->organism_id->common_name;
  if (property_exists($b2->organism_id, 'nid')) {
    $orgB = l($orgB, "node/" . $b2->organism_id->nid, array('html' => TRUE));
  }
  $rows[] = array(
    array(
      'data' => 'Organism B',
      'header' => TRUE,
      'width' => '20%',
    ),
    $orgB
  );
  $locB = $b2->featureloc->feature_id->srcfeature_id->uniquename . " : " .
    $b2->featureloc->feature_id->fmin . " - ".
    $b2->featureloc->feature_id->fmax;
  $rows[] = array(
    array(
      'data' => 'Location B',
      'header' => TRUE,
      'width' => '20%',
    ),
    $locB
  );

  $table = array(
    'header' => $headers,
    'rows' => $rows,
    'attributes' => array(
      'id' => 'tripal_synview-display-block-basic',
      'class' => 'tripal-data-table table'
    ),
    'sticky' => FALSE,
    'caption' => '',
    'colgroups' => array(),
    'empty' => '',
  );

  $table_html = theme('table', $table);
  print '<div class="row"> <div class="col-md-8 col-md-offset-2">' . $table_html . '</div> </div>';

  // display gene pairs in block
  $rows = array();
  $headers = array('Gene A' , 'Gene B', 'e-value');

  foreach ($block_info as $m) {
    $id1 = $m[0];
    $id2 = $m[1];
    $id1_table = $id1;
    $id2_table = $id2;

    // quick, just 500ms to display, must set /feature/gene/ to dispaly gene feature, not universal
    if ($id1 != 'NA') {
      $id1_table = l($id1, "/feature/gene/" . $id1, array('html' => TRUE));
    }
    if ($id2 != 'NA') {
      $id2_table = l($id2, "/feature/gene/" . $id2, array('html' => TRUE));
    }

    /**
     * very very slow
    $id1_feature = chado_generate_var('feature', array('uniquename'=>$id1));
    $id2_feature = chado_generate_var('feature', array('uniquename'=>$id2));
    if ($id1 != 'NA' and property_exists($id1_feature, 'nid')) {
      $id1_table = l($id1, "node/" . $id1_feature->nid, array('html' => TRUE));
    }
    if ($id2 != 'NA' and property_exists($id2_feature, 'nid')) {
      $id2_table = l($id2, "node/" . $id2_feature->nid, array('attributes' => array('target' => "_blank")));
    }
    */

    $rows[] = array(
      array('data'=> $id1_table, 'width' => '30%'),
      array('data'=> $id2_table, 'width' => '30%'),
      array('data'=> $m[2], 'width' => '15%'),
    );
  }

  $table = array(
    'header' => $headers,
    'rows' => $rows,
    'attributes' => array(
      'id' => 'tripal_synview-display-block-gene',
      'class' => 'tripal-data-table table'
    ),
    'sticky' => FALSE,
    'caption' => '',
    'colgroups' => array(),
    'empty' => '',
  );

  $table_html = theme('table', $table);
  print '<div class="row"> <div class="col-md-8 col-md-offset-2">' . $table_html . '</div> </div>';
}

?>

<input type="button" onclick="zoomIn()" value="zoom in (+)" /> 
<input type="button" onclick="zoomOut()" value="zoom out (-)" /> 
<br> 
<div id="canvas" style="border:0px solid #000" ></div>

