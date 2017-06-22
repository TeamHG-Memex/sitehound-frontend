#!/usr/bin/env bash

set -ev

cd ./models
wget https://s3-us-west-2.amazonaws.com/darpa-memex/thh/random-pages.jl.gz
wget https://s3-us-west-2.amazonaws.com/darpa-memex/thh/lda.pkl
cd ..
