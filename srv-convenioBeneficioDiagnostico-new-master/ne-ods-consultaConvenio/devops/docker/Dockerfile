# DEFINE BASE IMAGE
FROM #{var-dockerRegistry-servername}#/#{var-imageBaseRepository-name}#:#{var-buildTag-latest}#

# DEFINE APP MANTAINER
LABEL maintainer="DevSecOps-Pacifico-Salud"

# SET ENVIRONMENT VARIABLES
ENV PORT=#{var-app-port}#

# CREATE CONTAINER APP DIRECTORY
WORKDIR /APP

# Copiar package.json y package-lock.json primero para aprovechar cache
COPY package*.json ./

# COPY APP CODE
COPY . .

# EXPOSE PORT FROM APP
EXPOSE #{var-app-port}#

# APP EXECUTION
CMD ["npm", "run", "start"]
