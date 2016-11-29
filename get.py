import os;
import sys;
import subprocess
import requests

latitude=70.01234343
longitude=70.12324343
#radius=1000
#limit=1

def main(a):
    global latitude
    global longitude;
    for i in range(0,1):
		limit = 1; #i % 100 + 1;
		radius = 1000 + i % 1000;
		latitude  += 0.001;
		longitude += 0.001;
		data=''
		#command = str('curl -X GET -H "Content-Type: application/json" "http://localhost:8081/drivers?latitude=') + str(latitude) + str('&longitude=') + str(longitude) + str('&radius=') + str(radius) + str('&limit=') + str(limit) + str('"') ;
		url = str('http://localhost:8081/drivers?latitude=') + str(latitude) + str('&longitude=') + str(longitude) + str('&radius=') + str(radius) + str('&limit=') + str(limit) ;
		res = requests.get(url)
		print str(res);
		for i in res:
			print i;
		#os.system( command );
		#proc = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True);
if __name__ == '__main__':
    #print len(sys.argv)
    if len(sys.argv) == 2:
        #print sys.argv[1]
        #print sys.argv[2]
        main(int(sys.argv[1]));


