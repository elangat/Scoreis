(function(){

    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        $ = YAHOO.util.Selector.query;

    ZAPNET = ZAPNET || {};

    var Formatter = function(){
        var x,

        documentClick = function(e){
            var el = Event.getTarget(e);

            if (el.tagName.toLowerCase() == 'input' && (Dom.hasClass(el, 'amount') || el.name == 'amount')){
                Event.on(Dom.getAncestorByTagName(el, 'form'), 'submit', function(){
                    el.value = el.value.replace(/(,)/g, '');
                });
                Event.on(el, 'keyup', function(e){
                    var inEl = Event.getTarget(e);
                    var num = inEl.value.replace(/(,)/g, '');
                    inEl.value = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                });
            }
        },

        setup = function (){
            Event.on(document.body, 'click', documentClick);
        };
        return {
            setup: setup
        };
    }();

    Event.onDOMReady(function(){
        Formatter.setup();
    });

}());
