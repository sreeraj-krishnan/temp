#!/usr/bin/sh
set +x

END=51
i=1
for i in `seq 0 50`
do
	beg=$(expr $i \* 1000)
	end=$(expr $beg + 1000)
	
	python python-test.py "$beg" "$end" &
done
echo "done"
