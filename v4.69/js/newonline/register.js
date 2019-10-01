(function(){

    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;

    var form, messageEl, busy = false;

    var showError = function(txt){
        messageEl.innerHTML = txt;
        Dom.addClass(messageEl, 'error');
        Dom.removeClass(messageEl, 'message');
    };

    var showMessage = function(txt){
        messageEl.innerHTML = txt;
        Dom.removeClass(messageEl, 'error');
        Dom.addClass(messageEl, 'message');
    };

    var clearError = function(){
        messageEl.innerHTML = '';
        Dom.removeClass(messageEl, 'error');
        Dom.removeClass(messageEl, 'message');
        Dom.removeClass($('input.hl'), 'hl');
    };

    var formSubmit = function(e){
        Event.stopEvent(e);
        if (busy){
            return;
        }
        clearError();
        busy = true;
        YAHOO.util.Connect.asyncRequest('POST', form.action, {
            success: function(o){
                busy = false;
                var result = eval('(' + o.responseText + ')');
                var msg = '';
                if (+result.result){
                    msg = result.messages.join('&nbsp;');
                    if (false){
                        showMessage(msg);
                        Dom.setStyle($('table.reg-col'), 'display', 'none');
                        Dom.setStyle($('td.option'), 'display', 'none');
                        Dom.setStyle($('.register-button'), 'display', 'none');
                        messageEl.parentNode.innerHTML += '<div class="register-success"><a href="/" class="register-continue">Continue...</a></div>';
                    } else {
                        if(window.ZAPNET_CONNEXTRA) {
                            if(result.extradata && result.extradata.id) {
                                try {
                                    var connextra = ZAPNET.Connextra;
                                    connextra.setRegisterTag(result.extradata.id);
                                } catch(e) {
                                   console.log(e);
                                }
                            }
                        }
                        window.location.href = '/register/success?msg=' + escape(msg);
                    }
                } else {
                    msg = result.errors.join('&nbsp;');
                    showError(msg);
                    if (result.fields){
                        Util.foreach(result.fields, function(action, field){
                            var fieldEl = $('input[name="' + field + '"]', form, true);
                            Dom.addClass(fieldEl, 'hl');
                            if (action == 'clear'){
                                fieldEl.value = '';
                            }
                        });
                    }
                }
            },
            failure: function(o){
                busy = false;
                showError(Util.t('Error: Registration failed. Please try again'));
            },
            cache: false,
            timeout: 30000
        }, Util.serialiseForm(form));
    };

    var setup = function(){
        form = $('div.registration-panel form', null, true);
        messageEl = $('table td.messages div.panel', null, true);
        Event.on(form, 'submit', formSubmit);
    };

    Event.onDOMReady(function(){
        setup();
    });
}());
