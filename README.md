#创新杯管理系统 

[![Build Status](https://semaphoreci.com/api/v1/sast/nicp-node/branches/master/badge.svg)](https://semaphoreci.com/sast/nicp-node)

施工中

后端 node+koa+koa-router+sequelize+koa-view
前端 adminLTE

感谢 jetbrains 的 Webstorm
以及 semaphoreci 的 CI（虽然我还没来得及写测试）


## how to deploy

### start nicp
```
sudo docker run --name nicp_2019 -e TZ="Asia/Shanghai" -e NICP_UPLOAD_PATH=/var/upload/  -v /var/nicp/upload2019:/var/upload --link nicp_pg:pg -p 3335:3000 -d wxy/nicp:2019
```
if ddl have gone, function over 'team' should be disabled:
```
# start nicp without 'team' module to be functional
sudo docker run --name nicp_2019 -e TZ="Asia/Shanghai" -e NICP_UPLOAD_PATH=/var/upload/ -e NICP_DISABLE_TEAM=1 -e NICP_DB_NAME=nicp -e NICP_DB_USER=nicp -e NICP_DB_PASSWORD=nicp -v /var/nicp/upload2019:/var/upload --link nicp_pg:pg -p 3335:3000 -d wxy/nicp:2019
```

### log into sql of nicp 
sudo docker exec -it $docker_of_sql psql --user $username

### into nicp 
sudo docker exec -it $nicp_name /bin/bash

### file cat

recommend build path: /opt/

recommend that file uploaded or generated be stored in /var/nicp/... 
