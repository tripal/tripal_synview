
# Syntenic Viewer

## Download & Installation

Download syntenic viewer module from [github](https://github.com/tripal/tripal_synview)
```
cd /var/www/html/youSiteFolder/sites/all/modules/
git clone https://github.com/tripal/tripal_synview
```

Install syntenic viewer through "Administration of Modules" of Drupal. 

Or install syntenic viewer using command:
```
drush pm-enable tripal_synview
```

## Detection of synteny blocks and collinearity genes

Please follow the [documentation](http://chibba.pgml.uga.edu/mcscan2/) of MCScanX

## Load MCScanX results

### 1. convert MCScanX results

Imagine that we have two genomes (named aa and bb) that need to be analyzed. 
We already generated below files required by MCScanX in previous step:
```
aa_bb.gff
aa_bb.blast
```

And we also have the output of MCScanX which contains collinearity genes.
```
aa_bb.collinearity
```

For most genomes, the chromosome usually named as chr1, chr2, chr3 ... 
The aa and bb may have same name of chromosomes. So we need another file 
__aa_bb.chr__ which contains new and old names of chromosomes. Format of
__aa_bb.chr__:

```
chr1    aa1
chr2    aa2
...	    ...
chr1    bb1
chr2    bb2
...     ...
```

We could retirve the block information between aa and bb from the
list of collinearity genes
```
perl syntenyTool.pl -t mcscanx_block -c aa_bb.chr aa_bb.collinearity aa_bb.gff > aa_bb.block
```

Next, please find the **organism_id** for the genome aa and bb in chado
database. In this exmaple, the **organism_id** is 1 and 2 for genome aa
and bb, separately. We generate the file that could be load in to chado
using below command:
```
perl syntenyTool.pl -t mcscanx_tripal -a aa -b bb -c 1 -d 2 aa_bb.chr aa_bb.gff aa_bb.collinearity aa_bb.block > aa_bb.block.tripal.txt
```

### 2. Load list of collinearity genes

Login tripal with adaministrator, then:
> add content -> synteny file

Please input a human-readable name for synteny file, such as: 
> "synteny analysis for aa and bb".

Please select corresponding genomes for aa and bb.

Next, File name and location (Full Path) 
> home/web/synteny/aa_bb_block.tripal.txt

Finally, do not forget check option for "Insert/update synteny files to
chado database" and run tripal jobs to insert blocks and collinearity 
genes to datbase.


