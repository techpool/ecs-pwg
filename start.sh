# start nginx
exec service nginx start &

# start node server
# exec pm2-runtime process.yml
exec node server.js
