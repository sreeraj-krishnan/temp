import os;
import sys;

latitude=70.01234343
longitude=70.12324343


def main(a,b):
    global latitude
    global longitude;
    for i in range(a,b):
        latitude += 0.001
        longitude += 0.001
        accuracy = i % 100 + 1
    
        data = str(' { "latitude": ') + str(latitude) + str(' , "longitude" : ') + str(longitude) + str(' , "accuracy" : ' +  str(float(accuracy)/100) +str(' }'))
        
        #print data

        os.system(str('curl -X PUT -H "Content-Type: application/json"  http://localhost:8080/drivers/')+str(i) +str('/locations --data ') +str("'")+ data + str("'"));



if __name__ == '__main__':
    #print len(sys.argv)
    if len(sys.argv) == 3:
        #print sys.argv[1]
        #print sys.argv[2]
        main(int(sys.argv[1]),int(sys.argv[2]));


