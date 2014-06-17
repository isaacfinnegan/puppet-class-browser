#!/usr/bin/perl
use strict;
use JSON;
use File::Find;
@ARGV = ('.') unless @ARGV;

my $DEBUG=0;

my $classdata={};
my $curclass;

sub process_manifest {
    my $file=$File::Find::name;
    if($file =~ m/\.pp/)
    { 
        print "$File::Find::name\n" if $DEBUG;
        open(MANIFEST, "< $file") or die "couldn't open $file for read: $!";
        $curclass='';
        foreach my $line (<MANIFEST>)
        {
            if($line =~ /^\s*class\s+([a-zA-Z0-9:\-_]+)/)
            {
                $curclass=$1;
                $classdata->{$curclass}->{'source'}= $file;
                print "found class $curclass in $classdata->{$curclass}->{'source'}\n" if $DEBUG;
                
            }
            if($line =~ /^\s*include ([a-zA-Z0-9:\-_]+)/)
            {
                my $include=$1;
                $include =~s/^:://;
                print "found include $include in $curclass\n" if $DEBUG;
                push(@{$classdata->{$include}->{'refs'}},$curclass);
            }
        }
        close(MANIFEST);
    }
}

find({wanted => \&process_manifest, follow_fast => 1, no_chdir => 1}, @ARGV);

print to_json($classdata);