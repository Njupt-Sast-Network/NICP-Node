FROM node:latest
MAINTAINER Wxy



# Install app dependencies
RUN apt-get update && apt-get install -y python3-pip pdftk \
    && mkdir -p /usr/src/app && npm install pm2 -g

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

RUN useradd -ms /bin/bash nicp_node \
    && chown nicp_node:nicp_node -R /usr/src/app \
    && pip3 install -r requirement.txt

USER nicp_node

RUN npm install
RUN node db_init.js

EXPOSE 3000
CMD [ "pm2-docker", "start" , "index.js" ]