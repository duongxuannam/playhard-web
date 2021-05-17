echo "build server"
yarn build
cd frontend
echo "install node frontend"
yarn
echo "build frontend"
yarn build
echo "build finish"