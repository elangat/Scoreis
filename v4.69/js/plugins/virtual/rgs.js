
(function(){
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query,
        Util = ZAPNET.util;
        
    var busy = false;
          
    ZAPNET.Virtuals = ZAPNET.Virtuals || {};    

    ZAPNET.Virtuals = function(){
        var virtualLinksCont,
            virtualContent,        
        openVSport = function(evt, token, key, gameType, url, refid , locale) {
            var i, tabcontent, tablinks;

            virtualContent = Dom.get('virtual-content');
            var html =[];
            html.push('<iframe  name="virtual-iframe" scrolling="yes" allowtransparency="true" style="height:100%;width:100%;border:none;"');
            html.push('src="', url, '?gameType=',gameType );
            if(token){
                html.push('&id=',token);
            }
            
            if(refid){
                html.push(refid);
            }
            if(locale){
                html.push(locale);
            }
            html.push('&key=',key,'"></iframe>');
            virtualContent.innerHTML = html.join('');

            tablinks = document.getElementsByClassName("virtual-tablinks");
            for (i = 0; i < tablinks.length; i++) {
                Dom.removeClass(tablinks[i], 'active');
            }
            Dom.addClass(evt.currentTarget, 'active');
        },
        init = function(){
            virtualLinksCont = Dom.get('virtual-links');
            virtualContent = Dom.get('virtual-content');
        };

        return {
            init: init,
            openVSport : openVSport
        };
   }();
}());
