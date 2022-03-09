git pull
cd frontend
npm run build
. prepare_files.sh
cd ../backend
python3 manage.py collectstatic --noinput
cd ..