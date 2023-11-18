echo [Running Server]
cd src\server\ocular
call ..\venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000