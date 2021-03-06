/**
Core script to handle the entire theme and core functions
**/
var App = function () {

    // IE mode
    var isRTL = false;
    var isIE8 = false;
    var isIE9 = false;
    var isIE10 = false;

    var sidebarWidth = 215;
    var sidebarCollapsedWidth = 35;

    var responsiveHandlers = [];

    // theme layout color set
    var layoutColorCodes = {
        'blue': '#4b8df8',
        'red': '#e02222',
        'green': '#35aa47',
        'purple': '#852b99',
        'grey': '#555555',
        'light-grey': '#fafafa',
        'yellow': '#ffb848'
    };

    // To get the correct viewport width based on  http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
    var _getViewPort = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        }
    }

    // initializes main settings
    var handleInit = function () {

        if ($('body').css('direction') === 'rtl') {
            isRTL = true;
        }

        isIE8 = !! navigator.userAgent.match(/MSIE 8.0/);
        isIE9 = !! navigator.userAgent.match(/MSIE 9.0/);
        isIE10 = !! navigator.userAgent.match(/MSIE 10.0/);

        if (isIE10) {
            jQuery('html').addClass('ie10'); // detect IE10 version
        }
        
        if (isIE10 || isIE9 || isIE8) {
            jQuery('html').addClass('ie'); // detect IE10 version
        }

        /*
          Virtual keyboards:
          Also, note that if you're using inputs in your modal – iOS has a rendering bug which doesn't 
          update the position of fixed elements when the virtual keyboard is triggered  
        */
        var deviceAgent = navigator.userAgent.toLowerCase();
        if (deviceAgent.match(/(iphone|ipod|ipad)/)) {
            $(document).on('focus', 'input, textarea', function () {
                $('.header').hide();
                $('.footer').hide();
            });
            $(document).on('blur', 'input, textarea', function () {
                $('.header').show();
                $('.footer').show();
            });
        }
    }

    var handleSidebarState = function () {
        // remove sidebar toggler if window width smaller than 992(for tablet and phone mode)
        var viewport = _getViewPort();
        if (viewport.width < 992) {
            $('body').removeClass("page-sidebar-closed");
        }
    }

    // runs callback functions set by App.addResponsiveHandler().
    var runResponsiveHandlers = function () {
        // reinitialize other subscribed elements
        for (var i in responsiveHandlers) {
            var each = responsiveHandlers[i];
            each.call();
        }
    }

    // reinitialize the laypot on window resize
    var handleResponsive = function () {
        handleSidebarState();
        handleSidebarAndContentHeight();
        handleFixedSidebar();
        runResponsiveHandlers();
    }

    // initialize the layout on page load
    var handleResponsiveOnInit = function () {
        handleSidebarState();
        handleSidebarAndContentHeight();
    }

    // handle the layout reinitialization on window resize
    var handleResponsiveOnResize = function () {
        var resize;
        if (isIE8) {
            var currheight;
            $(window).resize(function () {
                if (currheight == document.documentElement.clientHeight) {
                    return; //quite event since only body resized not window.
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    handleResponsive();
                }, 50); // wait 50ms until window resize finishes.                
                currheight = document.documentElement.clientHeight; // store last body client height
            });
        } else {
            $(window).resize(function () {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                    handleResponsive();
                }, 50); // wait 50ms until window resize finishes.
            });
        }
    }

    //* BEGIN:CORE HANDLERS *//
    // this function handles responsive layout on screen size resize or mobile device rotate.

    // Set proper height for sidebar and content. The content and sidebar height must be synced always.
    var handleSidebarAndContentHeight = function () {
        var content = $('.page-content');
        var sidebar = $('.page-sidebar');
        var body = $('body');
        var height;

        if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
            var available_height = $(window).height() - $('.footer').outerHeight();
            if (content.height() < available_height) {
                content.attr('style', 'min-height:' + available_height + 'px !important');
            }
        } else {
            if (body.hasClass('page-sidebar-fixed')) {
                height = _calculateFixedSidebarViewportHeight();
            } else {
                height = sidebar.height() + 20;
            }
            if (height >= content.height()) {
                content.attr('style', 'min-height:' + height + 'px !important');
            }
        }
    }

    // Handle sidebar menu
    var handleSidebarMenu = function () {
        jQuery('.page-sidebar').on('click', 'li > a', function (e) {
            if ($(this).next().hasClass('sub-menu') == false) {
                if ($('.btn-navbar').hasClass('collapsed') == false) {
                    $('.btn-navbar').click();
                }
                return;
            }

            if ($(this).next().hasClass('sub-menu.always-open')) {
                return;
            }

            var parent = $(this).parent().parent();
            var the = $(this);

            parent.children('li.open').children('a').children('.arrow').removeClass('open');
            parent.children('li.open').children('.sub-menu').slideUp(200);
            parent.children('li.open').removeClass('open');

            var sub = jQuery(this).next();
            var slideOffeset = -200;
            var slideSpeed = 200;

            if (sub.is(":visible")) {
                jQuery('.arrow', jQuery(this)).removeClass("open");
                jQuery(this).parent().removeClass("open");
                sub.slideUp(slideSpeed, function () {
                    if ($('body').hasClass('page-sidebar-fixed') == false && $('body').hasClass('page-sidebar-closed') == false) {
                        App.scrollTo(the, slideOffeset);
                    }
                    handleSidebarAndContentHeight();
                });
            } else {
                jQuery('.arrow', jQuery(this)).addClass("open");
                jQuery(this).parent().addClass("open");
                sub.slideDown(slideSpeed, function () {
                    if ($('body').hasClass('page-sidebar-fixed') == false && $('body').hasClass('page-sidebar-closed') == false) {
                        App.scrollTo(the, slideOffeset);
                    }
                    handleSidebarAndContentHeight();
                });
            }

            e.preventDefault();
        });

    }

    var _redirect = function (timeout, url) {
        window.setTimeout(function(){
                window.location.href = url;
            }, timeout
        );
        
    }



    //handle all ajax request
    var handleCreateProjectAjax = function() {
        jQuery('#create_project').on('click', function(e){
             e.preventDefault();
             var project_name = $('input[name=project_name]').val();
             var comments = $('textarea[name=comments]').val();
            
             var el = jQuery('#newproject > form');
             App.blockUI(el);

             $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/create_project',
                dataType : "json",
                data : {"name" : project_name, "comments" : comments},
                success : function(res){
                    //App.unblockUI($(el));
                    var $toast = toastr["success"]("Project Successfully Created.<br/> The page will Redirect to your new project in 2 seconds.");
                    var newUrl = '/cloudmanagers/project/' + res.farm_id;
                    _redirect(2000, newUrl);  
                    console.log(res);
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("Project Create Failed");
                }
             });

        });
    }

    //handle all ajax request
    var handlePlatformSettingAjax = function() {
        jQuery('#save_ec2_platform').on('click', function(e){
             e.preventDefault();
             var account_num = $('#ec2_setting input[name=accountNumber]').val();
             var access_key = $('#ec2_setting input[name=accessKey]').val();
             var secret_key = $('#ec2_setting input[name=secretAccessKey]').val();
            
             var el = jQuery('.page-content');
             App.blockUI(el);

             $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/platform_setting',
                dataType : "json",
                data : {"accountNumber" : account_num, "accessKey" : access_key, "secretAccessKey" : secret_key, "manufacture" : "ec2"},
                success : function(res){
                    App.unblockUI($(el));
                    if(res.success){
                        var $toast = toastr["success"](res['message']);
                    }else{
                        var $toast = toastr["error"](res['message']);
                    }         
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("Platform Keys Save Failed.");
                }
             });

        });

        jQuery('#save_qingcloud_platform').on('click', function(e){
             e.preventDefault();
             var access_key = $('#qingcloud_setting input[name=accessKey]').val();
             var secret_key = $('#qingcloud_setting input[name=secretAccessKey]').val();
            
             var el = jQuery('.page-content');
             App.blockUI(el);

             $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/platform_setting',
                dataType : "json",
                data : {"accessKey" : access_key, "secretAccessKey" : secret_key, "manufacture" : "qingcloud"},
                success : function(res){
                    App.unblockUI($(el));
                    if(res.success){
                        var $toast = toastr["success"](res['message']);
                    }else{
                        var $toast = toastr["error"](res['message']);
                    }         
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("Platform Keys Save Failed.");
                }
             });

        });
    }

    var _getRoleAndInstance = function(manufacture){
        var el = jQuery('#addserver > form');
        App.blockUI(el);
        $.ajax({
            type : "POST",
            cache : false,
            url : '/cloudmanagers/ajax/get_role',
            dataType : "json",
            data : {"manufacture" : manufacture},
            success : function(res){
                App.unblockUI($(el));
                $('#select2_role,#select2_instancetype,#instance_resource').empty();
                $('#role_os').val('');
                $.each(res.roles_list, function(index, role){
                    $('#select2_role').append('<option value="'+role.role_id+'" data-behav="'+ role.behaviors_list[0] +'" data-os="'+role.os+'">'+role.name+'</option>')
                });
                $.each(res.instance_type_list, function(index, instance_type){
                    $('#select2_instancetype').append('<option value="'+ instance_type.id +'" data-resource="'+ instance_type.vcpu +' vCPU, '+ instance_type.vram +' GB">'+ instance_type.alias_name +'</option>');
                });

                FormComponents.init();
               
            },
            error : function(xhr, ajaxOptions, thrownError){
                App.unblockUI($(el));
                var $toast = toastr["error"]("Get Role Info Failed");
            }
        });

    }

    var handleAddServerAjax = function() {
        //handle Map location select


        jQuery('#addserver .x-icon-platform').on('click', function(){
            $('#addserver .x-icon-platform').removeClass('x-btn-pressed');
            $(this).addClass('x-btn-pressed');

            if($(this).data('platform') == "ec2"){
                var ec2_location = '\
                    <div data-location="ap-northeast-1" style="top:32px;left:182px" class="location" title="ap-northeast-1" id="location-ap-northeast-1"></div>\
                    <div data-location="ap-southeast-1" style="top:54px;left:156px" class="location" title="ap-southeast-1" id="location-ap-southeast-1"></div>\
                    <div data-location="ap-southeast-2" style="top:76px;left:186px" class="location" title="ap-southeast-2" id="location-ap-southeast-2"></div>\
                    <div data-location="eu-west-1" style="top:24px;left:88px" class="location" title="eu-west-1" id="location-eu-west-1"></div>\
                    <div data-location="sa-east-1" style="top:70px;left:68px" class="location" title="sa-east-1" id="location-sa-east-1"></div>\
                    <div data-location="us-east-1" style="top:34px;left:48px" class="location selected" title="us-east-1" id="location-us-east-1"></div>\
                    <div data-location="us-west-1" style="top:40px;left:28px" class="location" title="us-west-1" id="location-us-west-1"></div>\
                    <div data-location="us-west-2" style="top:30px;left:22px" class="location" title="us-west-2" id="location-us-west-2"></div>\
                ';
                $("#addserver .map").html(ec2_location);
                _getRoleAndInstance("ec2");

            }
            else if($(this).data('platform') == "qingcloud"){
                var qingcloud_location = '\
                    <div data-location="pek1" style="top:32px;left:160px" class="location" title="pek1" id="location-ap-northeast-1"></div>\
                    <div data-location="gd1" style="top:42px;left:160px" class="location" title="gd1" id="location-ap-southeast-1"></div>\
                ';
                $("#addserver .map").html(qingcloud_location);
                _getRoleAndInstance("qingcloud");
            }
            jQuery('#addserver .map > .location').on('click', function(){
                $('.location').removeClass('selected');
                $(this).addClass('selected');
            });            
        });


        jQuery('#addserver .map > .location').on('click', function(){
            $('.location').removeClass('selected');
            $(this).addClass('selected');
        });

        //handle Add Server Ajax request
        jQuery('#create_server').on('click', function(e){
             e.preventDefault();
             var project_id = $('input[name=newserver_projectid]').val();
             var server_name = $('input[name=newserver_name]').val();
             var role_id = $('select[name=newserver_role]').val();
             var instance_type = $('select[name=newserver_instancetype]').val();
             var platform = $('.create-server.x-icon-platform.x-btn-pressed').data('platform');
             var server_location = $('.location.selected').data('location');

             var el = jQuery('#addserver > form');
             App.blockUI(el);

             $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/create_server',
                dataType : "json",
                data : {"project_id" : project_id, "role_id" : role_id, "server_name" : server_name, "instance_type" : instance_type, "platform" : platform, "server_location" : server_location},
                success : function(res){
                    //App.unblockUI($(el));
                    var $toast = toastr["success"]("Server Successfully Created.<br/>The page will refresh in 2 seconds.");
                    var newUrl = '/cloudmanagers/project/' +  project_id;
                    _redirect(2000, newUrl);  
                    console.log(res);
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("Server Create Failed");
                }
             });

        });
    }

    var handleUserSettingAjax = function(){
        jQuery('#save_userinfo').on('click', function(e){
            e.preventDefault();
             var fullName = $('input[name=fullName]').val();
             var phone = $('input[name=phone]').val();
             var country = $('select[name=country]').val();

             var el = jQuery('.page-content');
             App.blockUI(el);

             $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/client_setting',
                dataType : "json",
                data : {"fullName" : fullName, "phone" : phone, "country" : country},
                success : function(res){
                    App.unblockUI($(el));
                    var $toast = toastr["success"]("Your settings have been saved.");
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("User Setting Failed");
                }
             });

        });
    }

    var handleUpdateServerTable = function(){
        jQuery('body').on('click', '#update_server_table', function (e) {
            e.preventDefault();
            var el = jQuery(this).closest(".portlet").children(".portlet-body");
            App.blockUI(el);

            var project_id = $('input[name=newserver_projectid]').val();

            $.ajax({
                type : "POST",
                cache : false,
                url : '/cloudmanagers/ajax/get_server_list',
                dataType : "json",
                data : {"project_id" : project_id},
                success : function(res){
                    $.each(res, function(index, server){
                        server_ele = $('tr[data-server='+server.id+']');
                        server_ele.data('status', server.status);
                        server_ele.data('publicdns', server.publicDNS);
                        server_ele.data('publicip', server.publicIP);
                        server_ele.data('privateip', server.innerIPAddress);
                        server_ele.data('secretgroup', server.secretGroup);

                        server_ele.children('.td-status').html('<span class="label label-sm label-'+server.status+'" >'+ server.status +'</span>');
                        server_ele.children('.td-pubip').html(server.publicIP ? server.publicIP : 'None');
                    });
                    App.unblockUI($(el));
                },
                error : function(xhr, ajaxOptions, thrownError){
                    App.unblockUI($(el));
                    var $toast = toastr["error"]("Update Server List Failed");
                }
             });
        });

    }


    // Helper function to calculate sidebar height for fixed sidebar layout.
    var _calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = $(window).height() - $('.header').height() + 1;
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.footer').outerHeight();
        }

        return sidebarHeight;
    }

    // Handles fixed sidebar
    var handleFixedSidebar = function () {
        var menu = $('.page-sidebar-menu');

        if (menu.parent('.slimScrollDiv').size() === 1) { // destroy existing instance before updating the height
            menu.slimScroll({
                destroy: true
            });
            menu.removeAttr('style');
            $('.page-sidebar').removeAttr('style');
        }

        if ($('.page-sidebar-fixed').size() === 0) {
            handleSidebarAndContentHeight();
            return;
        }

        var viewport = _getViewPort();
        if (viewport.width >= 992) {
            var sidebarHeight = _calculateFixedSidebarViewportHeight();

            menu.slimScroll({
                size: '7px',
                color: '#a1b2bd',
                opacity: .3,
                position: isRTL ? 'left' : 'right',
                height: sidebarHeight,
                allowPageScroll: false,
                disableFadeOut: false
            });
            handleSidebarAndContentHeight();
        }
    }

    // Handles the sidebar menu hover effect for fixed sidebar.
    var handleFixedSidebarHoverable = function () {
        if ($('body').hasClass('page-sidebar-fixed') === false) {
            return;
        }

        $('.page-sidebar').off('mouseenter').on('mouseenter', function () {
            var body = $('body');

            if ((body.hasClass('page-sidebar-closed') === false || body.hasClass('page-sidebar-fixed') === false) || $(this).hasClass('page-sidebar-hovering')) {
                return;
            }

            body.removeClass('page-sidebar-closed').addClass('page-sidebar-hover-on');
            $(this).addClass('page-sidebar-hovering');
            $(this).animate({
                width: sidebarWidth
            }, 400, '', function () {
                $(this).removeClass('page-sidebar-hovering');
            });
        });

        $('.page-sidebar').off('mouseleave').on('mouseleave', function () {
            var body = $('body');

            if ((body.hasClass('page-sidebar-hover-on') === false || body.hasClass('page-sidebar-fixed') === false) || $(this).hasClass('page-sidebar-hovering')) {
                return;
            }

            $(this).addClass('page-sidebar-hovering');
            $(this).animate({
                width: sidebarCollapsedWidth
            }, 400, '', function () {
                $('body').addClass('page-sidebar-closed').removeClass('page-sidebar-hover-on');
                $(this).removeClass('page-sidebar-hovering');
            });
        });
    }

    // Handles sidebar toggler to close/hide the sidebar.
    var handleSidebarToggler = function () {
        var viewport = _getViewPort();
        if ($.cookie('sidebar_closed') === '1' && viewport.width >= 992) {
            $('body').addClass('page-sidebar-closed');
        }

        // handle sidebar show/hide
        $('.page-sidebar').on('click', '.sidebar-toggler', function (e) {
            var body = $('body');
            var sidebar = $('.page-sidebar');

            if ((body.hasClass("page-sidebar-hover-on") && body.hasClass('page-sidebar-fixed')) || sidebar.hasClass('page-sidebar-hovering')) {
                body.removeClass('page-sidebar-hover-on');
                sidebar.css('width', '').hide().show();
                $.cookie('sidebar_closed', '0');
                e.stopPropagation();
                runResponsiveHandlers();
                return;
            }

            if (body.hasClass("page-sidebar-closed")) {
                body.removeClass("page-sidebar-closed");
                if (body.hasClass('page-sidebar-fixed')) {
                    sidebar.css('width', '');
                }
                $.cookie('sidebar_closed', '0');
            } else {
                body.addClass("page-sidebar-closed");
                $.cookie('sidebar_closed', '1');
            }
            runResponsiveHandlers();
        });
    }

    var handleQuickSearch = function() {

        // handle search for header search input on enter press
        $('.search-form-header').on('keypress', 'input.form-control', function (e) {
            if (e.which == 13) {
                $('.search-form-header').submit();
                return false;
            }
        });

        // handle search for header search input on icon click
        $('.search-form-header').on('click', '.icon-search', function (e) {
            $('.search-form-header').submit();
            return false;
        });

        // handle search for sidebar search input on enter press
        $('.search-form-sidebar').on('keypress', 'input.form-control', function (e) {
            if (e.which == 13) {
                $('.search-form-sidebar').submit();
                return false;
            }
        });

        // handle search for sidebar search input on icon click
        $('.search-form-sidebar').on('click', '.icon-search', function (e) {
            $('.search-form-sidebar').submit();
            return false;
        });
    }

    // Handles the go to top button at the footer
    var handleGoTop = function () {
        /* set variables locally for increased performance */
        jQuery('.footer').on('click', '.go-top', function (e) {
            App.scrollTo();
            e.preventDefault();
        });
    }

    // Handles portlet tools & actions
    var handlePortletTools = function () {
        jQuery('body').on('click', '.portlet > .portlet-title > .tools > a.remove', function (e) {
            e.preventDefault();
            jQuery(this).closest(".portlet").remove();
        });

/*        jQuery('body').on('click', '.portlet > .portlet-title > .tools > a.reload', function (e) {
            e.preventDefault();
            var el = jQuery(this).closest(".portlet").children(".portlet-body");
            App.blockUI(el);
            window.setTimeout(function () {
                App.unblockUI(el);
            }, 1000);
        });*/

        jQuery('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function (e) {
            e.preventDefault();
            var el = jQuery(this).closest(".portlet").children(".portlet-body");
            if (jQuery(this).hasClass("collapse")) {
                jQuery(this).removeClass("collapse").addClass("expand");
                el.slideUp(200);
            } else {
                jQuery(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
            }
        });
    }

    // Handles custom checkboxes & radios using jQuery Uniform plugin
    var handleUniform = function () {
        if (!jQuery().uniform) {
            return;
        }
        var test = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle, .star)");
        if (test.size() > 0) {
            test.each(function () {
                if ($(this).parents(".checker").size() == 0) {
                    $(this).show();
                    $(this).uniform();
                }
            });
        }
    }

    // Handles Bootstrap Accordions.
    var handleAccordions = function () {
        var lastClicked;
        //add scrollable class name if you need scrollable panes
        jQuery('body').on('click', '.accordion.scrollable .accordion-toggle', function () {
            lastClicked = jQuery(this);
        }); //move to faq section

        jQuery('body').on('show.bs.collapse', '.accordion.scrollable', function () {
            jQuery('html,body').animate({
                scrollTop: lastClicked.offset().top - 150
            }, 'slow');
        });
    }

    // Handles Bootstrap Tabs.
    var handleTabs = function () {
        // fix content height on tab click
        $('body').on('shown.bs.tab', '.nav.nav-tabs', function () {
            handleSidebarAndContentHeight();
        });

        //activate tab if tab id provided in the URL
        if (location.hash) {
            var tabid = location.hash.substr(1);
            $('a[href="#' + tabid + '"]').click();
        }
    }

    // Handles Bootstrap Modals.
    var handleModals = function () {

        // fix stackable modal issue: when 2 or more modals opened, closing one of modal will remove .modal-open class. 
        $('body').on('hide.bs.modal', function () {
           if ($('.modal:visible').size() > 1 && $('html').hasClass('modal-open') == false) {
              $('html').addClass('modal-open');
           } else if ($('.modal:visible').size() <= 1) {
              $('html').removeClass('modal-open');
           }
        });
    }

    // Handles Bootstrap Tooltips.

    // Handles Bootstrap Dropdowns

    // Handle Hower Dropdowns
    var handleDropdownHover = function () {
        $('[data-hover="dropdown"]').dropdownHover();
    }

    // Handles Bootstrap Popovers

    // last popep popover


    // Handles scrollable contents using jQuery SlimScroll plugin.
    var handleScrollers = function () {
        $('.scroller').each(function () {
            var height;
            if ($(this).attr("data-height")) {
                height = $(this).attr("data-height");
            } else {
                height = $(this).css('height');
            }
            $(this).slimScroll({
                size: '7px',
                color: ($(this).attr("data-handle-color")  ? $(this).attr("data-handle-color") : '#a1b2bd'),
                railColor: ($(this).attr("data-rail-color")  ? $(this).attr("data-rail-color") : '#333'),
                position: isRTL ? 'left' : 'right',
                height: height,
                alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
                railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
                disableFadeOut: true
            });
        });
    }

    // Handles Image Preview using jQuery Fancybox plugin


    // Fix input placeholder issue for IE8 and IE9
    var handleFixInputPlaceholderForIE = function () {
        //fix html5 placeholder attribute for ie7 & ie8
        if (isIE8 || isIE9) { // ie8 & ie9
            // this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
            jQuery('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function () {

                var input = jQuery(this);

                if (input.val() == '' && input.attr("placeholder") != '') {
                    input.addClass("placeholder").val(input.attr('placeholder'));
                }

                input.focus(function () {
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                });

                input.blur(function () {
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                });
            });
        }
    }

    // Handle Theme Settings
    var handleTheme = function () {

        var panel = $('.theme-panel');

        if ($('body').hasClass('page-boxed') == false) {
            $('.layout-option', panel).val("fluid");
        }

        $('.sidebar-option', panel).val("default");
        $('.header-option', panel).val("fixed");
        $('.footer-option', panel).val("default");

        //handle theme layout
        var resetLayout = function () {
            $("body").
            removeClass("page-boxed").
            removeClass("page-footer-fixed").
            removeClass("page-sidebar-fixed").
            removeClass("page-header-fixed");

            $('.header > .header-inner').removeClass("container");

            if ($('.page-container').parent(".container").size() === 1) {
                $('.page-container').insertAfter('body > .clearfix');
            }

            if ($('.footer > .container').size() === 1) {
                $('.footer').html($('.footer > .container').html());
            } else if ($('.footer').parent(".container").size() === 1) {
                $('.footer').insertAfter('.page-container');
            }

            $('body > .container').remove();
        }

        var lastSelectedLayout = '';

        var setLayout = function () {

            var layoutOption = $('.layout-option', panel).val();
            var sidebarOption = $('.sidebar-option', panel).val();
            var headerOption = $('.header-option', panel).val();
            var footerOption = $('.footer-option', panel).val();

            if (sidebarOption == "fixed" && headerOption == "default") {
                alert('Default Header with Fixed Sidebar option is not supported. Proceed with Fixed Header with Fixed Sidebar.');
                $('.header-option', panel).val("fixed");
                $('.sidebar-option', panel).val("fixed");
                sidebarOption = 'fixed';
                headerOption = 'fixed';
            }

            resetLayout(); // reset layout to default state

            if (layoutOption === "boxed") {
                $("body").addClass("page-boxed");

                // set header
                $('.header > .header-inner').addClass("container");
                var cont = $('body > .clearfix').after('<div class="container"></div>');

                // set content
                $('.page-container').appendTo('body > .container');

                // set footer
                if (footerOption === 'fixed') {
                    $('.footer').html('<div class="container">' + $('.footer').html() + '</div>');
                } else {
                    $('.footer').appendTo('body > .container');
                }
            }

            if (lastSelectedLayout != layoutOption) {
                //layout changed, run responsive handler:
                runResponsiveHandlers();
            }
            lastSelectedLayout = layoutOption;

            //header
            if (headerOption === 'fixed') {
                $("body").addClass("page-header-fixed");
                $(".header").removeClass("navbar-static-top").addClass("navbar-fixed-top");
            } else {
                $("body").removeClass("page-header-fixed");
                $(".header").removeClass("navbar-fixed-top").addClass("navbar-static-top");
            }

            //sidebar
            if (sidebarOption === 'fixed') {
                $("body").addClass("page-sidebar-fixed");
            } else {
                $("body").removeClass("page-sidebar-fixed");
            }

            //footer 
            if (footerOption === 'fixed') {
                $("body").addClass("page-footer-fixed");
            } else {
                $("body").removeClass("page-footer-fixed");
            }

            handleSidebarAndContentHeight(); // fix content height            
            handleFixedSidebar(); // reinitialize fixed sidebar
            handleFixedSidebarHoverable(); // reinitialize fixed sidebar hover effect
        }

        // handle theme colors
        var setColor = function (color) {
            $('#style_color').attr("href", "/static/cloudmanagers/css/themes/" + color + ".css");
            $.cookie('style_color', color);
        }

        var setPattern = function (pattern) {
            $.cookie('style_pattern', pattern);
            if (pattern == 'default') {
                $('body').removeClass("page-content-no-pattern");
            } else {
                $('body').addClass("page-content-no-pattern");
            }
        }

        $('.toggler', panel).click(function () {
            $(this).toggleClass("open");
            $('.theme-panel > .theme-options').toggle();            
        });

        $('.theme-colors > ul > li', panel).click(function () {
            var color = $(this).attr("data-style");
            setColor(color);
            $('ul > li', panel).removeClass("current");
            $(this).addClass("current");
        });

        $('.layout-option, .header-option, .sidebar-option, .footer-option', panel).change(setLayout);

        $('.pattern-option').change(function(){
            setPattern($(this).val());
        });

        if ($.cookie('style_color')) {
            setColor($.cookie('style_color'));
        }

        if ($.cookie('style_pattern')) {
            setPattern($.cookie('style_pattern'));
        }
    }

    //* END:CORE HANDLERS *//

    return {

        //main function to initiate the theme
        init: function () {

            //IMPORTANT!!!: Do not modify the core handlers call order.

            //core handlers
            handleInit(); // initialize core variables
            handleResponsiveOnResize(); // set and handle responsive    
            handleUniform(); // hanfle custom radio & checkboxes
            handleScrollers(); // handles slim scrolling contents 
            handleResponsiveOnInit(); // handler responsive elements on page load

            //layout handlers
            handleFixedSidebar(); // handles fixed sidebar menu
            handleFixedSidebarHoverable(); // handles fixed sidebar on hover effect 
            handleSidebarMenu(); // handles main menu
            handleQuickSearch(); // handles quick search
            handleSidebarToggler(); // handles sidebar hide/show            
            handleFixInputPlaceholderForIE(); // fixes/enables html5 placeholder attribute for IE9, IE8
            handleGoTop(); //handles scroll to top functionality in the footer
            handleTheme(); // handles style customer tool

            //handle ajax
            handleUserSettingAjax();
            handleCreateProjectAjax();
            handleAddServerAjax();
            handlePlatformSettingAjax();
            handleUpdateServerTable();
            

            //ui component handlers
             // handle fancy box
            handlePortletTools(); // handles portlet action bar functionality(refresh, configure, toggle, remove)
                             // handle dropdowns
            handleTabs(); // handle tabs
                          // handle bootstrap tooltips
                          // handles bootstrap popovers
            handleAccordions(); //handles accordions 
            handleModals(); // handle modals

        },

        //main function to initiate core javascript after ajax complete
        initAjax: function () {
            handleAccordions(); //handles accordions 
            handleUniform(); // hanfle custom radio & checkboxes     
            handleDropdownHover() // handles dropdown hover       
        },

        //public function to fix the sidebar and content height accordingly
        fixContentHeight: function () {
            handleSidebarAndContentHeight();
        },

        //public function to remember last opened popover that needs to be closed on click


        //public function to add callback a function which will be called on window resize
        addResponsiveHandler: function (func) {
            responsiveHandlers.push(func);
        },

        // useful function to make equal height for contacts stand side by side
        setEqualHeight: function (els) {
            var tallestEl = 0;
            els = jQuery(els);
            els.each(function () {
                var currentHeight = $(this).height();
                if (currentHeight > tallestEl) {
                    tallestColumn = currentHeight;
                }
            });
            els.height(tallestEl);
        },

        // wrapper function to scroll(focus) to an element
        scrollTo: function (el, offeset) {
            pos = (el && el.size() > 0) ? el.offset().top : 0;
            jQuery('html,body').animate({
                scrollTop: pos + (offeset ? offeset : 0)
            }, 'slow');
        },

        // function to scroll to the top
        scrollTop: function () {
            App.scrollTo();
        },

        // wrapper function to  block element(indicate loading)
        blockUI: function (el, centerY) {
            var el = jQuery(el);
            if (el.height() <= 400) {
                centerY = true;
            }
            el.block({
                message: '<img src="/static/cloudmanagers/img/ajax-loading.gif" align="">',
                centerY: centerY != undefined ? centerY : true,
                css: {
                    top: '10%',
                    border: 'none',
                    padding: '2px',
                    backgroundColor: 'none',
                },
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: 0.05,
                    cursor: 'wait'
                },
                baseZ : 10060
            });
        },

        // wrapper function to  un-block element(finish loading)
        unblockUI: function (el) {
            jQuery(el).unblock({
                onUnblock: function () {
                    jQuery(el).removeAttr("style");
                }
            });
        },

        // initializes uniform elements
        initUniform: function (els) {
            if (els) {
                jQuery(els).each(function () {
                    if ($(this).parents(".checker").size() == 0) {
                        $(this).show();
                        $(this).uniform();
                    }
                });
            } else {
                handleUniform();
            }

        },

        //wrapper function to update/sync jquery uniform checkbox & radios
        updateUniform: function (els) {
            $.uniform.update(els); // update the uniform checkbox & radios UI after the actual input control state changed
        },

        //public function to initialize the fancybox plugin

        //public helper function to get actual input value(used in IE9 and IE8 due to placeholder attribute not supported)
        getActualVal: function (el) {
            var el = jQuery(el);
            if (el.val() === el.attr("placeholder")) {
                return "";
            }
            return el.val();
        },

        //public function to get a paremeter by name from URL
        getURLParameter: function (paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },

        // check for device touch support
        isTouchDevice: function () {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        },

        // check IE8 mode
        isIE8: function () {
            return isIE8;
        },

        // check IE9 mode
        isIE9: function () {
            return isIE9;
        },

        //check RTL mode
        isRTL: function () {
            return isRTL;
        },

        // get layout color code by color name
        getLayoutColorCode: function (name) {
            if (layoutColorCodes[name]) {
                return layoutColorCodes[name];
            } else {
                return '';
            }
        }

    };

}();


