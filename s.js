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

var players = [];
var s = [];
var list = [];
var videos = [];

var io = require('socket.io')(server);
io.set('log level', 1);
io.sockets.on('connection', function(socket){
    socket.on('say to one',function(data){
        try
        {
            o.log(players[socket.id].name + ' to ' + players[data.tid].name + ' : ' + data.msg);
            data.timer = (new Date()).getTime();
            var d = data;
            d.socketid = players[socket.id].name;
            d.avatar = players[socket.id].avatar;
            socket.emit('say to me', d);
            var d = data;
            d.id = players[data.tid].name;
            d.lid = players[socket.id].name;
            d.socketid = socket.id;
            d.avatar = players[socket.id].avatar;
            s[data.tid].emit('say to one', d);
        }catch(e){o.log(e.stack);}
    });
    socket.on('say to everyone',function(data){
        try
        {
            o.log(socket.user.name + ' say: ' + data.msg);
            socket.broadcast.to(socket.user.room).emit('say to everyone', data);

        }catch(e){o.log(e.stack);}
    });

    socket.on('sendboss', function(data){
        try
        {

            o.log('主播进入，开始直播！');
            socket.broadcast.emit('getboss', data);
            o.log(data);

        }catch(e){o.log(e.stack);}
    });

    socket.on('system', function(data){
        try
        {
            o.log('[system]: ' + data.msg);
            if(data.all) {
                io.emit('system', data);
            }else{
                io.to(socket.user.room).emit('system', data);
            }


        }catch(e){o.log(e.stack);}
    });
    socket.on('user connect', function(user) {
        try
        {
            socket.join(user.room);
            o.log('正在发送用户列表给新用户...');
            socket.emit('get users', list);
            o.log('用户列表发送完成!');
            players[socket.id] = user;
            s[socket.id] = socket;
            //socket.emit('login', socket.id);
            socket.user = user;
            user.id = socket.id;
            list.push(user);

            socket.broadcast.emit('new user connect', user);
            o.log('用户 ' + socket.user.name + ' 登录了！当前在线人数：' + String(list.length));
        }catch(e){o.log(e.stack);}
    });
    socket.on('disconnect', function(){
        try
        {

            console.log(socket);
            var msg = '用户 ' + socket.user.name + ' 退出了! 当前在线人数：';
            socket.broadcast.emit('user disconnect', socket.user);
            players.splice(socket.id, 1);
            s.splice(socket.id, 1);
            for(var i=0; i < list.length; i++) {
                if(list[i].id == socket.id) {
                    list.splice(i, 1);
                }
            }
            o.log(msg + String(list.length));


        }catch(e){o.log(e.stack);}
    });
});

var webRTC = require('webrtc.io').listen(8001);

o.log('服务器已经启动，开始监听8000端口!');
o.log('视频服务器已经启动，开始监听8001端口!');

