#!/usr/bin/perl

use strict;
use warnings;
use IO::File;
use FindBin;
use Getopt::Std;

my $debug = 1;
my $version = 0.1;

my %options;
getopts('a:b:c:d:e:f:g:i:j:k:l:m:n:o:p:q:r:s:t:u:v:w:x:y:z:h', \%options);

unless (defined $options{'t'} ) { usage($version); }

if		($options{'t'} eq 'mcscanx_blast')	{ mcscanx_blast(\%options, \@ARGV); }
elsif	($options{'t'} eq 'mcscanx_gff')	{ mcscanx_gff(\%options, \@ARGV); }
elsif	($options{'t'} eq 'mcscanx')		{ mcscanx(\%options, \@ARGV); }
elsif	($options{'t'} eq 'mcscanx_block')	{ mcscanx_block(\%options, \@ARGV); }
elsif	($options{'t'} eq 'mcscanx_tripal')	{ mcscanx_tripal(\%options, \@ARGV); }
elsif	($options{'t'} eq 'mcscanx_1to1')	{ mcscanx_1to1(\%options, \@ARGV); }
elsif	($options{'t'} eq 'last_pip')		{ last_pip(\%options, \@ARGV); }
else	{ usage($version); }

#===================
# kentnf: subroutine
#===================

=head2
 msccanx_1to1
=cut
sub mcscanx_1to1
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE: $0 -t msccanx_1to1 [options] input.collinearity > output

	-g	org num[1 or 2, default:1]

';
	print $usage and exit unless defined $$files[0];
	
	my $org_num = 1;
	$org_num = $$options{'g'} if (defined $$options{'g'} && $$options{'g'} == 2);

	my %id;
	my @p;

	my %hid; # key: gene id; value array of hits -- hash for choose 1to1 pair
	my %sid; # key: gene id; value 1 -- select id base on org_num

	my $fh = IO::File->new($$files[0]) || die $!;
	while(<$fh>) {
		chomp;
		next if $_ =~ m/^#/;
		my @a = split(/\t/, $_);
		# save collinearity to hash hid for choosing 1to1 pair 
		my ($id1, $id2, $e) = ($a[1], $a[2], $a[3]);
		push(@{$hid{$id1}}, [$id2, $e]);
		push(@{$hid{$id2}}, [$id1, $e]);

		# save id to sid hash base on org_num
		if ($org_num == 1) {
			$sid{$id1} = 1;
		} else {
			$sid{$id2} = 1;
		}

		# old script
		if (defined $id{$id1}) {
			$id{$id1}++;
		} else {
			$id{$id1} = 1;
		}

		if (defined $id{$id2}) {
			$id{$id2}++;
		} else {
			$id{$id2} = 1;
		}
		push(@p, [$id1, $id2]);
		#print join(";", @a); exit; 
	}
	$fh->close;	

	# find the best hit and save it to hash
	my %best_id; # key: gid; value: gid, evalue
	foreach my $id (sort keys %hid) {
		my @m = @{$hid{$id}};
		my $best_g = $m[0]->[0];
		my $best_e = $m[0]->[1];
		if (scalar @m == 1) {
			$best_id{$id}{'pid'} = $best_g;
			$best_id{$id}{'evalue'} = $best_e;
			next;
		}

		shift @m;
		foreach my $m (@m) {
			if ($m->[1] < $best_e) {
				$best_g = $m->[0];
				$best_e = $m->[1];
			}
		}
	
		$best_id{$id}{'pid'} = $best_g;
		$best_id{$id}{'evalue'} = $best_e;	
	}	

	# generate pair using BRH method
	my %uniq_pair;

	foreach my $id (sort keys %best_id) {

		my $id1 = $id;
		my $id2 = $best_id{$id}{'pid'};

		if (defined $best_id{$id2} && $best_id{$id2}{'pid'} eq $id1) {
			unless (defined $uniq_pair{$id."#".$best_id{$id}{'pid'}}) {
				$uniq_pair{$id."#".$best_id{$id}{'pid'}} = 1;
				$uniq_pair{$best_id{$id}{'pid'}."#".$id} = 1;
				print $id."\t".$best_id{$id}{'pid'}."\n";
			}
		} 
	}
 
	#foreach my $p (@p) {
	#	my $n = $id{$p->[0]} + $id{$p->[1]};
	#	print "$p->[0]\t$p->[1]\t$n\n";
	#}
}

=head2
 lastpip: last pipeline to compare two genomes
