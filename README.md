#Instrucciones para poder hacer funcionar el proyecto:

#Se requiere instalar MySql Server anteriormente desde la pagina oficial.

#Para crear la Base de Datos:
Primero en una terminal con permisos de administrador teniendo ya instalado mysql se debe ingresar el comando "mysql -u root -p" y ingresar posteriormente los siguientes comandos:

CREATE USER cge_user WITH PASSWORD 'cge_pass';
CREATE DATABASE cge OWNER cge_user;
GRANT ALL PRIVILEGES ON DATABASE cge TO cge_user;



#Para levantar la API "FastAPI"  estando en Windows se debe realizar lo siguiente:
Se debe ingresar a la carpeta Backend, estando en la carpeta raiz es ingresar el comando: "cd .\backend\", luego se crea un entorno virtual teniendo instalado anteriormente python, con "python -m venv venv",
luego levantar el entorno con ".\venv\Scripts\Activate".
Al tener ya funcionando el entorno se debe crear un archivo para que el programa pydantic funcione, este se debe llamar: ".env" y su contenido debe ser: 
ENV=dev
APP_NAME=CGE Backend

# --- Base de datos (MySQL por PyMySQL) ---
DB_DIALECT=mysql+pymysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cge_user
DB_PASSWORD=cge_pass
DB_NAME=cge




#Se debe instalar todos los requerimientos para correr el proyecto, para esto:
Con el entorno activo descargamos todo directo de el archivo dentro de la carpeta backend: "pip install -r requirements.txt", támbien si es necesario revisar cada archivo por si falta alguna importación.

#Para levantar el Frontend:
En otra terminal aparte de la de la API debemos ingresar a la carpeta fronend, estando en la raiz del proyecto es "cd .\frontend\" y ingresamos "npm install", al finalizar la descarga podremos hacer que funcionen 
las paginas ingresando: "ng serve".




#Posibles problemas pueden ser por incorrecta seleccion del interprete de python, se requiere python 3.9 o superior como minimo.
