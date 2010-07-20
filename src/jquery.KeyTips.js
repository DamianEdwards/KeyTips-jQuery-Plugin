/// <reference path="jquery-1.3.2.js" />
/* jQuery Access Key Highlighter Plugin 1.0.1 - http://damianedwards.com */
(function($) {
    jQuery.extend({
        trace: function(msg, isDebug) {
            if (isDebug === false) return;
            if ((typeof (Debug) !== "undefined") && Debug.writeln) {
                Debug.writeln(msg);
            }
            if (window.console && window.console.log) {
                window.console.log(msg);
            }
            if (window.opera) {
                window.opera.postError(msg);
            }
            if (window.debugService) {
                window.debugService.trace(msg);
            }
        },
        keyTips: function(options) {
            // ready
            $(function() {
                var requiresHighlighting, requiresShiftAlt, accessKeysHighlighted,
                    accessKeyPopups, accessKeyPopupFields, settings;
                
                requiresHighlighting = !/opera/.test(navigator.userAgent); // exit if opera as it has its own dedicated access key selection interface
                
                if (!requiresHighlighting) return;
                requiresShiftAlt = $.browser.mozilla;
                accessKeysHighlighted = false;
                accessKeyPopups = [];
                accessKeyPopupFields = [];
                
                // define settings
                settings = $.extend({
                    debug: false,
                    highlightClass: "akh__highlighted",
                    popupClass: "akh__popup",
                    highlightMode: "popup", // alternative is "toggleClass"
                    accessKeyTag: "em", // could be any inline tag, e.g. em, strong, span
                    offsets: {
                        label: {
                            left: -20,
                            top: 2
                        },
                        button: {
                            left: -3,
                            top: -3
                        },
                        anchor: {
                            left: 2,
                            top: 9
                        },
                        text: {
                            left: -3,
                            top: -3
                        },
                        other: {
                            left: -3,
                            top: -3
                        }
                    }
                }, options);
                
                // functions
                var isSelectorMatch = function(element, selector) {
                    return $(element).filter(selector).length == 1;
                };
                
                var getOffset = function(element) {
                    if (isSelectorMatch(element, "label")) {
                        return settings.offsets.label;
                    } else if (isSelectorMatch(element, ":button, :submit, :reset, :image")) {
                        return settings.offsets.button;
                    } else if(isSelectorMatch(element, "a")) {
                        return settings.offsets.anchor;
                    } else if (isSelectorMatch(element, ":text, textarea")) {
                        return settings.offsets.text;
                    } else {
                        return settings.offsets.other;
                    };
                };
                
                var getPopupLocation = function(element) {
                    var popupLocation = $(element).offset();
                    var offset = getOffset(element);
                    popupLocation.left = popupLocation.left + offset.left;
                    popupLocation.top = popupLocation.top + offset.top;
                    return popupLocation;
                };
                
                var createPopup = function(field, accessKey) {
                    /// <summary>Creates an access key popup and adds it to the global array</summary>
                    var popupLocation = getPopupLocation(field);

                    // Create popup element, set its location and classs and add to the global array
                    var popup = $(document.createElement("div"))
                        .text(accessKey)
                        .css("left", popupLocation.left)
                        .css("top", popupLocation.top)
                        .addClass(settings.popupClass)
                        .appendTo("body")
                        .get(0);
                    
                    accessKeyPopups.push(popup);
                    accessKeyPopupFields.push(field);
                    return popup;
                };
                
                var clearPopups = function() {
                    /// <summary>Clears all access key popups from the form</summary>
                    $(accessKeyPopups).remove();
                    accessKeyPopups = [];
                    accessKeyPopupFields = [];
                };
                
                var insertAccessKeyTags = function() {
                    /// <summary>Find access key text and surround with a tag</summary>
                    $("label[for], label[accesskey]").each(function() {
                        // Get accesskey from corresponding form field, otherwise from the label
                        // BUG: Need to allow for when for is empty
                        var relatedFieldId = "#" + $(this).attr("for");
                        var accessKey = $.trim(relatedFieldId !== "#" ? $(relatedFieldId).attr("accesskey") : "");
                        if (typeof(accessKey) === "undefined" || accessKey === "") {
                            // Get accesskey from label
                            accessKey = $(this).attr("accesskey");
                        }
                        if (typeof(accessKey) === "undefined"  || accessKey === "") return true;
                        var labelHtml = $(this).html();
                        var accessKeyIndex = labelHtml.toUpperCase().indexOf(accessKey.toUpperCase());
                        if (accessKeyIndex < 0) return true;
                        // <tagName>accessKeyFromLabel</tagName>
                        var accessKeyMarkup = "<" + settings.accessKeyTag + ">" + labelHtml.substr(accessKeyIndex, 1) + "</" + settings.accessKeyTag + ">";
                        var newLabelHtmlLeft = labelHtml.substring(0, accessKeyIndex);
                        var newLabelHtmlRight = labelHtml.substr(accessKeyIndex + 1);
                        var newLabelHtml = newLabelHtmlLeft + accessKeyMarkup + newLabelHtmlRight;
                        if (labelHtml.indexOf(accessKeyMarkup) < 0) $(this).html(newLabelHtml);
                    });
                };
                
                var createPopups = function() {
                    /// <summary>Creates popups for access keys on the form</summary>
                    if (settings.highlightMode == "popup") {
                        clearPopups();
                        var accessKeyPopupFormFields = [];

                        // Create popups for labels
                        $("label > " + settings.accessKeyTag).each(function() {
                            var text = $(this).text();
                            var label = $(this).parent();
                            var formField = $("#" + label.attr("htmlFor"));
                            var accessKey = formField.attr("accessKey") != "" ? formField.attr("accessKey") : label.attr("accessKey");
                            if (text.toUpperCase() == accessKey.toUpperCase()) {
                                createPopup(label[0], accessKey);
                            }
                            accessKeyPopupFormFields.push(formField[0]);
                        });

                        $("a[href][accesskey], textarea[accesskey], input[accesskey]").each(function() {
                            if ($.inArray(this, accessKeyPopupFormFields) === -1) {
                                createPopup(this, this.accessKey);
                            }
                        });
                    }
                };
                
                var refreshPopups = function() {
                    /// <summary>Clears and the re-creates access key popups for the form</summary>
                    clearPopups();
                    createPopups();
                };
                
                var doHighlightAccessKeys = function(highlight) {
                    /// <summary>Toggles the highlighting of access keys on the page</summary>
                    if (settings.highlightMode === "popup") {
                        // Popups
                        var i = 0;
                        $.each(accessKeyPopups, function() {
                            var field = accessKeyPopupFields[i]; i++;
                            var popupLocation = getPopupLocation(field);
                            $(this).css("left", popupLocation.left)
                                   .css("top", popupLocation.top)
                                   .toggle(highlight);
                        });
                    } else if (settings.highlightMode === "toggleClass") {
                        // Toggle label class
                        $("label > " + settings.accessKeyTag).each(function() {
                            var text = $(this).text();
                            var label = $(this).parent();
                            var formField = $("#" + label.attr("htmlFor"));
                            var accessKey = formField.attr("accessKey") !== "" ? formField.attr("accessKey") : label.attr("accessKey");
                            if (text.toUpperCase() === accessKey.toUpperCase()) {
                                $(this).toggleClass(settings.highlightClass, highlight);
                            }
                        });
                    }
                };
                
                var highlightAccessKeys = function() {
                    doHighlightAccessKeys(true);
                };
                
                var unhighlightAccessKeys = function() {
                    doHighlightAccessKeys(false);
                };
                
                // bind handlers
                $(document)
                    .keydown(function(e) {
                        $.trace("AccessKeyHighlighter document.keyDown: keyCode=" + e.keyCode +
                                ", altKey=" + e.altKey +
                                ", shiftKey=" + e.shiftKey, settings.debug);
                        if (!accessKeysHighlighted && (
                                (e.keyCode == 18 && !requiresShiftAlt) ||
                                (e.keyCode == 16 && e.altKey && requiresShiftAlt) ||
                                (e.keyCode == 18 && e.shiftKey && requiresShiftAlt))) {
                            // Highlight all the access keys
                            highlightAccessKeys();
                            accessKeysHighlighted = true;
                        }
                    })
                    .keyup(function(e) {
                        $.trace("AccessKeyHighlighter document.keyUp: keyCode=" + e.keyCode +
                                ", altKey=" + e.altKey +
                                ", shiftKey=" + e.shiftKey, settings.debug);
                        // Un-highlight access keys
                        if (accessKeysHighlighted) {
                            unhighlightAccessKeys();
                            accessKeysHighlighted = false;
                        }
                    });
                
                $(window)
                    .resize(function(e) {
                        $.trace("resize event", settings.debug);
                        // Hide the popups
                        if (accessKeysHighlighted && settings.highlightMode == "popup") {
                            unhighlightAccessKeys();
                            accessKeysHighlighted = false;
                        }
                    })
                    .blur(function(e) {
                        $.trace("blur event", settings.debug);
                        // Un-highlight access keys
                        if (accessKeysHighlighted) {
                            unhighlightAccessKeys();
                            accessKeysHighlighted = false;
                        }
                    })
                    .focus(function(e) {
                        $.trace("focus event", settings.debug);
                        // Un-highlight access keys
                        if (accessKeysHighlighted) {
                            unhighlightAccessKeys();
                            accessKeysHighlighted = false;
                        }
                    });

                // Create the access key popups
                insertAccessKeyTags();
                createPopups();
            });

            // unload
            $(window).unload(function() {
                $(document).unbind();
                $(window).unbind();
            });
        }
    });
})(jQuery);