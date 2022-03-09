cd backend
npm run build
. prepare_files.sh
cd ../frontend
python3 manage.py collectstatic --noinput
cd ..