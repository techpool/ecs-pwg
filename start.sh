# start nginx
# exec service nginx start --with-threads &
exec service nginx start &

# start node server
exec npm run-script server