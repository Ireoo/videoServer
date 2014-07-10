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

var users = [],
	videos = [],
	rooms = [];
	

var io = require('socket.io')(server);
io.set('log level', 1);
io.sockets.on('connection', function(socket){
    socket.on('msg',function(data){
        try
        {
        
            o.log(users[socket.id].name + ' to ' + users[data.tid].name + ' : ' + data.msg);
            //data.timer = (new Date()).getTime();
            var d = data;
            d.socketid = users[socket.id].name;
            d.avatar = users[socket.id].avatar;
            socket.emit('message', d);
            var d = data;
            d.id = users[data.tid].name;
            d.lid = users[socket.id].name;
            d.socketid = socket.id;
            d.avatar = users[socket.id].avatar;
            s[data.tid].emit('messageTo', d);
            
        }catch(e){o.log(e.stack);}
    });
    socket.on('chatall',function(data){
        try
        {
        
            o.log(users[socket.id].name + ' say: ' + data.msg);
            //data.timer = (new Date()).getTime();

            socket.broadcast.emit('chatall', data);
            
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
            //data.timer = (new Date()).getTime();

            socket.broadcast.emit('system', data);
            
        }catch(e){o.log(e.stack);}
    });
    
    socket.on('login', function(user) {
        try
        {
        
            o.log('正在发送用户列表给新用户...');
            socket.emit('getplayers', rooms[user.room]);
            o.log('用户列表发送完成!');
            user.socket = socket;
            //o.log(user);
            rooms[user.room] = [];
            rooms[user.room][socket.id] = user;
            users[socket.id] = user;

            socket.emit('login', users[socket.id].socket.id);

            socket.broadcast.emit('loginIn', user);
            o.log('用户 ' + users[socket.id].name + ' 登录了!总人数: ' + String(users.length));
            
        }catch(e){o.log(e.stack);}
    });
    
    socket.on('disconnect', function(){
        try
        {
        
            var msg = '用户 ' + users[socket.id].name + ' 退出了! 当前在线人数：';
            socket.broadcast.emit('change', users[socket.id]);
            users[user.room].splice(socket.id, 1);
            
            o.log(msg + String(users.length));


        }catch(e){o.log(e.stack);}
    });
});

var webRTC = require('webrtc.io').listen(8001);

o.log('服务器已经启动，开始监听8000端口!');
o.log('视频服务器已经启动，开始监听8001端口!');

