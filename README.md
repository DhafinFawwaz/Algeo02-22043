<h1 align="center">Tugas Besar Aljabar Linear dan Geometri 2</h1>

<h2 id="description">✨ Deskripsi</h2>
Tugas besar ini berisi pemanfaatan Aljabar Linear dan Geometri dalam Content-Based Image Retrieval untuk sistem temu balik gambar yang diimplementasikan dengan sebuah website.

<h2 id="table-of-contents">🔍 Daftar Isi</h2>

- <a href="#description">Deskripsi</a><br/>
- <a href="#table-of-contents">Daftar Isi</a><br/>
- <a href="#technologies">Teknologi yang Digunakan</a><br/>
- <a href="#features">Fitur</a><br/>
- <a href="#member">Anggota Kelompok</a><br/>
- <a href="#how-to-run">Cara Menggunakan Program</a><br/>
- <a href="#how-to-use">Cara Menggunakan Website</a><br/>
- <a href="#test-case">Test Case</a><br/>
- <a href="#reference">Referensi</a><br/>

<h2 id="technologies">🔧 Teknologi yang Digunakan</h2>

- Next.js
- Django
- GNU Compiler Collection

<h2 id="features">💫 Fitur</h2>

- Pencarian berdasarkan tekstur
- Pencarian berdasarkan color
- Upload dataset
- Web scrapping
- Camera otomatis setiap 5 detik

<h2 id="member">🌟 Anggota Kelompok</h2>

- 13522043 - Daniel Mulia Putra Manurung<br/>
- 13522107 - Rayendra Althaf Taraka Noor<br/>
- 13522084 - Dhafin Fawwaz Ikramullah<br/>

<h2 id="how-to-run">📘 Cara Menggunakan Program</h2>
Pastikan npm dan python sudah terinstall.
Install node dari https://nodejs.org/en. Install python dari https://www.python.org/downloads/

### Install Dependencies
Gunakan Command Prompt, jalankan command berikut untuk windows.
```bash
git clone https://github.com/DhafinFawwaz/Algeo02-22043.git
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
cd deactivate

```

### Run Backend
Untuk Command Prompt jalankan
```bash
runserver
```
Untuk Powershell jalankan
```bash
./runserver
```

### Run Frontend
Untuk Command Prompt jalankan
```bash
runclient
```
Untuk Powershell jalankan
```bash
./runclient
```

<h2 id="how-to-use">📙 Cara Menggunakan Website</h2>

####  Pencarian gambar relevan dengan upload gambar

- Pilih laman searching
- Upload sebuah gambar pada kolom yang disediakan
![select image](img/howtouse/select%20image.png)
- Bisa juga dengan drag & drop
![drag and drop image](img/howtouse/drag%20and%20drop%20image.png)

- Pilih parameter pencarian, misalnya "By Color"
- Tekan tombol "Search Image"
![select search](img/howtouse/search%20click.png)
- Akan muncul hasilnya dan bisa melihat gambar selanjutnya dengan pagination
![search by color](img/howtouse/search%20by%20color.png)

####  Upload dataset
- Pilih laman upload
- Upload folder berisi gambar pada kolom yang disediakan
![select folder](img/howtouse/select%20folder.png)

- Bisa juga dengan drag & drop beberapa gambar pada kolom tersebut
![select multiple image](img/howtouse/select%20multiple%20image.png)

Pilih opsi upload, misalnya overwrite, yaitu untuk menghapus dataset sebelumnya.
- Tekan tombol "Upload Dataset"
![upload dataset](img/howtouse/upload%20dataset.png)

- Tunggu hingga upload selesai.
![upload dataset](img/howtouse/Finished%20uploading%20dataset.png)

- Coba lagi dengan gambar pertama dan parameter "By Color". Maka hasil akan muncul dengan sangat cepat karena cache.
![search by color with cache](img/howtouse/search%20by%20color%20with%20cache.png)

- Coba dengan gambar lain dan parameter lain yaitu "By Texture".
![search by texture](img/howtouse/search%20by%20texture.png)

- Untuk tambahan, tekan "Download Search Result as PDF".
- Server akan memproses File PDF nya sebentar.
![processing pdf](img/howtouse/Processing%20PDF.png)

- Saat selesai akan diarahkan ke File PDF tersebut.
![hasil pdf](img/howtouse/Hasil%20PDF.png)

####  Pencarian gambar relevan dengan kamera
- Pilih laman searching
- Nyalakan toggle "Auto Capture"
![search auto capture by color](img/howtouse/search%20auto%20capture%20by%20color.png)

- Pilih allow untuk akses camera jika muncul prompt
- Gambar akan dimuat setiap 5 detik
####  Web Scrapping
- Pilih laman upload
- Masukkan alamat web pada kolom yang disediakan
- Tekan tombol "Start Scrapping"
![web scrap start scrapping](img/howtouse/web%20scrap%20start%20scrapping.png)