=cut
sub last_pip
{
	my ($options, $files) = @_;
	my $usage = qq'';

}

=head2
 mcscanx_tripal: generate table for loading mcscan result to tripal
=cut
sub mcscanx_tripal
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE $0 -t mcscanx_tripal -a wm -b cu -c 1 -d 2 cu_wm.chr cu_wm.gff cu_wm.collinearity cu_wm.block > cu_wm.block.tripal.txt

	-a 	short name of org1 (required) (only alphabet, less than 4 char)
	-b	short name of org2 (required) (only alphabet, less than 4 char)
	-c	org1 id in chado database (required)
	-d	org2 id in chado database (required)
		(if org1 and org2 same, just use same name for -a -b, and same id for -c and -d)
		(the org1 is left in MCScanX, org2 is righ in MCScanX)

	nameing:
		Block ID: org1org2BNNNN
		Synteny Region in org1: org1org2LNNNN
		Synteny Region in org2: org1org2RNNNN
			org1 and org2 are short name
			NNNN is block number
	!!!this program will use a lot of memory!!!	

';
	print $usage and exit unless scalar @ARGV == 4;
	my ($chr_file, $gff_file, $col_file, $block_file) = @ARGV;
	foreach my $f (@ARGV) {
		print "[ERR]file $f is no content\n" unless -s $f;
	}

	my ($org1_sn, $org2_sn, $org1_id, $org2_id);
	defined $$options{'a'} and $org1_sn = $$options{'a'} or die "[ERR] -a org1_name\n$usage";
	defined $$options{'b'} and $org2_sn = $$options{'b'} or die "[ERR] -b org2_name\n$usage";
	defined $$options{'c'} and $org1_id = $$options{'c'} or die "[ERR] -c org1_id\n$usage";
	defined $$options{'d'} and $org2_id = $$options{'d'} or die "[ERR] -d org2_id\n$usage";

	if ($org1_sn =~ m/[a-z]/i && length($org1_sn) < 5) {} else { die "[ERR] -a org1_name\n$usage"; }
	if ($org2_sn =~ m/[a-z]/i && length($org2_sn) < 5) {} else { die "[ERR] -a org2_name\n$usage"; }

	# output organism info
	print "##org1\t$org1_id\t$org1_sn\n##org2\t$org2_id\t$org2_sn\n";

	# load chr to hash 
	my %chr_hash;
	my $f1 = IO::File->new($chr_file) || die $!;
	while(<$f1>) {
		chomp;
		my @a = split(/\t/, $_);
		# old id (chr + num), new id (org + num)
		my $o = $a[1]; $o =~ s/\d+$//;
		if ( $o eq $org1_sn || $o eq $org2_sn ) {
			$chr_hash{$o."#".$a[0]} = $a[1];
		} else {
			die "[ERR]$_\n";
		}
	}
	$f1->close;

	# load gene gff to hash, will use a lot of memory
	# key: chr#pos
	# value: gene
	my %pos_gene;
	my $f2 = IO::File->new($gff_file) || die $!;	
	while(<$f2>) {
		chomp;
		my @a = split(/\t/, $_);
		# chr gene_id start end
		#  -- the chr in here is new id
		die "[ERR]col num\n" unless scalar @a == 4;
		for (my $i=$a[2];$i<=$a[3]; $i++) {
			$pos_gene{$a[0]."\t".$i} = $a[1];
		}
	}
	$f2->close;

	# load block gene pairs to hash
	# key: block_id
	# value: array of pairs
	my $blk_id;
	my %blk_syn;
	my $f3 = IO::File->new($col_file) || die $!;
	while(<$f3>) {
		chomp;
		if ($_ =~ m/##\s+Alignment\s+(\d+):/) {
			$blk_id = $1;
		} elsif ($_ =~ m/^#/) {
			next;
		} else {
			my @a = split(/\t/, $_);
			my ($gid1, $gid2, $value) = ($a[1], $a[2], $a[3]);
			push(@{$blk_syn{$blk_id}}, [$gid1, $gid2, $value]);
		}
	}
	$f3->close;

	# load block info 
	# key1 : block id (num)
	# key2 : col name
	# value: value in each col
	my %blk;
	my $blk_n = 0;
    # no title, the col is: 
    #  $block_num, $strand, $ref1, $start1, $end1, $strand1, $ref2, $start2, $end2, $strand2, $blk_score, $blk_evalue
    my $fh = IO::File->new($block_file) || die $!;
    while(<$fh>) {
        chomp;
        my @a = split(/\t/, $_);
        die "[ERR]col num $_\n" unless (scalar(@a) == 12);
        $blk{$a[0]}{'strand'}   = $a[1];
        $blk{$a[0]}{'ref1'}     = $a[2];
        $blk{$a[0]}{'start1'}   = $a[3];
        $blk{$a[0]}{'end1'}     = $a[4];
        $blk{$a[0]}{'strand1'}  = $a[5];
        $blk{$a[0]}{'ref2'}     = $a[6];
        $blk{$a[0]}{'start2'}   = $a[7];
        $blk{$a[0]}{'end2'}     = $a[8];
        $blk{$a[0]}{'strand2'}  = $a[9];
        $blk{$a[0]}{'score'}    = $a[10];
        $blk{$a[0]}{'evalue'}   = $a[11];
        $blk{$a[0]}{'line'}     = join("\t", @a[10,11]);
		$blk_n++;
    }
    $fh->close;

	# search block info to find pairs of block	
	foreach my $bid (sort {$a<=>$b} keys %blk) {

		# new bid
		my $full_num = addzero($bid, length($blk_n));
		my $nbid = $org1_sn.$org2_sn."B".$full_num;
		my $left = $org1_sn.$org2_sn."L".$full_num;
		my $right= $org1_sn.$org2_sn."R".$full_num;
		my $line = $blk{$bid}{'line'};
	
		# process ref1
		my @g1; my %uniq1;
		my ($ref1, $start1, $end1) = ($blk{$bid}{'ref1'}, $blk{$bid}{'start1'}, $blk{$bid}{'end1'});		
		die "[ERR]undef ref1 chr $org1_sn $ref1\n" unless defined $chr_hash{$org1_sn."#".$ref1};
		$ref1 = $chr_hash{$org1_sn."#".$ref1}; # replace ref1 with correct id
		for(my $i=$start1; $i<=$end1; $i++) {
			next unless defined $pos_gene{$ref1."\t".$i};
			my $gid = $pos_gene{$ref1."\t".$i};
			if (defined $uniq1{$gid}) {
				next;
			} else {
				$uniq1{$gid} = 1;
				push(@g1, $gid); # array to store the gene memember with order on chr
			}
		}

		# process ref2 	
		my @g2; my %uniq2;
		my ($ref2, $start2, $end2) = ($blk{$bid}{'ref2'}, $blk{$bid}{'start2'}, $blk{$bid}{'end2'});
		die "[ERR]undef ref2 chr $org2_sn $ref2\n" unless defined $chr_hash{$org2_sn."#".$ref2};
		$ref2 = $chr_hash{$org2_sn."#".$ref2}; # replace ref1 with correct id
		for(my $i=$start2; $i<=$end2; $i++) {
			next unless defined $pos_gene{$ref2."\t".$i};
			my $gid = $pos_gene{$ref2."\t".$i};
			if (defined $uniq2{$gid}) {
				next;
			} else {
				$uniq2{$gid} = 1;
				push(@g2, $gid); # array to store the gene memember with order on chr
			}	
		}

		@g2 = reverse @g2 if $blk{$bid}{'strand2'} eq '-';

		# generate syn hash for each block
		my @syn = @{$blk_syn{$bid}};
		my %syn;
		my %syn_value;
		foreach my $s (@syn) {
			$syn{$s->[0]} = $s->[1];
			$syn_value{$s->[0]."\t".$s->[1]} = $s->[2];
		}

		# generate paris of genes in block
		# key: order, 
		# value: pairs of gene / unpaired gene
		my %pairs;
		my $order = 0;
		# another hash rev
		# key: gid2 of pair
		# value: order
		my %rev;
		foreach my $g1 (@g1) {
			$order = $order+2;
			push(@{$pairs{$order}}, $g1);
			if (defined $syn{$g1}) {
				push(@{$pairs{$order}}, $syn{$g1});
				$rev{$syn{$g1}} = $order;
			}
		}

		my @tmp; # temp array to store the order

		foreach my $g2 (@g2) {
			if (defined $rev{$g2}) {
				my $oid = $rev{$g2};
				$oid = $oid-1;
				@{$pairs{$oid}} = @tmp;
				@tmp = (); # clear the array;
			} else {
				push(@tmp, $g2);
			}
		}

		# output block info
		print "#BK\t".$nbid."\t".$line."\n";
		print "#BL\t".$left."\t".$blk{$bid}{'ref1'}."\t".$start1."\t".$end1."\t".$blk{$bid}{'strand1'}."\n";
		print "#BR\t".$right."\t".$blk{$bid}{'ref2'}."\t".$start2."\t".$end2."\t".$blk{$bid}{'strand2'}."\n";

		# output result
		foreach my $oid (sort {$a<=>$b} keys %pairs) {
			my @g = @{$pairs{$oid}};
			if ($oid % 2 == 0) {
				if (scalar @g == 2) {
					my $value = $syn_value{$g[0]."\t".$g[1]};
					print "$bid\t$oid\t$g[0]\t$g[1]\t$value\n";	
				} elsif (scalar @g == 1) {
					print "$bid\t$oid\t$g[0]\tNA\tNA\n";
				} else {
					my $allgid = join("\t", @g);
					die "[ERR]$bid\t$oid\t$allgid\n";
				}
			} 
			else {
				foreach my $g (@g) {
					print "$bid\t$oid\tNA\t$g\tNA\n";
				}
			}
		}
	}
}

