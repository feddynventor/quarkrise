FROM node

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY * ./

RUN mkdir uploads content shuffler

CMD [ "node", "server.js" ]
