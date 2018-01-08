# start nginx
exec service nginx start --with-threads &

# start node server
exec npm run-script server