sub addzero
{
	my ($num, $len) = @_;
	my $zn = $len - length($num);
	my $z = '';
	for(1 .. $zn) { $z.="0"; }
	return $z.$num;
}

=head2
 mcscanx_block: convert mcscanx result to blocks 
=cut
sub mcscanx_block
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE $0 -t mcscan_block input.collinearity input.gff

	-c input.chr [provide this file for replacing reference name]

';
	print $usage and exit unless @$files == 2;
	my ($syn, $gff) = @$files;

	# load chr name to hash
	# key: new ref name; value: old ref name
	my %ref; 
	if (defined $$options{'c'}) {
		my $f1 = IO::File->new($$options{'c'}) || die $!;
		while(<$f1>) {
			chomp;
			next if $_ =~ m/^#/;
			my @a = split(/\t/, $_);
			die "[ERR]REF $_\n" unless @a == 2;
			$ref{$a[1]} = $a[0];
		}
		$f1->close;
	}

	# load GFF to hash
	# key1: gid; 
	# key2: start or end
	# value: start or end
	my %gene;
	my $f2 = IO::File->new($gff) || die $!;
	while(<$f2>) {
		chomp;
		next if $_ =~ m/^#/;
		my @a = split(/\t/, $_);
		# cu1     Csa1G000010     2952    4284	
		die "[ERR]GFF $_\n" unless @a == 4;
		my $ref_id = $a[0];
		$ref_id = $ref{$a[0]} if (defined $ref{$a[0]});
		$gene{$a[1]}{'ref'} = $ref_id;
		$gene{$a[1]}{'start'} = $a[2];
		$gene{$a[1]}{'end'} = $a[3];
	}
	$f2->close;

	# parse collinearity file to generate blocks 
	my ($block_num, $strand, $ref1, $start1, $end1, $strand1, $ref2, $start2, $end2, $strand2, $blk_score, $blk_evalue) = ('','','','','','','','','','', '', '');
	my @ss1 = (); my @ss2 = (); # use this array to determine strand1 and strand2
	my $f3 = IO::File->new($syn) || die $!;
	while(<$f3>) {
		chomp;
		if ($_ =~ m/##\s+Alignment\s+(\d+):\s+score=(\S+)\s+e_value=(\S+)\s+N=(\d+)\s+(\S+)\s+(\S+)/) {

			if (defined $block_num && $strand && $ref1 && $start1 && $end1 && 
				$ref2 && $start2 && $end2) 
			{
				$strand1 = determine_strand(@ss1);
				$strand2 = determine_strand(@ss2);

				my $score_evalue = '';
				$score_evalue.= "\t$blk_score" if (defined $blk_score && $blk_score);
				$score_evalue.= "\t$blk_evalue" if (defined $blk_evalue);
				print "$block_num\t$strand\t$ref1\t$start1\t$end1\t$strand1\t$ref2\t$start2\t$end2\t$strand2".$score_evalue."\n";
			}
				
			# clean the var
			($block_num, $strand, $ref1, $start1, $end1, $strand1, $ref2, $start2, $end2, $strand2) = 
				('','','','','','','','','','');
			@ss1 = ();
			@ss2 = ();

			$block_num = $1;
			$blk_score = $2;
			$blk_evalue = $3; 
			if ($_ =~ m/plus$/) {
				$strand = '+';
			} elsif ($_ =~ m/minus$/) {
				$strand = '-';
			} else {
				die "[ERR]strand $_\n";
			}
		}
		elsif ($_ =~ m/^#/) {
			next;
		}
		else {
			my @a = split(/\t/, $_);
			my ($gid1, $gid2) = ($a[1], $a[2]);
			die "[ERR]undef gid $gid1\n" unless (defined $gene{$gid1} || defined $gene{$gid2}); 

			$start1 = $gene{$gid1}{'start'} unless $start1;
			$end1   = $gene{$gid1}{'end'}   unless $end1;
			$start2 = $gene{$gid2}{'start'} unless $start2;
			$end2   = $gene{$gid2}{'end'}   unless $end2;

			$start1 = $gene{$gid1}{'start'} if $gene{$gid1}{'start'} < $start1;
			$end1   = $gene{$gid1}{'end'}   if $gene{$gid1}{'end'}   > $end1;
			$start2 = $gene{$gid2}{'start'} if $gene{$gid2}{'start'} < $start2;
			$end2   = $gene{$gid2}{'end'}   if $gene{$gid2}{'end'}   > $end2;
			
			$ref1 = $gene{$gid1}{'ref'} unless $ref1;
			$ref2 = $gene{$gid2}{'ref'} unless $ref2;

			push(@ss1, $gene{$gid1}{'start'});
			push(@ss2, $gene{$gid2}{'start'});
		}
	}	
	$f3->close;

	# for last record
	if (defined $block_num && $strand && $ref1 && $start1 && $end1 &&
		$ref2 && $start2 && $end2)
	{   
		$strand1 = determine_strand(@ss1);
		$strand2 = determine_strand(@ss2);

		my $score_evalue = '';
		$score_evalue.= "\t$blk_score" if (defined $blk_score && $blk_score);
		$score_evalue.= "\t$blk_evalue" if (defined $blk_evalue);
		print "$block_num\t$strand\t$ref1\t$start1\t$end1\t$strand1\t$ref2\t$start2\t$end2\t$strand2".$score_evalue."\n";
	}
}