- Akan muncul hasil scrapping dan bisa melihat gambar selanjutnya dengan pagination
![web scrap result](img/howtouse/web%20scrap%20result.png)


<h2 id="test-case">📈 Test Case</h2>

| Hasil Tes                                                                   | Deskripsi                   |
| --------------------------------------------------------------------------  | ---------                   |
| ![search by color](img/testcase/search%20by%20color.png)                    | Search by color.     |
| ![search by texture](img/testcase/search%20by%20texture.png)                | Search by texture.   |
| ![search auto capture by color](img/testcase/search%20auto%20capture%20by%20color.png) | Search by color dengan auto capture.   |
| ![search by color with cache](img/testcase/search%20by%20color%20with%20cache.png) | Search by color gambar yang pernah disearch sebelumnya, sehingga akan menggunakan cache untuk mempersingkat waktu pencarian. |
| ![search by color 2](img/testcase/search%20by%20color%202.png) ![search by color 2 with cache](img/testcase/search%20by%20color%202%20wich%20cache%20last%20page.png) | Atas: Search by color. Bawah: Page akhir search by color kembali gambar yang sama, sehingga menggunakan cache. |
| ![search by texture 2](img/testcase/search%20by%20texture%202.png) ![search by texture 2 with cache](img/testcase/search%20by%20texture%202%20with%20cache%20last%20page.png) | Atas: Search by color. Bawah: Page akhir search by color kembali gambar yang sama, sehingga menggunakan cache. |
| ![web scrap result](img/howtouse/web%20scrap%20result.png) | Hasil dari web scrapping dari. url: https://www.endangeredwildlife.org/wildlife/mountain-chicken/  |
| ![search by texture 3 high contrast](img/testcase/search%20by%20texture%203%20high%20contrast.png) | Search by texture dengan gambar yang memiliki kontras tinggi (gambar yang dicari tidak terdapat dalam dataset). |
| ![search by color 3 high contrast](img/testcase/search%20by%20color%203%20high%20contrast.png) | Search by Color dengan gambar yang memiliki kontras tinggi (gambar yang dicari tidak terdapat dalam dataset). |
| ![search by texture 4](img/testcase/search%20by%20texture%204.png) | Search by texture gambar Althaf (gambar yang dicari tidak terdapat dalam dataset). |
| ![search by color 4](img/testcase/search%20by%20color%204.png) | Search by color gambar Althaf (gambar yang dicari tidak terdapat dalam dataset). |
| ![search by texture 5](img/testcase/search%20by%20texture%205.png) | Search by texture. |
| ![search by color 5](img/testcase/search%20by%20color%205.png) | Search by color. |
| ![search by texture 6](img/testcase/search%20by%20texture%206.png) | Search by texture. |
| ![search by color 6](img/testcase/search%20by%20color%206.png) | Search by color. |
| ![search by texture 7](img/testcase/search%20by%20texture%207.png) | Search by texture. |
| ![search by color 7](img/testcase/search%20by%20color%207.png) | Search by color. |
| ![search by texture 8](img/testcase/search%20by%20texture%208.png) | Search by texture. |
| ![search by color 8](img/testcase/search%20by%20color%208.png) | Search by color. |
| ![search by texture 9](img/testcase/search%20by%20texture%209%20full%20putih.jpg) | Search by color gambar dengan warna full putih.  Dataset dimodifikasi menjadi gambar dengan full hanya warna. |
| ![search by color 9](img/testcase/search%20by%20color%209%20full%20putih.jpg) | Search by texture gambar dengan warna full putih. Dataset dimodifikasi menjadi gambar dengan full hanya warna. |



<h2 id="reference">📑 Referensi</h2>

- Anthony. (2019, August 5). Stop Misusing Toggle Switches. UX Movement. Retrieved November 19, 2023, from https://uxmovement.com/mobile/stop-misusing-toggle-switches/

- Codecademy Team. (n.d.). What is a Database Index? Codecademy. Retrieved November 19, 2023, from https://www.codecademy.com/article/sql-indexes

- Content-based image retrieval. (n.d.). Wikipedia. Retrieved November 19, 2023, from https://en.wikipedia.org/wiki/Content-based_image_retrieval

- Content-based image retrieval using color and texture fused features. (2023, June 16). YouTube. Retrieved November 19, 2023, from https://www.sciencedirect.com/science/article/pii/S0895717710005352

- Grayscale. (n.d.). Wikipedia. Retrieved November 19, 2023, from https://en.wikipedia.org/wiki/Grayscale

- Web development. (n.d.). Wikipedia. Retrieved November 19, 2023, from https://en.wikipedia.org/wiki/Web_development
