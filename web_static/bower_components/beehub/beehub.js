(function() {
	'use strict';

	window.beehub = {
		get_current_scope: function() {
			return angular.element('script').last().scope();
		}
	};

	angular.module('beehub', ['ngCookies', 'chart.js'])
		.config(function(ChartJsProvider, $cookiesProvider) {
			Chart.Tooltip.positioners.top = function (elements, eventPosition) {
				return {
					x: eventPosition.x,
					y: 10
				};
			};
			ChartJsProvider.setOptions({
				legend: { display: true },
				scales: {
					yAxes: [{ ticks: { suggestedMin: 0 } }]
				},
				tooltips: {
					callbacks: {
						label: function(tooltip_ttem) {
							return tooltip_ttem.xLabel + ': ' + tooltip_ttem.yLabel.toLocaleString();
						}
					}
				}
			});
			$cookiesProvider.defaults.path = '/';
		})
		.directive('bhCaptcha', function() {
			return {
				scope: true,
				controller: function($http, $element, $scope) {
					this.get_captcha = $scope.get_captcha = function() {
						$http.get('/captcha').then(function(response) {
							var resp = response.data;
							$scope.captcha_token = resp.data.captcha_token;
							$scope.captcha_image = resp.data.captcha_image;
						});
					};
					this.get_captcha_token = function() {
						return $scope.captcha_token;
					};
					this.get_captcha();
				},
				template: '<img ng-src="data:image/png;base64, {\{ captcha_image \}}" alt="Captcha">' +
					'<input type="hidden" name="captcha_token" value="{{ captcha_token }}">' +
					'<a href="" class="refresh-captcha" ng-click="get_captcha()"><img src="data:image/png;base64,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"></img></a>'
			};
		})
		.directive('bhCounter', function() {
			return {
				link: function(scope, element, attrs) {
					var counter = attrs.counter || 50,
						text_id = new Date().getDate(),
						host = window.location.host,
						text_list = ['Gac', 'Oi', 'Xoai', 'Bi', 'Chuoi', 'Tao', 'Le', 'Cam', 'Quat', 'Chanh', 'Dao', 'Man', 'May', 'Va', 'Xe', 'Iphone', 'Bay', 'Luon', 'Phi', 'Cong', 'Toi', 'Gung', 'Gun', 'Ganh', 'Bu', 'Lop', 'Truong', 'Hung', 'Anh', 'Em', 'Long', 'Kinh', 'Gas', 'Ga', 'Oii', 'Xai', 'Bin', 'Choi', 'To', 'Len', 'Ca', 'Quan', 'Chan', 'Daoh', 'Mang', 'Ma', 'Vay', 'Xenh', 'Ipho', 'Bayh', 'Lun', 'Phing', 'Con', 'Tonh', 'Gun', 'Gung', 'Gaung', 'Bun', 'Dau', 'Truon', 'Hun', 'Em', 'Anh', 'Lon', 'Kin', 'Gay'];
					for (var i = 0; i < host.length; i += 1) {
						text_id += host.charCodeAt(i);
					}
					var update_counter = function () {
						if (counter > 0) {
							element.text(counter);
							counter -= 1;
							setTimeout(update_counter, 1000);
						}
						else {
							element.text(text_list[text_id % text_list.length]);
						}
					};
					update_counter();
				}
			};
		})

	.factory('bhUtils', function($templateCache) {
		function get_param(name, url) {
			if (!url) {
				url = window.location.href;
			}
			name = name.replace(/[\[\]]/g, '\\$&');
			var regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url);
			if (!results) {
				return null;
			}
			if (!results[2]) {
				return '';
			}
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}

		function parse_params(str) {
			str = str || '';
			return str.split('&').reduce(function(params, param) {
				var paramSplit = param.split('=').map(function(value) {
					return decodeURIComponent(value.replace(/\+/g, ' '));
				});
				params[paramSplit[0]] = paramSplit[1];
				return params;
			}, {});
		}

		function get_form_params(submit_elm) {
			var params = {},
				submit_jelm = $(submit_elm),
				form_elm = submit_jelm.parents('form,.bh-form');
			form_elm.find('input,select,textarea').each(function(i, raw_element) {
				var element = angular.element(raw_element),
					ctrl = element.controller('ngModel'),
					value, option_element;
				if (ctrl && angular.isString(ctrl.$viewValue)) {
					value = ctrl.$viewValue;
				}
				else if (element.attr('type') === 'checkbox') {
					value = element.prop('checked');
				}
				else if (raw_element.tagName === 'SELECT') {
					option_element = raw_element.options[raw_element.selectedIndex];
					if (ctrl) {
						value = option_element.text;
					}
					else {
						value = option_element.value || option_element.text;
					}
				}
				else {
					value = element.val();
				}
				if (element.attr('name')) {
					if (value && value.replace) {
						value = value.replace(/\s{2,}/g, ' ');
					}
					params[element.attr('name')] = value || '';
				}
			});
			params.action = submit_jelm.attr('name') || '';
			return params;
		}

		function ng_include_scope($scope) {
			$scope.include_url = '';
			$scope.set_include_url = function (new_url) {
				var not_cache_param = '_=' + new Date().getTime(),
					cont_char = new_url.indexOf('?') > -1 ? '&' : '?';
				$scope.include_url = new_url + cont_char + not_cache_param;
				$templateCache.removeAll();
			};
			$scope.get_include_url = function () {
				return $scope.include_url;
			};
			$scope.fetch = function ($event) {
				var params = get_form_params($event.currentTarget),
					new_url = $scope.include_url.split('?')[0];
				$scope.set_include_url(new_url + '?' + $.param(params));
			};
			$scope.continue_fetch = function (new_params) {
				var url = $scope.include_url.split('?'),
					old_params = parse_params(url[1]);
				angular.extend(old_params, new_params);
				$scope.set_include_url(url[0] + '?' + $.param(old_params));
			};
			$scope.fetch_page = function (page_no) {
				$scope.continue_fetch({page: page_no});
			};
		}
		return {
			get_param: get_param,
			parse_params: parse_params,
			get_form_params: get_form_params,
			ng_include_scope: ng_include_scope
		};
	})

	.factory('bhDialog', function() {
		var service = {};

		$('body').append('<div class="modal fade" id="bh_diablog">' +
			'<div class="modal-dialog modal-sm" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-header" style="background: linear-gradient(#fefefe, #eeeeee); box-shadow: 0px 1px 1px 0px #8e8e8e; opacity: 1;">' +
			'<button type="button" class="close" style="opacity: 1;" data-dismiss="modal"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABAlBMVEUAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAzB94LAAAAVXRSTlMAAiA+VWNqBzdkbCVia2loAUBbNRwLAwUQWklnWSM9ZUUkNl4/NGFSBF0fKUoxMyYeTk05OC0yT1FTOjwvF1dUCDtYUEwVLioYRh0rLCdHGhtWMEgZoEy1+wAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAHySURBVCjPbVNrY6IwEAw1pdiq4OnJGSnY1or0tG3iK1hLLEStei97/f+/5UIQnzcfYCcTspvZBYAUylkGnqvqOcycKeAYF1r2cousdnGoXuUu82qhUNB18VDz+dzVnmgUhaZ/KZW/Vsxv5VJVFzuKxlZFql6zrnf82qrpKkq5Xag5dXM/l1l0aoVMEt/oTlYzDmsBt1lHv5E13zm5xslNQCPn3MX13ztNt3Uqt9ymcy/c8JreQ8y/tzvSDuWx/RS/H4SggOemh2XiNsGa0CtdTJCsH3vNZ9DzrL48bTCk/kipvPh0OJYLfcvrAVSFr4nnXR8GdiOAvpZ4/gqrCLDAnWx68hZaAmF305GJGzAQsChtkGJb1ar1tqURCwBzccorjVDA3srYZYBEfHN4xfYl0s8nJCKgiPk0UV8oJo8lguko0accF8GM8LlkPcrR2FA6iNOSXJhzMgbvhC+kLRSjvgiUMcJU2rLg5B0oCxIt5Wa0ktuUH+hn/F5GZCGyPBHa/l9L2pTE3psLykan8ojRX3JEfovrD47HoSPs+pOEMx+G9sH5rVEI/Vk6eppoBl/uRnFJgrW/my/jw4driFbTiWFMpqu/gvgf++nKHELIWOwpYyLk5cNSzPlwHQRxS8JgPZyb4BjK56BOw5DWB5+7X/Af9thGnlXPC6QAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTYtMTEtMDFUMTQ6NTY6MDIrMDc6MDA/0lG1AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE2LTExLTAxVDE0OjU2OjAyKzA3OjAwTo/pCQAAAABJRU5ErkJggg=="></img></button>' +
			'<h5 class="modal-title" style="text-align: center;">Thông báo</h5>' +
			'</div>' +
			'<div class="modal-body">' +
			'<p></p>' +
			'</div>' +
			'<div class="modal-footer">' +
			'<button type="button" class="btn btn-danger-outline" data-dismiss="modal">Đóng lại</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>');

		service.open = function(type, title, body) {
			$('#bh_diablog .modal-body p').html(body);
			$('#bh_diablog .modal-title').text(title);
			$('#bh_diablog .modal-header').attr('class', 'modal-header').addClass(type);
			return $('#bh_diablog').modal({backdrop: 'static'});
		};

		return service;
	});
})();
