#!/usr/bin/sh
set +x

END=51
i=1
for i in `seq 0 50`
do
	beg=$(expr $i \* 10)
	end=$(expr $beg + 10)
	echo $beg $end
	python python-test.py "$beg" "$end" &
done

##python python-test.py 5000 10000 & 
#python python-test.py 10000 15000 & 
#python python-test.py 15000 20000 & 
#python python-test.py 20000 25000 & 
#python python-test.py 25000 30000 & 
#python python-test.py 25000 30000 & 
