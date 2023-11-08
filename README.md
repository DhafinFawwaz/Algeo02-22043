<h1 align="center">Tugas Besar Aljabar Linear dan Geometri 2</h1>

<h2 id="description">✨ Deskripsi</h2>
Tugas besar ini berisi .

<h2 id="table-of-contents">🔍 Daftar Isi</h2>
- <a href="#description">Deskripsi</a><br/>
- <a href="#table-of-contents">Daftar Isi</a><br/>
- <a href="#member">Anggota Kelompok</a><br/>
- <a href="#how-to-run">Cara Menggunakan Program</a><br/>
- <a href="#reference">Referensi</a><br/>

<h2 id="member">🌟 Anggota Kelompok</h2>
- 13522043 - Daniel Mulia Putra Manurung<br/>
- 13522107 - Rayendra Althaf Taraka Noor<br/>
- 13522084 - Dhafin Fawwaz Ikramullah<br/>

<h2 id="how-to-run">📘 Cara Menggunakan Program</h2>
Pastikan npm dan python sudah terinstall.
Install node dari https://nodejs.org/en. Install python dari https://www.python.org/downloads/

### Install Dependencies
Gunakan Command Promt, jalankan command berikut.
```bash
cd src\client
npm install
cd ../../
pip install virtualenv
cd src\server\
python -m venv venv
venv\Scripts\activate
cd ocular
pip install -r requirements.txt
python manage.py migrate --run-syncdb
python manage.py makemigration
python manage.py migrate
cd ../../../
```

### Run Backend
```bash
runserver
```

### Run Frontend
```bash
runclient
```

<h2 id="reference">📑 Referensi</h2>
