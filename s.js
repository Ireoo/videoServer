/**
 *  * Created with JetBrains WebStorm.
 *   * User: ultra
 *    * Date: 13-9-10
 *     * Time: 下午8:40
 *      * To change this template use File | Settings | File Templates.
 *       */

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    o  = require('util'),
    server;

server = http.createServer(function(req, res){
    req.setEncoding(encoding="utf8");
    var path = url.parse(req.url).pathname;
    o.log(path);

    if(path == '/') path = '/index.html';

    fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path.substr(path.length - 2) == 'js' ? 'text/javascript, charset=UTF-8' : 'text/html, charset=UTF-8'});
        res.write(data, 'utf8');
        res.end();
    });
});

send404 = function(res){
    res.writeHead(404);
    res.write('404 Not Found');
    res.end();
};

server.listen(8000);

var users = [];

var io = require('socket.io')(server);
//io.set('log level', 1);
io.on('connection', function(socket){


    socket.on('say everyone with room', function(msg){
        try
        {
            o.log(socket.user.name + ' say: ' + msg);
            io.to(socket.user.room).emit('say everyone with room', msg);

        }catch(e){o.log(e.stack);}
    });

    socket.on('say everyone with system', function(msg){
        try
        {

            o.log(socket.user.name + ' say: ' + msg);
            io.emit('say everyone with room', msg);

        }catch(e){o.log(e.stack);}
    });
    socket.on('login', function(user) {
        try
        {

            socket.emit('get users', users);
            console.log('正在发送用户列表给新用户');
            socket.user = user;
            users.push(user);
            io.to(socket.user.room).emit('new user', user);
            o.log('用户 ' + socket.user.name + ' 登录了！当前在线人数：' + String(users.length));

        }catch(e){o.log(e.stack);}
    });
    socket.on('disconnect', function(){
        try
        {

            var user = ;
            socket.broadcast.emit('change', players[socket.id]);

            o.log('用户 ' + players[socket.id].name + ' 退出了! 当前在线人数：' + String(list.length));


        }catch(e){o.log(e.stack);}
    });
});

var webRTC = require('webrtc.io').listen(8001);

o.log('服务器已经启动，开始监听8000端口!');
o.log('视频服务器已经启动，开始监听8001端口!');

