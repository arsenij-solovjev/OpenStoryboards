/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */ (function ($) {
    var eventCanceller = function (e) {
            e.preventDefault();
            return false
        };
    window.IMAGE_PREFIX = "http://s.deviantart.com/styles/minimal/minish/spitbite/";
    window.ERROR_SUBMIT = "Sorry, we can not currently process the file you submitted. Possible causes are:\n\n * deviantART is experiencing high load and your request was interrupted or timed out..\n\n * There was a server error while processing the request.\n\n * The setting of your browser privacy controls or firewall may be blocking the response from deviantART.";
    window.DndDeck = Base.extend({
        constructor: function () {
            this.logger = new StdLogger("Deck");
            this.currentIndex = 0;
            this.ready = [];
            this.processing = [];
            this.uploading = [];
            this.difiDelay = DndDeck.DEFAULT_DELAY;
            this.scheduler = null;
            this.selectedDeckId = null;
            this.defaultSelectHandler = this.noopSelectHandler;
            this.selectedDeckItem = null;
            this.modalOptions = null;
            this.modalLayout = null;
            $("#addtext_button").click(this.addTextModal.bindTo(this));
            this.bindUpload($("#deck_file_upload"));
            this.failureCount = 0;
            this.writingNumber = 0;
            this.error_details = false
        },
        bindUpload: function ($node) {
            if ($node.length > 0) {
                $node.change(this.uploadFile.bindTo(this));
                $node.keypress(eventCanceller);
                $node.get(0).onpaste = function () {
                    return false
                };
                if ($.browser.mozilla) {
                    $($node).mousedown(eventCanceller)
                }
            }
        },
        uploadFile: function () {
            var deckItem = new DeckItem(this.currentIndex++, this);
            deckItem.name = "Uploading...";
            deckItem.setWidth();
            deckItem.generateHtml($("#scroller").get(0));
            deckItem.makeIFrame();
            this.uploading.push(deckItem);
            this.setScrollerWidth();
            deckItem.toggleSpinner(true);
            var fuUploader = $("#deck_file_upload").get(0);
            var fuForm = fuUploader.form;
            fuForm.target = deckItem.getName();
            fuForm.submit();
            if ($.browser.mozilla) {
                fuUploader.type = "hidden";
                fuUploader.type = "file"
            }
            var retval = false;
            if (window.event) {
                event.cancelBubble = true
            }
        },
        sortItem: function (deckObj, response) {
            deckObj.status = parseInt(response.status);
            switch (deckObj.status) {
            case 0:
                deckObj.deckId = parseInt(response.deckId);
                deckObj.name = response.name_short;
                deckObj.name_long = response.name_long || response.name_short;
                deckObj.thumbUrl = DndDeck.IMAGE_PROCESSING;
                deckObj.is_displayable = response.is_displayable;
                deckObj.is_printable = response.is_printable;
                deckObj.is_video = response.is_video;
                deckObj.filetype = response.file_type_str;
                deckObj.filesize = response.file_size_str;
                deckObj.sizeArray = [];
                deckObj.setWidth();
                deckObj.filewidth = parseInt(response.width);
                deckObj.fileheight = parseInt(response.height);
                if (deckObj.containerDiv) {
                    deckObj.makeLabel();
                    deckObj.setImage()
                } else {
                    deckObj.generateHtml($("#scroller").get(0))
                }
                deckObj.toggleSpinner(true);
                this.processing.push(deckObj);
                this.scheduleUpdate();
                break;
            case 1:
                deckObj.deckId = parseInt(response.deckId);
                deckObj.previewUrl = response.preview_url;
                deckObj.thumbUrl = DndDeck.IMAGE_COMPLETE;
                if (deckObj.containerDiv) {
                    deckObj.fileheight = 100;
                    deckObj.setImage()
                }
                deckObj.thumbUrl = response.thumb_url;
                deckObj.name = response.name_short;
                deckObj.name_long = response.name_long || response.name_short;
                deckObj.is_displayable = response.is_displayable;
                deckObj.is_printable = response.is_printable;
                deckObj.is_video = response.is_video;
                if (!deckObj.is_displayable) {
                    deckObj.thumbUrl = DndDeck.IMAGE_NEEDS_PREVIEW;
                    deckObj.filewidth = 79;
                    deckObj.fileheight = 100
                } else {
                    deckObj.filewidth = parseInt(response.width);
                    deckObj.fileheight = parseInt(response.height);
                    deckObj.suggestedSize = parseInt(response.suggested_size)
                }
                deckObj.filetype = response.file_type_str;
                deckObj.filesize = response.file_size_str;
                deckObj.sizeArray = [];
                $.each(response.sizeArray, function () {
                    deckObj.sizeArray.push(this)
                });
                deckObj.videoThumbs = response.frames;
                deckObj.setWidth();
                if (deckObj.containerDiv) {
                    deckObj.makeLabel()
                } else {
                    deckObj.generateHtml($("#scroller").get(0))
                }
                deckObj.setImage();
                deckObj.toggleSpinner(false);
                this.popFromAll(deckObj);
                this.ready.push(deckObj);
                if (!this.selectedDeckItem) {
                    (this.defaultSelectHandler.bindTo(deckObj.containerDiv)).call()
                }
                break;
            case 2:
                deckObj.deckId = parseInt(response.deckId);
                deckObj.name = response.name_short;
                deckObj.name_long = response.name_long || response.name_short;
                deckObj.filetype = response.file_type_str;
                deckObj.filesize = response.file_size_str;
                deckObj.is_displayable = response.is_displayable;
                deckObj.is_printable = response.is_printable;
                deckObj.is_video = response.is_video;
                deckObj.is_text = response.is_text;
                deckObj.text_preview = response.text_preview;
                deckObj.setWidth();
                if (deckObj.containerDiv) {
                    deckObj.makeLabel()
                } else {
                    deckObj.generateHtml($("#scroller").get(0))
                }
                if (deckObj.is_displayable) {
                    deckObj.thumbUrl = response.thumb_url;
                    deckObj.setImage()
                } else {
                    if (deckObj.is_text) {
                        deckObj.filewidth = 120;
                        deckObj.fileheight = 100;
                        deckObj.setWidth();
                        deckObj.makeLabel();
                        deckObj.overlayText()
                    } else {
                        deckObj.filewidth = 79;
                        deckObj.fileheight = 100;
                        deckObj.setWidth();
                        deckObj.thumbUrl = DndDeck.IMAGE_NEEDS_PREVIEW;
                        deckObj.setImage()
                    }
                }
                deckObj.toggleSpinner(false);
                this.popFromAll(deckObj);
                this.ready.push(deckObj);
                if (!this.selectedDeckItem) {
                    (this.defaultSelectHandler.bindTo(deckObj.containerDiv)).call()
                }
                break;
            case -1:
            default:
                deckObj.deckId = parseInt(response.deckId);
                deckObj.name = response.name_short;
                deckObj.name_long = re...his.intervalCheck()
            }).bindTo(this),
        300)
    }, intervalCheck: function () {
        try {
            if (!this.iframe) {
                clearInterval(this.intervalId)
            }
            if (this.iframe.readyState == 4 || this.iframe.readyState == "complete") {
                var retdoc = null;
                if (this.iframe.contentDocument) {
                    retdoc = this.contentDocument
                } else {
                    if (this.iframe.contentWindow) {
                        retdoc = this.iframe.contentWindow
                    } else {
                        if (this.iframe.document) {
                            retdoc = this.iframe.document
                        }
                    }
                }
                if (retdoc.document) {
                    retdoc = retdoc.document
                }
                if (!retdoc) {
                    return
                }
                if (!retdoc.body) {
                    return
                }
                var json = null;
                if (typeof (retdoc.body.innerText) != "undefined") {
                    json = retdoc.body.innerText
                } else {
                    json = retdoc.body.textContent
                }
                if (json.length < 1) {
                    return
                }
                clearInterval(this.intervalId);
                var func = this.onLoad.bindTo(this.iframe);
                func()
            }
        } catch (e) {
            clearInterval(this.intervalId)
        }
    },
    onLoad: function () {
        if (!this.domLoaded) {
            return
        }
        try {
            var retdoc = null;
            if (this.contentDocument) {
                retdoc = this.contentDocument
            } else {
                if (this.contentWindow) {
                    retdoc = this.contentWindow
                } else {
                    if (this.document) {
                        retdoc = this.document
                    }
                }
            }
            if (retdoc.document) {
                retdoc = retdoc.document
            }
            if (!retdoc) {
                throw "Missing iframe."
            }
            if (!retdoc.body) {
                throw "Missing iframe content:" + retdoc
            }
            var json = null;
            if (typeof (retdoc.body.innerText) != "undefined") {
                json = retdoc.body.innerText
            } else {
                json = retdoc.body.textContent
            }
            var response = eval("(" + json + ")");
            if (!response.deckId) {
                throw "Missing deckId in json"
            }
        } catch (e) {
            this.obj.logger.log("Caught error " + e.message + ": ", e);
            console.log("Caught error", e);
            if (this.obj.handler.error_details) {
                alert(DndDeck.ERROR_UPLOAD + "\n\n\nerror message:" + e + "/njson:" + json + "/nretdoc.body.innerHTML:" + retdoc.body.innerHTML)
            } else {
                alert(DndDeck.ERROR_UPLOAD)
            }
            this.obj.handler.popFromAll(this.obj);
            $(this.obj.containerDiv).remove();
            this.obj.handler.setScrollerWidth();
            this.obj.handler.deselectAllItems();
            this.obj.releaseIframe(this);
            this.obj = null;
            return
        }
        this.obj.handler.popFromAll(this.obj);
        this.obj.handler.fakeMiss(this.obj, response);
        this.obj.handler.sortItem(this.obj, response);
        this.obj.releaseIframe(this);
        this.obj = null
    },
    releaseIframe: function (iframe) {
        iframe.obj.unregisterEvent(iframe, "load", iframe.obj.loadStash);
        iframe.obj.unregisterEvent(iframe, "readystatechange", iframe.obj.readyStash);
        iframe.obj.loadStash = null;
        iframe.obj.readyStash = null;
        iframe.obj.iframe = null
    },
    onReadyStateChange: function () {
        if (this.readyState == "complete") {
            var func = this.obj.onLoad.bindTo(this);
            func()
        }
    },
    removeItem: function (noConfirmation, noDifi) {
        if (noConfirmation === true) {} else {
            if (!confirm("You are about to delete this file.\nAre you sure you want to proceed?")) {
                return false
            }
        }
        this.registerSelectEvent(this.handler.noopSelectHandler);
        this.thumbUrl = null;
        this.removeTextOverlay();
        this.name = "Removing...";
        this.toggleSpinner(true);
        this.filetype = null;
        this.filewidth = null;
        this.makeLabel();
        var callback = (function (success, data) {
            if (this.handler.selectedDeckItem == this) {
                this.deselectItem();
                this.is_displayable = false;
                this.is_video = false;
                this.status = -2;
                if (this.handler.modalOptions && this.handler.modalOptions.updatecontextualdata) {
                    this.toggleContextualFileMenus()
                } else {
                    if (!this.handler.modalOptions) {
                        this.toggleContextualFileMenus()
                    }
                }
            }
            this.containerDiv.obj = null;
            $(this.containerDiv).remove();
            this.handler.popFromAll(this);
            this.handler.setScrollerWidth();
            for (var key in this) {
                var value = this[key];
                if (typeof value !== "function") {
                    this[key] = null
                }
            }
            this.handler = null
        }).bindTo(this);
        if (noDifi) {
            callback()
        } else {
            DiFi.pushPost("Deck", "deleteDeckItem", [this.deckId], callback);
            DiFi.send()
        }
        return false
    },
    toggleContextualFileMenus: function (otherPreview) {
        if (!($("#deckId_id").length > 0 && $("#deckPreviewId").length > 0)) {
            return
        }
        if (typeof (otherPreview) == "undefined") {
            otherPreview = false
        }
        if (this.status > 0) {
            $("#deckId_id").val(this.deckId)
        } else {
            $("#deckId_id").val("");
            $("#deckPreviewId").val("")
        }
        if (this.is_displayable && !this.is_video && this.sizeArray.length) {
            $("#deckPreviewId").val("");
            $("#film_selector").hide();
            $("#preview_selector").hide();
            $("#size_selector").show();
            if (!this.handler.reselect) {
                $("#devsize").empty();
                for (var i = 0; i < this.sizeArray.length; i++) {
                    var option = $('<option value="' + i + '">' + this.sizeArray[i] + "</option>").appendTo("#devsize").get(0);
                    if (i == this.suggestedSize) {
                        option.selected = true
                    }
                }
                if ($("#watermark").get(0)) {
                    if (this.suggestedSize == "0") {
                        $("#watermark").get(0).checked = false;
                        $("#watermark").get(0).disabled = true
                    } else {
                        $("#watermark").get(0).disabled = false
                    }
                }
            }
            if (!otherPreview) {
                $("#file_keeper").show()
            }
        } else {
            if ((!this.is_displayable || this.is_video) && this.status > 0) {
                $("#size_selector").hide();
                $("#devsize").empty();
                if (!otherPreview) {
                    if (this.is_video) {
                        $("#preview_selector").hide();
                        SPFilm.enable(this)
                    } else {
                        $("#film_selector").hide();
                        $("#preview_thumb").height(100);
                        if (!this.handler.reselect) {
                            $("#deckPreviewId").val("");
                            if (this.is_text) {
                                $("#preview_thumb").attr("src", DndDeck.IMAGE_OPT_PREVIEW)
                            } else {
                                $("#preview_thumb").attr("src", DndDeck.IMAGE_NO_PREVIEW)
                            }
                        }
                        $("#preview_selector").show();
                        $("#file_keeper").show()
                    }
                }
            } else {
                $("#file_keeper").hide();
                $("#preview_selector").hide();
                $("#size_selector").hide();
                $("#film_selector").hide()
            }
        }
    }
})
})(jQuery);
if (window.DWait) {
    DWait.run("jms/pages/submit/DndDeck.js")
}
DWait.count();