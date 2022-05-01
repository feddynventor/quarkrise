FROM node

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

RUN mkdir uploads content shuffler
RUN wget https://upload.wikimedia.org/wikipedia/commons/0/0e/Barras_EBU.png -O /usr/app/uploads/first.png

COPY . ./

CMD [ "node", "index.js" ]
