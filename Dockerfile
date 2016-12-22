FROM ubuntu
RUN apt-get update && apt-get install -y npm
RUN npm i -g npm@latest
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir /wordbots
WORKDIR /wordbots
ADD package.json /wordbots/package.json
ADD src /wordbots/src
ADD styles /wordbots/styles
ADD webpack.config.js /wordbots/webpack.config.js
RUN npm install
EXPOSE 3000
