echo "Cambiamos a rama master"
git checkout master

echo "Armando app..."
npm run build

echo "Deployeando archivos al server..."
scp -i ./WebServer.pem -r dist/* ubuntu@15.229.26.148:/var/www/15.229.26.148/


echo "Listo!"