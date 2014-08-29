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
var giftMember = 0;

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
            data.self = false;
            socket.broadcast.to(socket.user.room).emit('say to everyone', data);
            data.self = true;
            socket.emit('say to everyone', data);
            o.log(socket.user.name + ' say: ' + data.msg);

        }catch(e){o.log(e.stack);}
    });

    //系统信息
    socket.on('system', function(data){
        try
        {
            o.log('[system]: ' + data.msg);
            io.emit('system', data);
        }catch(e){o.log(e.stack);}
    });

    //礼物
    socket.on('gift', function(data){
        try
        {
            giftMember += parseInt(data.member);
            o.log(data.name + '送给' + data.room + '的主播 ' + data.member + ' 个 ' + data.gift + ' . 当前已经送出 ' + giftMember + ' 个礼物.');
            socket.broadcast.to(socket.user.room).emit('give gift', data);
            socket.emit('give gift', data);
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
            //console.log(socket);
            socket.broadcast.to(socket.user.room).emit('new user connect', user);
            o.log('用户 ' + socket.user.name + ' 进入编号 [' + socket.user.room + '] 的房间！当前在线人数：' + String(socket.conn.server.clientsCount));
            //console.log(socket.user);

        }catch(e){o.log(e.stack);}
    });

    //用户离开
    socket.on('disconnect', function(){
        try
        {

            socket.broadcast.to(socket.user.room).emit('user disconnect', socket.user);
            for(var i=0; i < users.length; i++) {
                if(users[i].id == socket.id) {
                    users.splice(i, 1);
                }
            }
            o.log('用户 ' + socket.user.name + ' 退出编号 [' + socket.user.room + '] 的房间! 当前在线人数：' + String(socket.conn.server.clientsCount));

        }catch(e){o.log(e.stack);}
    });
});

//var webRTC = require('webrtc.io').listen(8001);

console.log('服务器已经启动，开始监听8000端口!');
//console.log('视频服务器已经启动，开始监听8001端口!');

