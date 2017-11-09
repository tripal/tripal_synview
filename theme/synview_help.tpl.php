<?php
/**
 * This template displays the help page for the go tool
 */
?>

<h3>Module Description</h3>
<p>This module provides a basic interface to allow your users to perform go enrichment analysis.</p>

<h3>Setup Instructions</h3>
<ol>
<li>Install NCBI BLAST+ on your server (Tested with 2.2.26+). There is a <a href="https://launchpad.net/ubuntu/+source/ncbi-blast+">package available for Ubuntu</a> to ease installation. Optionally you can set the path to your BLAST executable <a href="<?php print url('admin/tripal/extension/tripal_blast/blast_ui');?>">in the settings</a>.</li>
<li>Optionally, create Tripal External Database References to allow you to link the records in your BLAST database to further information. To do this simply go to <a href="<?php print url('admin/tripal/chado/tripal_db/add'); ?>" target="_blank">Tripal > Chado Modules > Databases > Add DB</a> and make sure to fill in the Database prefix which will be concatenated with the record IDs in your BLAST database to determine the link-out to additional information. Note that a regular expression can be used when creating the BLAST database to indicate what the ID is.</li>
<li><a href="<?php print url('node/add/blastdb');?>">Create "Blast Database" nodes</a> for each dataset you want to make available for your users to BLAST against. BLAST databases should first be created using the command-line <code>makeblastdb</code> program with the <code>-parse_seqids</code> flag.</li>
<li>It's recommended that you also install the <a href="http://drupal.org/project/tripal_daemon">Tripal Job Daemon</a> to manage BLAST jobs and ensure they are run soon after being submitted by the user. Without this additional module, administrators will have to execute the tripal jobs either manually or through use of cron jobs.</li>
</ol>

<h3>Highlighted Functionality</h3>
<ul>
  <li>Supports <a href="<?php print url('blast/nucleotide/nucleotide');?>">blastn</a>, 
    <a href="<?php print url('blast/nucleotide/protein');?>">blastx</a>, 
    <a href="<?php print url('blast/protein/protein');?>">blastp</a> and 
    <a href="<?php print url('blast/protein/nucleotide');?>">tblastx</a> with separate forms depending upon the database/query type.</li>
  <li>Simple interface allowing users to paste or upload a query sequence and then select from available databases. Additionally, a FASTA file can be uploaded for use as a database to BLAST against (this functionality can be disabled).</li>
  <li>Tabular Results listing with alignment information and multiple download formats (HTML, TSV, XML) available.</li>
  <li>Completely integrated with <a href="<?php print url('admin/tripal/tripal_jobs');?>">Tripal Jobs</a> providing administrators with a way to track BLAST jobs and ensuring long running BLASTs will not cause page time-outs</li>
  <li>BLAST databases are made available to the module by <a href="<?php print url('node/add/blastdb');?>">creating Drupal Pages</a> describing them. This allows administrators to <a href="<?php print url('admin/structure/types/manage/blastdb/fields');?>">use the Drupal Field API to add any information they want to these pages</a>.</li>
  <li>BLAST database records can be linked to an external source with more information (ie: NCBI) per BLAST database.</li>
</ul>
