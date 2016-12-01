wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable && make install


redis-server.exe ./redis.conf
redis-server.exe ./redis-slave.conf

npm test
node driver.js &
echo "started server successfully @ http://localhost:8080"

