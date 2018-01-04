# start nginx
echo "starting nginx server ..."
exec service nginx start &

# start node server
echo "starting node server ..."
exec npm run-script testelb
