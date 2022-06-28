git pull
pip3 install -r requirements.txt
cd frontend
npm install
npm run build
. prepare_files.sh
cd ../backend
python3 manage.py migrate
python3 manage.py collectstatic --noinput
cd ..