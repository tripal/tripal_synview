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
    $organism1 = $b->b1_org . "<br>" . $b->b1_sid . " : ". $b->b1_fmin . " - ".$b->b1_fmax;
    $organism2 = $b->b2_org . "<br>" . $b->b2_sid . " : ". $b->b2_fmin . " - ".$b->b2_fmax;

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


