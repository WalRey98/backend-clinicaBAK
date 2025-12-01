# Utilizar la imagen oficial de Node.js para construir la aplicación Angular
FROM node:18-bullseye AS build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY . .


# Instalar las dependencias de la aplicación
RUN npm install --force

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Compilar la aplicación Angular
RUN npm run build 

# Utilizar la imagen oficial de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copiar los archivos compilados de la etapa anterior al directorio de Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]