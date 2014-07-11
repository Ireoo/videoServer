/**
 * Created by Ultra on 14-7-9.
 */
$(function() {

    /**
     *
     * 调试代码
     *
     */
    localStorage.debug='*';

    /**
     * 连接服务器
     */
    var socket = io.connect("localhost:8000");
    var spantimer = [];


    socket.on('say to everyone', function(msg) {

        chatcom(msg.name, msg.avatar, msg.msg, msg.time, false);

    });

    socket.on('user disconnect', function(user) {

        $('div.list li#' + user.id).remove();
        console.log('div.list li#' + user.id);
        systemmsg('用户 ' + user.name + ' 离开聊天室.');

    });

    socket.on('new user connect', function(user) {

        addplayer(user.id, user.name, user.avatar);
        systemmsg('用户 ' + user.name + ' 进入聊天室.');

    });

    socket.on('get users', function(users) {

        addplayer('', name + '(自己)', avatar);
        for(var i = 0; i < users.length; i++) {
            addplayer(users[i].id, users[i].name, users[i].avatar);
        }
        systemmsg('获取用户列表完成.');

    });

    socket.on('system', function(msg) {

        systemmsg(msg);
        //alert(data);

    });

    /**
     * 登录服务器命令
     */
    socket.emit('user connect', {
        name : name,
        avatar : avatar,
        room : room
    });

    /**
     *
     * 创建聊天框
     *
     */

    //var chatbox = $('<div />').css({borderRadius: '5px', boxShadow: '0 0 5px #333', position: 'fixed', bottom: '20px', left: '20px', overflow: 'hidden'}).width($(window).width() - 40).height(50).appendTo('body');
    var chatinput = $('input#say');
    chatinput.keypress(function(e) {
        //alert(chatinput.val());
        if(e.keyCode == 13) {

            if(chatinput.val() != '') {

                var timer = (new Date()).getTime();
                socket.emit('say to everyone', {
                    msg   : chatinput.val()
                });
                chatcom(name, avatar, chatinput.val(), timer, true);
                chatinput.val('');

            }

            return false;
        }
    });

    /**
     *
     * 创建列表框
     * @type {appendTo|*|jQuery}
     */

    var listbox = $('div.list');

    var css = {listStyle: 'none', padding:'5px', display: 'inline-block'};

    var addplayer = function(socketid, player, avatar) {
        if(player == name) player += '(自己)';
        var one = $('<li />').css(css).attr('id', socketid).hover(
            function() {
                $(this).addClass('hover');
            },
            function() {
                $(this).removeClass('hover');
            }
        ).click(
            function(e) {
//                            var cunzai = false;
//                            $('ul.chatroom li').each(
//                                    function(e) {
//                                        if($(this).attr('id') == socketid) cunzai = true;
//                                    }
//                            );
//                            if(!cunzai) {
//                                addchat(socketid, player, avatar);
//                            }
            }
        );
        var img = $('<img />').attr('src', avatar).css({float: 'left'}).width(40).height(40);
        var name = $('<h2 />').text(player).css({margin: '0', padding: '0 0 0 50px', fontSize: '12px', fontWeight: 'bold'}).height(40);
//                message.append(input).append(to).append(by);
        one.append(img).appendTo(listbox); //.append(message); //.append(name)

    };

    /**
     *
     * 创建聊天框
     *
     */

    var chatroom = $('div.chat');

    var chatheight = 0;

    var chatcom = function(name, avatar, msg, timer, ziji) {
        var image = $('<img />').attr('src', avatar).attr('title', name).width(20).height(20).css({borderRadius: '3px', verticalAlign: 'bottom'});
        var a = $('<a />').attr('src', 'http://v.ireoo.com/').text(name);
        var com = $('<div />').css({background: '#EBEBEB', fontSize: '12px', borderRadius: '3px', padding: '5px', verticalAlign: 'bottom', display: 'inline-block', wordBreak: 'break-all', wordWrap: 'break-word'}).append(a).append(': ' + msg);
        if(!ziji) {
            var li = $('<li />').css({marginBottom: '10px'}).append(com).appendTo(chatroom); //.append(image)
            //alert('ziji');
        }else{
            com.css({background: '#4898F8', color: '#FFF'}); //, textAlign: 'left'
            var li = $('<li />').css({marginBottom: '10px'}).append(com).appendTo(chatroom); //.append(image) //, textAlign: 'right'
        }

        chatheight += li.height() + 10;
        chatroom.animate({scrollTop: chatheight}, 300);
    };

    var systemmsg = function(msg) {
        var com = $('<div />').css({display: 'inline-block', fontSize: '12px', color: '#CCC', margin: 'auto'}).text('[系统] ' + msg);

        var li = $('<li />').css({marginBottom: '10px'}).append(com).appendTo(chatroom);

        chatheight += li.height() + 10;
        chatroom.animate({scrollTop: chatheight}, 300);
    };

    /**
     *
     * 系统尺寸改变
     *
     */

//        $(window).resize(function() {
//            if($(window).width() >= 1000) {
//                chatroom.width($(window).width() - 280).height($(window).height() - 130);
//                listbox.width(200).height($(window).height() - 110).show();
//                chatroom.animate({scrollTop: chatheight}, 300);
//                chatbox.width($(window).width() - 40).height(50);
//            }else{
//                listbox.hide();
//                chatroom.width($(window).width() - 60).height($(window).height() - 130);
//
//                chatroom.animate({scrollTop: chatheight}, 300);
//                chatbox.width($(window).width() - 40).height(50);
//            }
//        });



    /**
     *
     * 创建视频
     *
     */
    rtc.connect('ws://localhost:8001', room);

    rtc.createStream({"video":
    {
        mandatory: { 'minAspectRatio': 2, 'maxAspectRatio': 2 },
        optional: []
    },
        "audio":true
    }, function(stream){
        // get local stream for manipulation
        rtc.attachStream(stream, 'me');
    });

    rtc.on('add remote stream', function(stream){
        // show the remote video
        rtc.attachStream(stream, 'boss');
    });

});