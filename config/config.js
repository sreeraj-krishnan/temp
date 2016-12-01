var config = {};

config.redis = {};
config.web = {};
config.app = {}

config.redis.writeport = 6379;
config.redis.readport = 6399;
config.redis.host = '127.0.0.1'

config.web.port = 3000;
config.app.driverMaxid=50000
config.app.defaultRadius=500
config.app.defaultLimit=10

module.exports = config;