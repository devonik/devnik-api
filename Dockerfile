FROM node:20-alpine3.21

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
COPY . /app
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 8080

CMD ["npm", "start"]