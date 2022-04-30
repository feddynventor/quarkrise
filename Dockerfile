FROM node

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . ./

RUN mkdir uploads content shuffler
RUN wget https://upload.wikimedia.org/wikipedia/commons/0/0e/Barras_EBU.png -O /usr/app/uploads/first.png

CMD [ "node", "index.js" ]
