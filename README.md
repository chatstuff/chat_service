### Setting up

- Install npm and nodejs (available on brew, apt-get etc)
- Run server using `NODE_ENV=development npm start`
- Might want to use `DEBUG=socket.io:* NODE_ENV=development npm start` to print debug logs

### Configuring nginx for load balancing
- Install nginx
- Add ```127.0.0.1 chat_service``` in `/etc/hosts`
- Add this to `nginx.conf` `http` area, assuming that servers are running on local machine on ports `3705`, `3706` and `3707`
```
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}
upstream websocket {
  ip_hash;
  server chat_service:3705;
  server chat_service:3706;
  server chat_service:3707;
}
server {
  listen 8080;
  location / {
    proxy_pass http://websocket;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```
- ```sudo nginx -s reopen``` or ```sudo nginx -s reload``` or ```sudo nginx``` (etc) whichever applicable
- Connect client on `ws://chat_service:8080`
- `ip_hash` is for sticky sessions