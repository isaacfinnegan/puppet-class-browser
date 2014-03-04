#!/bin/bash
for FILE in modules/*/manifests/*.pp
do
    export FILE
    egrep "^(class)" $FILE | awk '{  print $2 "---" ENVIRON["FILE"]}' >> classes
done