sub determine_strand 
{
	my @num = @_;
	
	my %s; $s{'+'} = 0; $s{'-'} = 0;

	for(my $i=1; $i<@num; $i++) {		
		if (($num[$i] - $num[$i-1]) > 0) {
			$s{'+'}++;
		} else {
			$s{'-'}++;
		}	
	}

	if ($s{'+'} > 0 && $s{'-'} > 0) {
		if ($s{'+'} > $s{'-'}) {
			return "+";
		} else {
			return "-";
		}
	} elsif ($s{'+'} > 0) {
		return "+";
	} elsif ($s{'-'} > 0) {
		return "-";
	} else {
		return "NA";
	}
}

=head2
 mcscanx_blast: prepare blast result for mcscanx
=cut
sub mcscanx_blast
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE $0 -t mcscan_blast input_A input_B name_A name_B

* input_A and input_B are pep sequences
* name_A and name_B are output name
* must provide 4 input files even if A and B are same

';
	print $usage and exit unless (scalar(@$files) == 4);
	print "[ERR]input file not exist\n" unless (-s $$files[0] && -s $$files[1]);
	my ($input_A, $input_B, $name_A, $name_B) = @$files;
	my $output;
	if (($name_A eq $name_B) && ($input_A eq $input_B)) {
		$output = $name_A.".blast";
	} else {
		$output = $name_A."_".$name_B.".blast";
	}
	run_cmd("formatdb -i $input_B -p T");
	run_cmd("blastall -i $input_A -d $input_B -p blastp -e 1e-10 -b 5 -v 5 -a 24 -m 8 -o $output");
	exit;
}

