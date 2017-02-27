

Add below code to themes/yourtheme/template.php 

```
/**
 * Override the theme registry.
 */
function icugi_theme_registry_alter(&$theme_registry) {

  $theme_registry['tripal_feature_synteny'] = array(
    'variables' => array('node' => NULL),
    'template' => 'tripal_feature_synteny',  //template file name without .tpl.php
    'path' =>  drupal_get_path('theme', 'icugi') . '/templates', // the path of tpl file
    'theme path' => '',
    'type' => 'module',
    'preprocess functions' => array(),
    'process function' => '',
  );
}


/**
 * Adds custom templates to a node
 */
function icugi_node_view_alter(&$build) {

  if ($build['#bundle'] == 'chado_feature') {
    //only show our template on full page views
    if ($build['#view_mode'] != 'full' OR array_key_exists('tripal_feature_synteny', $build) ) {
      return;
    }

    //add template to build
    $build['tripal_feature_synteny'] = array(
      '#theme' => 'tripal_feature_synteny',
      '#node' => $build['#node'],
      '#tripal_toc_id' => 'gene_synteny',
      '#tripal_toc_title' => 'Synteny',
    );
  }
}

/**
 *
 */
function icugi_module_implements_alter(&$implementations, $hook) {
  if ($hook == "node_view_alter") {
    $implementations = array('icugi' => FALSE) + $implementations;
  }
}

```
copy tripal_feature_synteny.tpl.php to themes/yourtheme/templates/


