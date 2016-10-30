FROM node:boron
MAINTAINER Wxy

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY requirement.txt /usr/src/app/
RUN apt-get install python3-pip && pip3 install -r requirement.txt && npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]