=head2
 mcscanx_gff: convert annotation bed to gff
=cut
sub mcscanx_gff
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE $0 -t mcscan_gff gene_position.bed name

* gene_position.bed: used for RNASeq analysis
* name is prefix of output file

';
	print $usage and exit unless (scalar(@$files) == 2);
	print "[ERR]input file not exist\n" unless -s $$files[0];
	my ($bed_file, $name) = @$files;

	my ($name_chr, $name_gff) = ($name.".chr", $name.".gff");
	print "[ERR]output file exist" if (-s $name_chr || -s $name_gff);

	# convert bed to gff
	# input : Gm01    27642   27977   Glyma01g00210.1 234     -
	# output: Gm01    Glyma01g00210.1 27643   27977
	my $out1 = IO::File->new(">".$name_gff) || die $!;
	my $out2 = IO::File->new(">".$name_chr) || die $!;

	my %change_chr; # key: old_chr, value: new_chr
	my $chr_order = 0;

	my $fin = IO::File->new($bed_file) || die $!;
	while(<$fin>)
	{
		chomp;
		next if $_ =~ m/^#/;
		my @a = split(/\t/, $_);
		my $chr;
		if (defined $change_chr{$a[0]}) {
			$chr = $change_chr{$a[0]};
		} else {
			$chr_order++;
			$chr = $name.$chr_order;
			$change_chr{$a[0]} = $chr;
			print $out2 "$a[0]\t$chr\n"
		}
		print $out1 $chr,"\t",$a[3],"\t",$a[1]+1,"\t",$a[2],"\n";
	}
	$fin->close;
	$out1->close;
	$out2->close;	
}

