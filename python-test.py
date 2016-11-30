import os;
import sys;
import time;

latitude =70.12343732
longitude=70.1237098


def main(a,b):
    global latitude
    global longitude;
    for i in range(a,b):
        latitude += 0.01 ;
        longitude += 0.01;
        accuracy = i % 100 + 1
        data = str(' { "latitude": ') + str(latitude) + str(' , "longitude" : ') + str(longitude) + str(' , "accuracy" : ' +  str(float(accuracy)/100) +str(' }'))
        os.system(str('curl -X PUT -H "Content-Type: application/json"  http://localhost:8080/drivers/')+str(i) +str('/locations --data ') +str("'")+ data + str("' &"));
        if i % 100 == 0:
            time.sleep(2)



if __name__ == '__main__':
    #print len(sys.argv)
    if len(sys.argv) == 3:
        #print sys.argv[1]
        #print sys.argv[2]
        main(int(sys.argv[1]),int(sys.argv[2]));


