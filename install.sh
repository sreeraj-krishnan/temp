wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable && make install


redis-server.exe ./redis.conf
redis-server.exe ./redis-slave.conf


node driver.js &


