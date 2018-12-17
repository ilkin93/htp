$.notify.defaults({
    showAnimation: 'slideDown',
    hideAnimation: 'slideUp',
    autoHideDelay: 3000,
    arrowShow: false
});

$.notify.addStyle('green', {
    html: "<div><span data-notify-text/></div>",
    classes: {
        base: {
            "white-space": "nowrap",
            "background-color": "green",
            "padding-top": "10px",
            "padding-bottom" : "10px",
            "padding-left" : "25px",
            "padding-right" : "25px",
            "color": "#fff",
            "opacity": "0.8",
            "text-align" : "center",
            "width" : "392.75px",
            "font-size" : "12px"
        }
    }
});

$.notify.addStyle('red', {
    html: "<div><span data-notify-text/></div>",
    classes: {
        base: {
            "white-space": "nowrap",
            "background-color": "#ed7363",
            "padding-top": "10px",
            "padding-bottom" : "10px",
            "padding-left" : "25px",
            "padding-right" : "25px",
            "color": "#fff",
            "opacity": "0.8",
            "text-align" : "center",
            "width" : "392.75px",
            "font-size" : "12px"
        }
    }
});
