FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y \
    wget \
    vim \
    nano \
    openssh-client \
    coreutils && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["node", "index.js"]