var NotifySocket = function(){
    var initOmnibus = function(omnibus_user, omnibus_endpoint, omnibus_auth_token) {
        var transport = WebSocket; 
        var endpoint = omnibus_endpoint;
        var options = {authToken: omnibus_auth_token};

        var connection = new Omnibus(transport, endpoint, options);
        var channel = connection.openChannel(omnibus_user);

/*        // Add events on connection:
        connection
        .on(Omnibus.events.CONNECTION_CONNECTED, function(event) {
            //$('.connection').addClass('open').text('Yes');
            console.log('conneted');
        })
        .on(Omnibus.events.CONNECTION_AUTHENTICATED, function(event) {
            //$('.identification').addClass('open').text('Yes');
            console.log('CONNECTION_AUTHENTICATED')
        });*/

        // Add events on channel:
        channel
/*        .on(Omnibus.events.CHANNEL_SUBSCRIBED, function(event) {
            //$('.channel').addClass('open').text('Yes');
            console.log('CHANNEL_SUBSCRIBED')
        })*/
        .on('update_instance', function (event) {
            console.log(event);
            // handle mouse moves form other users...
            if(event.data.sender == 'server'){
                var $toast = toastr["info"]("Server Status Updated.<br/> The status of your server <strong>\""+event.data.payload.name+"\"</strong> changed to <strong>"+event.data.payload.status+"</strong>.");
            }else{
                console.log("Ignoring messages from nowhere");
            }
        })
        .on('disconnect', function (event) {
            console.log('disconnect');
        });

        // Add mouse move event on window to send own mouse moves:
/*        $('body').click(function(e) {
            channel.send('update_instance', {top: e.pageY, left: e.pageX});
        });*/
    }

    return {
        init : function(omnibus_user, omnibus_endpoint, omnibus_auth_token){
            initOmnibus(omnibus_user, omnibus_endpoint, omnibus_auth_token);
        }
    }

    

}();