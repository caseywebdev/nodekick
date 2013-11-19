#!/usr/bin/env bash

root=`dirname $BASH_SOURCE`/..
for i in $root/audio/*
do
  if test -f $i
  then
    base=${i##*/}
    base=${base%.*}
    echo $base
    ffmpeg -n -i $i $root/public/audio/$base.mp3
  fi
done
