
I have choosen Node.js as the technology stack because it is single threaded and is asynchronus. 
It can easily do a lot things with very  less number of lines of code.
Also I'm using redis as the cache in memory and to store the details. I'm using 2 instances of this one for write and one for read which would be the slave.

Currenty I'm using a hashmap of lontitude/latitude to store locations and retreive. I see average response time of about 50-150ms on cygwin. 
I have not load-tested due to time constraints.
This can be fine tuned if we know the max limit on the radius of search.Currently it looks upto ~ 20km
Also I'm very new to nodejs, so this may not be the best code structure at this point in time.

Requiremets to run the server:
1. Node js
2. redis 
3. using python to create test data, its a round about way but did not have much time on this.

As I don't have a personal Linux system, my development was done in windows through cygwin. If the script does not work then server has to be manually started.
please check install.sh , its very basic version.