=head2
 mcscanx: run mcscanx
=cut
sub mcscanx
{
	my ($options, $files) = @_;
	my $usage = qq'
USAGE: $0 name_A name_B

* must provide 4 input files even if A and B are same
';

	print $usage and exit unless (scalar(@$files) == 2);
	my ($name_A, $name_B) = @$files;

	my $input_prefix;
	if ($name_A eq $name_B) {
		$input_prefix = $name_A;
	} else {
		$input_prefix = $name_A."_".$name_B;
	}

	# check input files: .blast .gff
	print "[ERR]input files\n" and exit unless (-s $input_prefix.".blast");

	unless (-s $input_prefix.".gff") {
		my ($gff_A, $gff_B) = ($name_A.".gff", $name_B.".gff");
		print "[ERR]input files\n" and exit unless (-s $gff_A && -s $gff_B);
		system("cat $gff_A $gff_B > $input_prefix.gff")
	}

	# check program
	my $mcscanx_bin = $FindBin::RealBin."/bin/MCScanX/MCScanX";
	die "[ERR]no mcscanx bin\n" unless -s $mcscanx_bin;

	# run mcscanx
	run_cmd("$mcscanx_bin $input_prefix");
}

=head2
 run_cmd: run command
=cut
sub run_cmd
{
	my $cmd = shift;
	print $cmd."\n" and return(1) if $debug;
	system($cmd) && die "[ERR]cmd: $cmd\n";
}

=head2
 usage: print usage information and pipeline
=cut
sub usage
{
	my $version = shift;
	my $usage = qq'
USAGE: $0 -t ToolOption 
	
	mcscanx_blast	blast protein sequence
	mcscanx_gff		generate gff
	mcscanx
	mcscanx_block	generate blocks from collinearity 
	mcscanx_tripal	generate file for import to tripal
	mcscanx_1to1	find 1to1 pair 

* the mcscan program has already installed in ktools

example of pipeline:
	\$ perl syntenyTool.pl -t mcscanx_blast at_rep_pep CM_protein_v3.5_rep_pep.fasta
	\$ perl syntenyTool.pl -t mcscanx_blast sl_rep_pep CM_protein_v3.5_rep_pep.fasta

	\$ formatdb -i CM_protein_v3.5_rep_pep.fasta -p T
	\$ blastall -i sl_rep_pep -d CM_protein_v3.5_rep_pep.fasta -p blastp -e 1e-10 -b 5 -v 5 -a 24 -m 8 -o sl_cm.blast
	\$ blastall -i at_rep_pep -d CM_protein_v3.5_rep_pep.fasta -p blastp -e 1e-10 -b 5 -v 5 -a 24 -m 8 -o at_cm.blast

	\$ perl syntenyTool.pl -t mcscanx_gff arabidopsis_rep_gene.bed at
	\$ perl syntenyTool.pl -t mcscanx_gff melon_rep_gene.bed cm
	\$ perl syntenyTool.pl -t mcscanx_gff tomato_rep_ITAG2.3.bed sl

	\$ perl syntenyTool.pl -t mcscanx at cm
	\$ perl syntenyTool.pl -t mcscanx sl cm

	# generate plot for gene family : 
	/home/kentnf/pipeline/iTAK/synteny/plant_synteny.pl -i vv_bHLH \
		-a vv_gene_position -b vv.collinearity -c vv_chrSize \
		-x at_gene_position -y at_vv.collinearity -z at_chrSize
	will genrate two picture for result

	# how to combine two result into one ?
	
';

	print $usage;
	exit;
}





