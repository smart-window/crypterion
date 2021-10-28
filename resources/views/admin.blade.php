<!DOCTYPE html>
<html lang="en">
<head>
	@php $themeType = $data['settings']['themeType']; @endphp
	<meta charset="utf-8">
	<meta name="csrf-token" content="{{csrf_token()}}">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<script src="//polyfill.io/v3/polyfill.min.js" type="text/javascript"></script>
	
	<link rel="shortcut icon" type="image/x-icon" href="{{settings('brand')->favicon_url ?: asset('favicon.ico')}}">
	<link rel="icon" type="image/x-icon" href="{{settings('brand')->favicon_url ?: asset('favicon.ico')}}"/>
	<link rel="stylesheet" href="{{mix('css/vendor.css')}}" type="text/css"/>
	
	@if($themeType === 'THEME_TYPE_DARK')
		<link rel="stylesheet" href="{{mix('css/dark.css')}}" type="text/css"/>
	@else
		<link rel="stylesheet" href="{{mix('css/index.css')}}" type="text/css"/>
	@endif
	
	<link rel="stylesheet" href="{{asset('loader.css')}}" type="text/css"/>
	
	@if(config('broadcasting.default') === "pusher")
		<script src="{{asset('vendor/pusher.js')}}" type="text/javascript"></script>
	@elseif(config('broadcasting.default') === "redis")
		<script src="{{asset('vendor/socket.js')}}" type="text/javascript"></script>
	@endif
	
	
	<script type="text/javascript">
		window.less = {
			env               : "production",
			javascriptEnabled : true,
			@if($themeType === 'THEME_TYPE_DARK')
			modifyVars        : {!! json_encode(array_only($palettes, ['@primary-color', '@secondary-color', '@nav-dark-bg', '@nav-dark-text-color'])) !!},
			@else
			modifyVars        : @json($palettes),
			@endif
		}
		window.__APP__ = @json($data);
	</script>
	
	@if($themeType === 'THEME_TYPE_DARK')
		<link rel="stylesheet/less" href="{{asset('less/dark.less')}}" type="text/css"/>
	@else
		<link rel="stylesheet/less" href="{{asset('less/index.less')}}" type="text/css"/>
	@endif
	
	<script type="text/javascript" src="{{asset('vendor/less.min.js')}}"></script>
	<title>{{config('app.name')}}</title>
</head>
<body>
	<noscript>
		You need to enable JavaScript to run this app.
	</noscript>
	
	<div id="root">
		<div class="loader">
			<div class="content">
				<img src="{{settings('brand')->logo_icon_url ?: asset('images/logo-icon.png')}}" alt="{{config('app.name')}}">
			</div>
		</div>
	</div>
	
	<script type="text/javascript" src="{{asset('vendor/pace.min.js')}}"></script>
	<script type="text/javascript" src="{{mix('js/admin/index.js')}}"></script>
</body>
</html>
