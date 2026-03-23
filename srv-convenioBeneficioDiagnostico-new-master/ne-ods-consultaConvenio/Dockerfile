# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Instala git y openssh en una sola capa
RUN apk add --no-cache git openssh

# Copia el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --production

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 3002

# Comando para ejecutar el archivo JavaScript
CMD ["npm", "run", "start"]

