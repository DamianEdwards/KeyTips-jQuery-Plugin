/// <reference path="jquery-1.7.1.js" />
/// <reference path="..\..\src\jquery.KeyTips.js" />
$(function () {
    var userAgent = navigator.userAgent;
    // Set access key shortcut text
    $("#shortcutKey").text(
        /Mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent) ?
            "Alt+Shift keys" : "Alt key");
    
    // Wire-up code samples
    $("p.code-sample").before("<a class=\"show-link\" href=\"#\" title=\"Show the code example\">show example</a>");
    
    $("a.show-link").click(function (e) {
        var el = $(this);
        el.next().toggle("fast", function () {
            el.text(el.text() == "show example" ? "hide example" : "show example");
        });
        e.preventDefault();
        return false;
    });

    // Show KeyTips
    $("#pageContainer").keyTips({
        debug: false
        //, highlightMode: "toggleClass"
    });
});