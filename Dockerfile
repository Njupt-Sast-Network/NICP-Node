FROM node:boron
MAINTAINER Wxy

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install app dependencies
RUN apt-get update && apt-get install python3-pip && pip3 install -r requirement.txt && npm install

EXPOSE 3000
CMD [ "npm", "start" ]