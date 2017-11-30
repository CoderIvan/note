# Docker

## Table of Contents
- [Docker 安装](#Docker的安装)
- [自动化创建镜像](#自动化创建镜像)
- [镜像的使用与运行](#镜像的使用与运行)
- [写在最后](#写在最后)

## Docker的安装
需要注意安装Docker的主机系统要为**64位且允许创建docker0虚拟网桥**。

安装成功后，可以运行以下语句检查是否安装成功:
```Bash
sudo docker -v
```
运行以下语句，检查Docker是否正常运行:
```Bash
sudo service docker status
```
> [Ubuntu安装可参考这里](https://docs.docker.com/installation/ubuntulinux/)

## 自动化创建镜像
利用DockerHub与GitHub进行镜像的自动化创建，需要在Github下创建DockerFile文件，并在DockerHub指定DockerFile文件的位置（默认为根目录"/"）。

DockerHub可以根据同一份GitHub上的代码构建不同的Tag（依据不同的分支，不同的DockerFile文件）。对于brickyard项目，一个镜像可以创建qiji-admin, qiji-portal, qiji-gateway等不同的Tag，方便部署与运行。

创建DockerFile的时候，**需要注意依赖的安装要自动化，尽量避免人工干扰**，以下为DockerFile的例子:
```Bash
FROM node:0.12.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install  && \
    npm install gulp -g && \
    npm install bower -g && \
    bower install --allow-root
```
> [DockerHub官网](https://hub.docker.com/)
> [自动化创建镜像](http://docs.docker.com/docker-hub/builds/)

## 镜像的使用与运行
#### 拉取镜像
通过 `docker pull REPOSITORY:TAG` 指定拉取哪个镜像的哪个Tag，不指定Tag时为latest，例如：
```Bash
docker pull z43811702/brickyard:latest
```
#### 启动容器
可以使用`sudo docker run`并指定参数启动单个容器，也可以通过Docker-Compose组件启动多个容器, 创建docker-compose.xml文件并在该文件目录下执行`sudo docker-compose up`启动多个容器, 以下为docker-compose.xml的例子：
```xml
portal:
    image: z43811702/brickyard:latest
    volumes:
        - /home/DBJTECH/huangxuehua/docker/qiji/portal/log:/var/log
    command: /bin/bash -c "gulp -p 80 --project qiji-portal >>/var/log/access.log 2>>/var/log/error.log"
    ports:
        - "80"
    restart: always

admin:
    image: z43811702/brickyard:latest
    volumes:
        - /home/DBJTECH/huangxuehua/docker/qiji/admin/log:/var/log
        - /home/DBJTECH/huangxuehua/docker/qiji/admin/upload:/home/vhost/brickyard-upload
    command: /bin/bash -c "gulp -p 80 --project qiji-admin >>/var/log/access.log 2>>/var/log/error.log"
    ports:
        - "80"
    restart: always

gateway:
    image: z43811702/brickyard:latest
    volumes:
        - /home/DBJTECH/huangxuehua/docker/qiji/gateway/log:/var/log
    command: /bin/bash -c "gulp start_gateway -g 80 --project gateway >>/var/log/access.log 2>>/var/log/error.log"
    ports:
        - "80/udp"
    restart: always
```
* 参数valumes指定容器挂载主机的目录，上面挂载的目的是：
 * 将每个项目容器内的日志文件输出供Bigborther直接访问；
 * Admin项目提供upload目录挂载，避免容器的关闭导致上传的文件掉失。
* 参数restart: always，保证容器内应用异常退出时，能重新启动 。
* 参数ports，暴露容器内的端口，供外部主机映射
* 参数command，表示容器要执行的命令，这里启动项目的同时，将标准输出流与标准错误流重定向的指定的目录

#### 其它常用命令
* `sudo docker images` 查看已下载的镜像
* `sudo docker logs #container_id` 查看指定容器的输出
* `sudo docker ps -a` 查看所有容器（包括已退出的容器）
* `sudo docker stats [#container_id]` 查看指定容器的运行情况（CPU占用，内存占用等）

## 写在最后
#### 关于Docker容器的日志
一般情况下，Docker会将容器的输出流保存至`/var/lib/docker/containers/<id>`目录下，每条记录的格式为：
```
{"log":"root@c835298de6dd:/# ls\r\n","stream":"stdout","time":"2014-03-14T22:15:15.155863426Z"}
```
而这个目录也是`sudo docker logs #container_id`的数据源。如果不做任何处理，将导致日志无限增长。这里有几个关注点:
* 每次重启或创建容器，`/var/lib/docker/containers/<id>`目录下的日志都会一并清除
* 每次重启或创建容器，容器的ID都是不固定，也就是日志的存放路径是不一致的。
* 如果创建容器时，将输出流重定向至文件，并挂载至主机目录下做管理，可以避免日志存放至`/var/lib/docker/containers/<id>`目录下，但会造成`sudo docker logs #container_id`命令无效

#### 关于项目的Docker化
* 对于brickyard项目，可以都考虑将portal与admin静态部份的部署交给Docker来做，加快容器的启动速度。
* 可以考虑将项目的配置文件挂载至主机目录，根据不同的环境（生产、测试、本地）与不同的项目，进行挂载运行
* 在某些场合下，可能需要对现网已运行的容器进行代码修改。可以考虑以下方法：
 * 根据原有镜像创建临时镜像。通过`sudo docker run -it z43811702:brickyard /bin/bash`启动容器，进入容器内修改需要的文件并退出，执行`sudo docker commit -m "fix bug" -a "Ivan" #container_id z43811702/sinatra:beta`，将该容器内的修改提供至镜像，最后通过新的镜像启动容器。
 * 进入容器内部修改文件并重启容器。通过`sudo docker exec -it #container_id /bin/bash`进入容器内修改需要的文件并退出，执行`sudo docker restart #container_id`重启容器
