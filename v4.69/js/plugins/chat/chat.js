(function(){
    
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;
        
    var ZINDEX = 100;
        
    ZAPNET.ChatSession = function(el){
        var chatWin = null,
            chatClose = null,
            chatScreen = null,
            chatInput = null,
            chatType = null,
            chatSend = null,
            chatHeader = null,
            status = 'init',
            chatId = null,
            userId = null,
            userName = null,
            chatScreenReg = null,
            element = el || document.body,
            sessionInfo = false,

        close = function(){
            chatWin.parentNode.removeChild(chatWin);
            if (status != 'closed'){
                status = 'closed';
                YAHOO.util.Connect.asyncRequest('GET', '/chat/close?sid=' + chatId, {
                    success: function(o){
                    },
                    failure: function(o){
                    },
                    cache: false,
                    timeout: 30000
                });            
            }
        },
                
        join = function(sid, cb){
            YAHOO.util.Connect.asyncRequest('GET', '/chat/join?sid=' + sid, {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        Util.showErrorMessage('Error: ' + result.error);
                        return;
                    }
                    if (result.id){
                        status = result.status;
                        if (result.status == 'open'){
                            chatType.disabled = false;
                            chatSend.disabled = false;                            
                        }
                        chatId = result.id;
                        userId = result.userid;
                        userName = result.username;
                        Dom.removeClass(chatWin, 'connecting');
                        Dom.addClass(chatWin, 'waiting');
                        sessionInfo = result.info;
                        if (result.chats){
                            Util.foreach(result.chats, function(chat){
                                addChatLine(chat.m, chat.u, chat.t);
                            });
                        }
                        cb();
                    }
                },
                failure: function(o){
                    Util.showErrorMessage('Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            });            
        },
        
        create = function(){
            YAHOO.util.Connect.asyncRequest('GET', '/chat/create', {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        Util.showErrorMessage('Error: ' + result.error);
                        return;
                    }
                    if (result.id){
                        status = 'init';
                        chatId = result.id;
                        userId = result.userid;
                        userName = result.username;
                        Dom.removeClass(chatWin, 'connecting');
                        Dom.addClass(chatWin, 'waiting');
                        addSystemMessage('Connected to server. Waiting for operator...');
                    }
                },
                failure: function(o){
                    Util.showErrorMessage('Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            });
        },
                
        focus = function(){
            Dom.setStyle(chatWin, 'z-index', ZINDEX++);
            chatType.focus();
        },
        
        addChatLine = function(text, chatName, ts){
            var toScroll = chatScreen.innerHTML == '' || chatScreen.scrollHeight <= chatScreen.scrollTop + chatScreenReg.height;
            var chatLine = Util.div('support-chat-line');
            var chatLineUser = Util.elem('span', 'chat-line-user');
            var chatLineText = Util.elem('span', 'chat-line-text');
            chatLineText.innerHTML = $P.trim(text).replace(/\n/g, '<br/>');
            chatLineUser.innerHTML = (ts ? $P.date('H:i', ts) : $P.date('H:i')) + (chatName ?'&nbsp;&nbsp;' + chatName  : '') + ':&nbsp;';
            Util.addElements(chatLine, [chatLineUser, chatLineText]);
            chatScreen.appendChild(chatLine);
            if (toScroll){
                chatScreen.scrollTop = chatScreen.scrollHeight;
            }
            return chatLine;
        },
                
        addSystemMessage = function(text){
            var toScroll = chatScreen.innerHTML == '' || chatScreen.scrollHeight <= chatScreen.scrollTop + chatScreenReg.height;
            var chatLine = Util.div('support-chat-line');
            var chatLineText = Util.elem('span', 'chat-line-text chat-line-system-text');
            chatLineText.innerHTML = $P.date('H:i') + ': ' + $P.trim(text).replace(/\n/g, '<br/>');
            chatLine.appendChild(chatLineText);
            chatScreen.appendChild(chatLine);
            if (toScroll){
                chatScreen.scrollTop = chatScreen.scrollHeight;
            }
        },
        
        sendChat = function(){
            var text = $P.trim(chatType.value);
            chatType.value = '';            
            if (!text || status != 'open'){
                return;
            }
            var chatLine = addChatLine(text, userName);
            Dom.addClass(chatLine, 'pending');
            chatType.focus();    
            YAHOO.util.Connect.asyncRequest('POST', '/chat/chat?sid=' + chatId, {
                success: function(o){
                    var result = YAHOO.lang.JSON.parse(o.responseText);
                    if (result.error){
                        Util.showErrorMessage('Error: ' + result.error);
                        return;
                    }
                    if (result.ok){
                        Dom.removeClass(chatLine, 'pending');
                    }
                },
                failure: function(o){
                    Util.showErrorMessage('Problem: ' + o.responseText);
                },
                cache: false,
                timeout: 30000
            }, text);            
        },
              
        createChatPanel = function(){
            chatWin = Util.div('support-chat-window connecting');
            chatHeader = Util.div('support-chat-header');
            chatScreen = Util.div('support-chat-screen');
            chatInput = Util.div('support-chat-input');
            chatType = Util.elem('textarea', 'support-chat-type');
            chatSend = Util.elem('input', 'support-chat-send', null, { 
                attrs: { 
                    type: 'submit',
                    value: 'Send'
                }
            });
            chatClose = Util.div('support-chat-close', 'x');
            chatHeader.innerHTML = 'Customer Service - Chat Online';
            chatHeader.appendChild(chatClose);
            Util.addElements(chatInput, [chatType, chatSend]);
            Util.addElements(chatWin, [chatHeader, chatScreen, chatInput]);
            element.appendChild(chatWin);
            
            chatType.disabled = true;
            chatSend.disabled = true;
            
            chatScreenReg = Dom.getRegion(chatScreen);
            
            var enterListener = new YAHOO.util.KeyListener(chatType, {keys: [13]},{
                    fn: function(type, args){
                        var key = args[0];
                        var event = args[1];
                        Event.stopEvent(event);
                        sendChat();
                    }
                });
            enterListener.enable();
            var lineListener = new YAHOO.util.KeyListener(chatType, {keys: [13], ctrl: true},{
                    fn: function(type, args){
                        var key = args[0];
                        var event = args[1];
                        Event.stopEvent(event);
                        chatType.value = chatType.value + "\n";
                    }
                });
            lineListener.enable();            
            
            addSystemMessage(Util.t('Connecting to Server'));
            Event.on(chatSend, 'click', sendChat);
            Event.on(chatClose, 'click', close);
        },
                
        chatEvent = function(event){
            console.log('EVENT', event)
            var data = event.d ? eval('(' + event.d + ')') : false;
            if (data && data.userid == userId){     
                console.log('drop event', event)
                return;
            }
            console.log('CHAT EVENT ' + event.t);
            if (event.t == 'chat'){
                addChatLine(data.message, data.user);
            } else if (event.t == 'open'){
                console.log('open')
                chatType.disabled = false;
                chatSend.disabled = false;
                status = 'open';
            } else if (event.t == 'join'){
                addSystemMessage(data.username + ' is now connected.');
            } else if (event.t == 'close'){
                if (status != 'closed'){
                    Util.showMessage('The chat session has been terminated', 'Session Closed');
                }
                chatType.disabled = true;
                chatSend.disabled = true;
                Dom.setStyle(chatScreen, 'background-color', '#f0f0f0');
                status = 'closed';
            }
        },
                
        getElement = function(){
            return chatWin;
        },
                
        getStatus = function(){
            return status;
        },
                
        getSessionInfo = function(){
            return sessionInfo;
        },
        
        getChatId = function(){
            return chatId;
        };
        
        createChatPanel();

        return {
            close: close,
            create: create,
            join: join,
            focus: focus,
            getElement: getElement,
            chatEvent: chatEvent,
            getSessionInfo: getSessionInfo,
            getStatus: getStatus,
            getChatId: getChatId
        };
    };
    
    ZAPNET.ChatService = function(){
        var sessions = [],
            lastId = null,
            inited = false,
            reuse = true,
        
        startChat = function(el){
            if (!inited){
                return;
            }
            if (reuse && sessions.length){
                var currentSession = false;
                Util.foreach(sessions, function(session){
                    if (session.getStatus() != "closed"){
                        currentSession = session;
                    }
                });
                if (currentSession){
                    currentSession.focus();
                    return;
                }
            }
            var session = ZAPNET.ChatSession(el);
            session.create();
            sessions.push(session);
            return session;
        },
                
        joinChat = function(chatId, el, cb){
            if (!inited){
                return;
            }
            var currentSession = false;
            Util.foreach(sessions, function(session){
                if (session.getChatId() == chatId){
                    currentSession = session;
                    cb(session);
                }
            });
            if (!currentSession){
                var currentSession = ZAPNET.ChatSession(el);
                currentSession.join(chatId, cb);
                sessions.push(currentSession);
            }
            currentSession.focus();
            return currentSession;            
        },
                
        getOpenSession = function(){
            var i, session;
            for(i = 0; i < sessions.length; i += 1){
                session = sessions[i];
                if (session.getStatus() == 'open'){
                    return session;
                }
            }
            
            return false;
        },
               
        setReuse = function(r){
            reuse = r;
        },
        
        chatEvent = function(event){
            Util.foreach(sessions, function(session){
                if (event.o == 'session' && session.getChatId() == event.oid){
                    session.chatEvent(event);
                }
            });
        },
                
        init = function(){
            inited = true;
        };
        
        ZAPNET.Events.subscribe(chatEvent, 'chat');

        return {
            setReuse: setReuse,
            startChat: startChat,
            joinChat: joinChat,
            getOpenSession: getOpenSession
        };
    }();    
}());