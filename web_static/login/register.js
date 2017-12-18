(function() {
    'use strict';
    angular.module('bhApp', ['beehub'])
        .controller('RegisterCtrl', function($scope, $http, bhDialog, bhUtils) {
            function display_error(error_msg) {
                angular.element('bh-captcha').controller('bhCaptcha').get_captcha();
                bhDialog.open('', 'Đăng ký lỗi', error_msg);
            }
            $('[ng-model="username"]').focus();

            function register_callback(promise) {
                promise.then(
                    function(response) {
                        var data = response.data;
                        if (data.status === 1) {
                            // success
                            bhDialog.open('alert-success', 'Đăng ký thành công',
                                    'Chúc mừng bạn đã đăng ký thành công. Bạn có thể đóng cửa sổ này lại')
                                .on('hidden.bs.modal', function() {
                                    var ret_url = bhUtils.get_param('ret', window.location.hash),
                                        extra_param;
                                    if (!ret_url) {
                                        ret_url = $('#ret_url').val();
                                        if (ret_url) {
                                            extra_param = 'username=' + data.data.username + '&accesstoken=' + data.data.accesstoken;
                                            ret_url += '?' + extra_param;

                                        }
                                    }
                                    if (ret_url) {
                                        window.location = ret_url;
                                    }
                                });
                        } else {
                            display_error(data.msg);
                        }
                    },
                    function(response) {
                        display_error(response.statusText);
                    });
            }

            $scope.register = function() {
                if ($scope.password !== $scope.password_again) {
                    display_error('Mật khẩu nhập lại không đúng');
                } else {
                    register_callback($http({
                        method: 'POST',
                        url: '/iplay/register',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: $.param({
                            username: $scope.username,
                            email: $scope.email,
                            password: $scope.password,
                            captcha: $scope.captcha,
                            captcha_token: angular.element('bh-captcha').controller('bhCaptcha').get_captcha_token(),
                            devtoken: ''
                        }) + window.location.search.replace('?', '&')
                    }));
                }
            };

            function quick_reg(network, accesstoken) {
                register_callback($http({
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
        });
})();
