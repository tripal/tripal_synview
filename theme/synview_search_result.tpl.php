<?php
//dpm($_SESSION['tripal_synview_search']);

// prepare info for searching syntenic Blocks
$org_id  = $_SESSION['tripal_synview_search']['SELECT_GENOME'];
$chr_id  = $_SESSION['tripal_synview_search']['SELECT_CHR'];
$chr     = $_SESSION['tripal_synview_search']['REF'][$org_id][$chr_id];
$start   = $_SESSION['tripal_synview_search']['START'];
$end     = $_SESSION['tripal_synview_search']['END'];

$ref_orgs = array(); 
foreach ($_SESSION['tripal_synview_search']['REFORG'] as $oid => $org_common_name) {
  $ref_orgs[]=l($org_common_name, 'orgamism/' . $oid);
}

$org_info = chado_generate_var('organism', array('organism_id'=>$org_id));

$ac_left  = l("<<<", "synview/search/result/left");
$ac_right = l(">>>", "synview/search/result/right");
$reference = "$chr : $start  -  $end";

print '<div class="row"> <div class="col-md-8 col-md-offset-2">';

// print breadcrumb (go back for another search)
$nav = array();
$nav[] = l('Home', '/');
$nav[] = l('Search Syntenic Blocks', 'synview/search');
$nav[] = t('Search Result for Syntenic Blocks');
$breadcrumb = '<nav class="nav">' . implode(" > ", $nav) . '</nav><br>';
print $breadcrumb;

// print info for searching
print '<p><b>Selected location: </b><br>';
print ' -> Genome: ' . $org_info->common_name . '<br>';
print ' -> Location: ' . $reference . '<br></p>';
print '<p><b>Genome(s) for comparison: </b><br>';
print implode(', ', $ref_orgs);
print '</p><br>';

// print button for moving left and right
print '<button type="button" class="btn btn-default"> ' . $ac_left . '</button>';
print "  $reference  ";
print '<button type="button" class="btn btn-default"> ' . $ac_right. '</button>';

// print search result
if (count($blocks) == 0) {
  ?><p>no block is found!</p><?php
} 
else {

  $rows = array();
  $headers = array('Block' , 'Organism1 (location)', 'Organism2 (location)', 'score', 'evalue');

  $n = 0;
  $color = '#DEEEEE';

  foreach ($cluster as $cls) {
    $n++;
    foreach ($cls as $bid) {
      $b = $blocks[$bid];
      $block_id = $b->blockid;
      $block_id = l($block_id, "synview/block/". $block_id, array('attributes' => array('target' => "_blank")));
      $organism1 = $b->b1_org . "<br>" . $b->b1_sid . " : ". $b->b1_fmin . " - ".$b->b1_fmax;
      $organism2 = $b->b2_org . "<br>" . $b->b2_sid . " : ". $b->b2_fmin . " - ".$b->b2_fmax;
 
      if ($n % 2 == 1) {
        $rows[] = array(
          array('data'=> $block_id,  'width' => '10%', 'bgcolor' => $color),
          array('data'=> $organism1, 'width' => '20%', 'bgcolor' => $color),
          array('data'=> $organism2, 'width' => '20%', 'bgcolor' => $color),
          array('data'=> $b->score,  'width' => '10%', 'bgcolor' => $color),
          array('data'=> $b->evalue, 'width' => '10%', 'bgcolor' => $color),
        );
      } else {
        $rows[] = array(  
          array('data'=> $block_id, 'width' => '10%'),
          array('data'=> $organism1, 'width' => '20%'),
          array('data'=> $organism2, 'width' => '20%'),
          array('data'=> $b->score, 'width' => '10%'),
          array('data'=> $b->evalue, 'width' => '10%'),
        );
      }
    }
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

print '</div></div>';

?>


