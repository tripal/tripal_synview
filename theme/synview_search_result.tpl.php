<?php

// output search blocks
// dpm($blocks, 'blocks');

if (count($blocks) == 0) {
  ?><p>no block is found!</p><?php
} 
else {

  $rows = array();
  $headers = array('Block' , 'Organism1 (location)', 'Organism2 (location)', 'score', 'evalue');

  foreach ($blocks as $b) {
    $block_id = $b->blockid;
    $block_id = l($block_id, "synview/block/". $block_id, array('attributes' => array('target' => "_blank")));
  
    //$organism1 = '';
    //$organism2 = '';

    $b1 = chado_generate_var('feature', array('feature_id'=>$b->b1));
    $b1 = chado_expand_var($b1, 'table', 'featureloc');
    $b2 = chado_generate_var('feature', array('feature_id'=>$b->b2));
    $b2 = chado_expand_var($b2, 'table', 'featureloc');

    $organism1 = $b1->organism_id->common_name . "<br>" . 
      $b1->featureloc->feature_id->srcfeature_id->uniquename . " : ". 
      $b1->featureloc->feature_id->fmin . " - ".
      $b1->featureloc->feature_id->fmax;

    $organism2 = $b2->organism_id->common_name . "<br>" . 
      $b2->featureloc->feature_id->srcfeature_id->uniquename . " : ".   
      $b2->featureloc->feature_id->fmin . " - ".
      $b2->featureloc->feature_id->fmax;
 
    $rows[] = array(
      array('data'=> $block_id, 'width' => '10%'),
      array('data'=> $organism1, 'width' => '20%'),
      array('data'=> $organism2, 'width' => '20%'),
      array('data'=> $b->score, 'width' => '10%'),
      array('data'=> $b->evalue, 'width' => '10%'),
    );
  }

  $table = array(
    'header' => $headers,
    'rows' => $rows,
    'attributes' => array(
      'id' => 'tripal_synview-search-result',
      'class' => 'tripal-data-table table'
    ),
    'sticky' => FALSE,
    'caption' => '',
    'colgroups' => array(),
    'empty' => '',
  );

  print theme_table($table);

}
?>


