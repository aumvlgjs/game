(function() {
    'use strict';
    angular.module('bhApp', ['beehub'])
        .controller('BeehubCtrl', function($scope, $http, $cookies, bhUtils, bhDialog) {
            var ret = bhUtils.get_param('ret', window.location.search) || '/',
                username = bhUtils.get_param('username', window.location.hash),
                accesstoken = bhUtils.get_param('accesstoken', window.location.hash);
            if (username && accesstoken) {
                $cookies.put('i_username', username);
                $cookies.put('i_accesstoken', accesstoken);
                if (ret) {
                    window.location = ret;
                }
            }

            function login_callback(promise) {
                promise.then(
                    function(response) {
                        var data = response.data, account_select;
                        if (data.status === 1) {
                            // success
                            $cookies.put('i_username', data.data.username);
                            $cookies.put('i_accesstoken', data.data.accesstoken);
                            window.location = ret;
                        } else if (data.status === 35) {
                            account_select = '<p>Vui lòng chọn 1 trong các tài khoản dưới đây để đăng nhập</p><ul>';
                            angular.forEach(data.data, function (user) {
                                account_select += '<li><a href="#" class="account_select" data="' + user.otp_code + '">' + user.username + '</a></li>';
                            });
                            account_select += '</ul>';
                            bhDialog.open('', 'Thông báo', account_select);
                            $('.account_select').off('click');
                            $('.account_select').on('click', function (e) {
                                $scope.login_otp($(e.currentTarget).attr('data'));
                            });
                        } else {
                            bhDialog.open('', 'Có lỗi xảy ra', data.msg);
                            angular.element('bh-captcha').controller('bhCaptcha').get_captcha();
                        }
                    },
                    function(response) {
                        angular.element('bh-captcha').controller('bhCaptcha').get_captcha();
                        bhDialog.open('', 'Có lỗi xảy ra', response.status + ' ' + response.statusText);
                    });
            }

            $scope.login = function(form_id) {
                form_id = form_id || '';
                login_callback($http({
                    method: 'POST',
                    url: '/iplay/login',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param({
                        username: $scope.username,
                        password: $scope.password,
                        captcha: $scope.captcha,
                        captcha_token: angular.element(form_id + ' bh-captcha').controller('bhCaptcha').get_captcha_token()
                    })
                }));
            };

            $scope.convert_form = function () {
                $scope.is_username = 1 - $scope.is_username;
                if ($scope.is_username === 1) {
                    $('#convert_form').text('Nhấp vào đây để đăng nhập bằng số điện thoại hoặc email dùng để kích hoạt');
                    $('#mobile_field').hide();
                    $('#username_field').show();
                }
                else {
                    $('#convert_form').text('Nhấp vào đây để đăng nhập bằng tên tài khoản');
                    $('#mobile_field').show();
                    $('#username_field').hide();
                }
            };
            $scope.is_username = 1;
            $scope.convert_form();

            $scope.mlogin = function(form_id) {
                if ($scope.is_username) {
                    $scope.login();
                }
                else {
                    form_id = form_id || '';
                    login_callback($http({
                        method: 'POST',
                        url: '/mlogin',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: $.param({
                            email_mobile: $scope.email_mobile,
                            password: $scope.password,
                            captcha: $scope.captcha,
                            captcha_token: angular.element(form_id + ' bh-captcha').controller('bhCaptcha').get_captcha_token()
                        })
                    }));
                }
            };

            $scope.login_otp = function (otp_code) {
                login_callback($http({
                    method: 'POST',
                    url: '/user/v1/login_otp',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param({
                        otp_code: otp_code,
                        game: 'IPLAY',
                        platform: 'WEB',
                        devtoken: '1',
                        cp: $('#cp').val()
                    })
                }));
            };

            function quick_reg(network, accesstoken) {
                login_callback($http({
                    method: 'POST',
                    url: '/user/v1/quickreg',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param({
                        accesstoken: accesstoken,
                        socialname: network,
                        game: 'IPLAY',
                        platform: 'WEB',
                        devtoken: '1',
                        cp: $('#cp').val()
                    })
                }));
            }

            $scope.oauth_login = function(network) {
                var oauth_provider = hello(network);
                oauth_provider.login().then(function() {
                    quick_reg(network.toUpperCase(), oauth_provider.getAuthResponse().access_token);
                }).then(function(e) {
                    window.alert('Signin error: ' + e.error.message);
                });
            };

            $('.game-item').click(function () {
                bhDialog.open('', 'Thông báo', 'Vui lòng đăng nhập để chơi game.').on('hidden.bs.modal', function () {
                    $('[ng-model="username"]').focus();
                });
            });

            $scope.forgot_password = function() {
                $('#forgot_password_form').modal('show');
            };
            $scope.send_forgot_password = function() {
                $('#forgot_password_form').modal('hide');
                $http({
                    method: 'POST',
                    url: '/user/v1/forget_password',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param({
                        email: $scope.email
                    })
                }).then(
                    function(response) {
                        var data = response.data;
                        if (data.status === 1) {
                            // success
                            bhDialog.open('alert-success', 'Thành công', 'Bạn vui lòng kiểm tra hòm thư để nhận mật khẩu mới.');
                        } else {
                            bhDialog.open('', 'Có lỗi xảy ra', data.msg);
                        }
                    },
                    function(response) {
                        bhDialog.open('', 'Có lỗi xảy ra', response.status + ' ' + response.statusText);
                    });
            };
        });

    // google analytics
    eval('(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,"script","https://www.google-analytics.com/analytics.js","ga"); ga("create", "UA-64957673-4", "auto"); ga("send", "pageview")');
})();
