#!/usr/bin/env bash

for i in audio/*
do
  if test -f $i
  then
    base=${i##*/}
    base=${base%.*}
    echo $base
    ffmpeg -n -i $i public/audio/$base.mp3
  fi
done
