#!/usr/bin/env bash

root=`dirname $BASH_SOURCE`/..
for i in $root/audio/*
do
  if test -f $i
  then
    ffmpeg -n -i $i $root/public/audio/`echo ${i%.*}`.mp3
  fi
done
