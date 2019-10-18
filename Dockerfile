FROM node:lts-buster
MAINTAINER Wxy

# Change the repo registiry of debian and node & Install app dependencies
RUN mv /etc/apt/sources.list /etc/apt/sources.list.bak  \
        && echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main non-free contrib " > /etc/apt/sources.list \
        && echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main non-free contrib" >> /etc/apt/sources.list \
        && echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main non-free contrib" >> /etc/apt/sources.list \
        && echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security/ buster/updates main non-free contrib" >> /etc/apt/sources.list \
        && apt-get update && apt-get install -y python3-pip pdftk \
        && npm install cnpm -g --registry=https://registry.npm.taobao.org \
        && mkdir -p /usr/src/app && cnpm install pm2 -g

# Create app directory
WORKDIR /usr/src/app

# grab gosu for easy step-down from root
ENV GOSU_VERSION 1.10
RUN set -x \
        && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
        && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" \
        && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture).asc" \
        && export GNUPGHOME="$(mktemp -d)" \
        && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
        && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
        && rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc \
        && chmod +x /usr/local/bin/gosu \
        && gosu nobody true

# Bundle app source
COPY . /usr/src/app
COPY ./docker-entrypoint.sh /
ENV NICP_UPLOAD_PATH '/var/upload/'
RUN useradd -ms /bin/bash nicp_node \
    && chown nicp_node:nicp_node -R /usr/src/app \
    && pip3 install -r requirement.txt \
    && mkdir -p "$NICP_UPLOAD_PATH" \
    && chown -R nicp_node:nicp_node "$NICP_UPLOAD_PATH" \
    && chmod 777 "$NICP_UPLOAD_PATH" \
    && chmod +x "/docker-entrypoint.sh"

VOLUME '/var/upload/'

RUN cnpm install 



ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 3000
CMD [ "pm2-docker", "start" , "index.js" ]
