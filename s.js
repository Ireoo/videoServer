/**
 *
 * Created with JetBrains WebStorm.
 * User: S2
 * Date: 13-9-10
 * UpdateDate: 14-7-13
 *
 */

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    o  = require('util'),
    server;

server = http.createServer(function(req, res){
    req.setEncoding(encoding="utf8");
    var path = url.parse(req.url).pathname;
    //o.log(path);

    //if(path == '/') path = '/index.html';

    fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        o.log('[' + __dirname + path + ']状态: ' + String(err));
        res.writeHead(200, {'Content-Type': 'text/javascript, charset=UTF-8'});
        //res.writeHead(200, {'Content-Type': path.substr(path.length - 2) == 'js' ? 'text/javascript, charset=UTF-8' : 'text/html, charset=UTF-8'});
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
var zhubo = [];

var io = require('socket.io')(server);
io.set('log level', 1);
io.on('connection', function(socket){

    //普通聊天
    socket.on('say to everyone',function(data){
        try
        {

            data.name = socket.user.name;
            data.avatar = socket.user.avatar;
            data.ip = socket.handshake.address.address;
            data.time = socket.handshake.time;
            socket.broadcast.to(socket.user.room).emit('say to everyone', data);
            o.log(socket.user.name + ' say: ' + data.msg);

        }catch(e){o.log(e.stack);}
    });

    //系统信息
    socket.on('system', function(data){
        try
        {
            o.log('[system]: ' + data.msg);
            if(data.all) {
                io.emit('system', data);
            }else{
                io.to(socket.user.room).emit('system', data.msg);
            }


        }catch(e){o.log(e.stack);}
    });

    //新用户登录
    socket.on('user connect', function(user) {
        try
        {

            socket.join(user.room);
            socket.emit('get users', users);
            o.log('用户列表发送完成!');
            socket.user = user;
            user.id = socket.id;
            users.push(user);
            if(user.zhubo == 1) {
                zhobo.push(user);
            }
            //console.log(io);
            socket.broadcast.emit('new user connect', user);
            o.log('用户 ' + socket.user.name + ' 登录了！当前在线人数：' + String(socket.conn.server.clientsCount) + ', 使用的浏览器为: ' + socket.handshake.headers['user-agent']);
            console.log(socket.user);

        }catch(e){o.log(e.stack);}
    });

    //用户离开
    socket.on('disconnect', function(){
        try
        {

            socket.broadcast.emit('user disconnect', socket.user);
            for(var i=0; i < users.length; i++) {
                if(users[i].id == socket.id) {
                    users.splice(i, 1);
                }
            }
            for(var i=0; i < zhubo.length; i++) {
                if(zhubo[i].id == socket.id) {
                    zhubo.splice(i, 1);
                }
            }
            o.log('用户 ' + socket.user.name + ' 退出了! 当前在线人数：' + String(socket.conn.server.clientsCount));

        }catch(e){o.log(e.stack);}
    });
});

//var webRTC = require('webrtc.io').listen(8001);

console.log('服务器已经启动，开始监听8000端口!');
//console.log('视频服务器已经启动，开始监听8001端口!');

